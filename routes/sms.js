const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fetch = require('node-fetch');

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || sid.trim() === '' || token.trim() === '') return null;
  return require('twilio')(sid, token);
}

function buildSMS(d) {
  if (d.lang === 'hi') {
    return '[CropGuard AI] Kisan ' + d.farmerName + ', aapki ' + d.crop +
      ' fasal mein ' + d.disease + ' milaa. Khatra: ' + d.risk +
      '. Turant karwai karein. KCC: 1800-180-1551';
  }
  return '[CropGuard AI] Dear ' + d.farmerName + ', ' + d.disease +
    ' detected in your ' + d.crop + ' (' + d.confidence + '%). Risk: ' +
    d.risk + '. Take action NOW. KCC: 1800-180-1551';
}

// POST /api/sms/send-alert
router.post('/send-alert', auth, async (req, res) => {
  const { toNumber, farmerName } = req.body;
  const msg = buildSMS(req.body);
  const client = getTwilioClient();
  let simTelegram = { channel: 'Telegram Bot', status: 'simulated', to: '@'+(farmerName||'').replace(/\s+/g,'').toLowerCase()+'_kisan' };
  const simVoice = { channel: 'Voice Agent (ElevenLabs)', status: 'queued_for_call', to: toNumber };
  
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgToken.trim() !== '' && tgChat && tgChat.trim() !== '') {
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChat.trim(), text: msg })
      });
      if (tgRes.ok) simTelegram.status = 'delivered (LIVE)';
      else simTelegram.status = 'failed (LIVE)';
    } catch(e) { simTelegram.status = 'error (LIVE)'; }
  }

  if (!client) {
    return res.json({
      demo: true,
      message: 'Alerts simulated/sent across channels',
      channels: [ { channel: 'SMS', status: 'simulated', preview: msg }, simTelegram, simVoice ]
    });
  }
  try {
    const result = await client.messages.create({ body: msg, from: process.env.TWILIO_FROM_NUMBER, to: toNumber });
    res.json({ success: true, channels: [ { channel: 'SMS', status: 'delivered (LIVE)', sid: result.sid }, simTelegram, simVoice ] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/sms/bulk-alert
router.post('/bulk-alert', auth, async (req, res) => {
  const { farmers = [], alertMsg } = req.body;
  const client = getTwilioClient();
  if (!client) {
    return res.json({
      demo: true,
      message: 'Bulk SMS is OPTIONAL. Add Twilio keys to .env.',
      wouldSendTo: farmers.length,
      sent: 0, failed: 0
    });
  }
  let sent = 0, failed = 0;
  for (const f of farmers) {
    if (!f.mobile) { failed++; continue; }
    try {
      await client.messages.create({ body: alertMsg, from: process.env.TWILIO_FROM_NUMBER, to: f.mobile });
      sent++;
    } catch { failed++; }
  }
  res.json({ sent, failed, total: farmers.length });
});

module.exports = router;
