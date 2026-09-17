const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const MOCK_HI = [
  'Aapki fasal mein jo symptoms hain uske liye Mancozeb 75WP 2g/L paani mein spray karein. Prabhavit pattiyaan turant hatayein. Har 10 din mein repeat karein. KCC Helpline: 1800-180-1551',
  'Zyada nami ki wajah se fungal rog failta hai. Neem oil 5mL/L spray karein. Khet ki drainage sudharein. Subah ke waqt spray karna zyada prabhavi hai.',
  'IPM apnayen. Pehle jeevanu niyantran try karein phir rasayanik dawa. Soil test zaroor karwayen aur NPK balance rakhen.'
];
const MOCK_EN = [
  'For these symptoms apply Mancozeb 75WP at 2g/L water. Remove all infected leaves immediately. Repeat spray every 10 days. KCC Helpline: 1800-180-1551',
  'High humidity increases fungal disease spread. Apply neem oil (5mL/L) as preventive spray every 7 days. Improve field drainage.',
  'Follow Integrated Pest Management (IPM). Try biocontrol first, then chemicals. Get soil test done and maintain balanced NPK fertilization.'
];

router.post('/', async (req, res) => {
  const { message, crop, disease, weather, lang, history = [] } = req.body;
  const isHindi = /[\u0900-\u097F]/.test(message) || lang === 'hi';

  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.trim()) {
    const pool = isHindi ? MOCK_HI : MOCK_EN;
    return res.json({ reply: pool[Math.floor(Math.random() * pool.length)], demo: true });
  }
  try {
    const sys = 'You are CropGuard AI, expert Indian agricultural advisor.' +
      ' Farmer crop: ' + (crop || 'unknown') + '. Detected disease: ' + (disease || 'none') + '.' +
      ' Weather risk: ' + (weather && weather.risk ? weather.risk.level : 'unknown') + '.' +
      ' Reply in Hindi Devanagari if user writes Hindi, else English.' +
      ' Give specific pesticide names, dosages, timing. Mention KCC 1800-180-1551 when relevant. Max 150 words.';
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: sys }, ...history.slice(-6), { role: 'user', content: message }], max_tokens: 300, temperature: 0.7 })
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ reply: data.choices[0].message.content, source: 'openai' });
  } catch (e) {
    const pool = isHindi ? MOCK_HI : MOCK_EN;
    res.json({ reply: pool[0], demo: true });
  }
});

module.exports = router;
