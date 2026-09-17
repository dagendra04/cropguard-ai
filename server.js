require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/weather', require('./routes/weather'));
app.use('/api/disease', require('./routes/disease'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/health', (req, res) => res.json({
  status: 'ok', version: '2.0.0',
  services: {
    weather: 'Open-Meteo FREE (always active)',
    disease: process.env.KINDWISE_API_KEY ? 'Kindwise LIVE' : 'Demo mode',
    sms: process.env.TWILIO_ACCOUNT_SID ? 'Twilio LIVE' : 'Optional - not configured',
    chat: process.env.OPENAI_API_KEY ? 'OpenAI LIVE' : 'Demo mode',
    voice: process.env.ELEVENLABS_API_KEY ? 'ElevenLabs LIVE' : 'Optional - not configured'
  }
}));

app.get('/api/config', (req, res) => res.json({
  hasTwilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.trim()),
  hasKindwise: !!(process.env.KINDWISE_API_KEY && process.env.KINDWISE_API_KEY.trim()),
  hasOpenAI: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()),
  hasElevenLabs: !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim()),
  voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
  agentId: process.env.ELEVENLABS_AGENT_ID || ''
}));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  CropGuard AI v2.0 - Running!');
  console.log('  http://localhost:' + PORT);
  console.log('========================================');
  console.log('  Weather  : Open-Meteo FREE');
  console.log('  Disease  : ' + (process.env.KINDWISE_API_KEY ? 'Kindwise LIVE' : 'Demo'));
  console.log('  SMS      : ' + (process.env.TWILIO_ACCOUNT_SID ? 'Twilio LIVE' : 'Optional/Demo'));
  console.log('  Chat     : ' + (process.env.OPENAI_API_KEY ? 'OpenAI LIVE' : 'Demo'));
  console.log('========================================\n');
});
