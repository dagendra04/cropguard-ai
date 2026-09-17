const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

function calcRisk(temp, humidity, diseaseConf, stage, soil) {
  let score = 0;
  if (humidity > 80) score += 3; else if (humidity > 60) score += 2; else score += 1;
  if (temp > 35) score += 3; else if (temp > 30) score += 2; else score += 1;
  if ((diseaseConf || 0) > 70) score += 3; else if ((diseaseConf || 0) > 40) score += 2;
  
  if (stage === 'Flowering' || stage === 'Fruiting') score += 1;
  if (soil === 'Clay' && humidity > 75) score += 1;

  const level = score >= 8 ? 'HIGH' : score >= 5 ? 'MEDIUM' : 'LOW';
  const stageMsg = stage ? ' (Stage: ' + stage + ')' : '';
  const advice = {
    HIGH: 'Turant karwai zaruri! Fungicide/pesticide abhi lagayen' + stageMsg + '. KCC: 1800-180-1551 | Immediate action! Apply fungicide NOW.',
    MEDIUM: 'Dhyan se monitor karein. Preventive spray sochein' + stageMsg + '. | Monitor closely. Consider preventive spray.',
    LOW: 'Halat abhi surakshit hai. Regular monitoring jaari rakhen. | Conditions safe. Maintain regular monitoring.'
  };
  return { level, score, maxScore: 11, advice: advice[level] };
}

function getFarmingAdvisory(temp, rainChance, windspeed) {
  if (rainChance > 50) {
    return { title: 'Rain Expected', advice: 'Do not spray pesticides or fertilizers today. Wait for clear weather. (Barish ki sambhavna hai, spray na karein).', risk: 'HIGH' };
  } else if (temp > 35) {
    return { title: 'Heat Stress', advice: 'High temperature. Irrigate fields in the early morning or late evening. (Adhik garmi, khet ki sinchai subah ya sham ko karein).', risk: 'MEDIUM' };
  } else if (windspeed > 25) {
    return { title: 'High Wind', advice: 'Avoid spraying chemicals. Secure tall crops. (Tez hawa, spray na karein).', risk: 'MEDIUM' };
  } else if (temp < 15) {
    return { title: 'Cold Stress', advice: 'Protect sensitive crops from cold. Provide light irrigation. (Sardi se fasal bachayen).', risk: 'LOW' };
  } else {
    return { title: 'Favorable Conditions', advice: 'Weather is favorable for normal agricultural activities. (Mausam kheti ke anukool hai).', risk: 'LOW' };
  }
}

// GET /api/weather?lat=26.84&lon=80.94&confidence=0
router.get('/', async (req, res) => {
  const { lat, lon, confidence = 0, stage, soil } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
      '&longitude=' + lon +
      '&current_weather=true&hourly=relative_humidity_2m,temperature_2m&timezone=auto&forecast_days=1';
    const resp = await fetch(url);
    const data = await resp.json();
    const cw = data.current_weather;
    const hour = new Date().getUTCHours();
    const hum = (data.hourly && data.hourly.relative_humidity_2m) ? data.hourly.relative_humidity_2m[hour] : 65;
    const rainChance = (data.daily && data.daily.precipitation_probability_max) ? data.daily.precipitation_probability_max[0] : 0;
    res.json({
      temperature: cw.temperature, humidity: hum, windspeed: cw.windspeed,
      weathercode: cw.weathercode, risk: calcRisk(cw.temperature, hum, parseFloat(confidence), stage, soil),
      advisory: getFarmingAdvisory(cw.temperature, rainChance, cw.windspeed),
      source: 'open-meteo', lat, lon
    });
  } catch (err) {
    const t = Math.round((28 + Math.random() * 12) * 10) / 10;
    const h = Math.round((55 + Math.random() * 35) * 10) / 10;
    const rc = Math.round(Math.random() * 80);
    res.json({ temperature: t, humidity: h, windspeed: 12, weathercode: 0,
      risk: calcRisk(t, h, parseFloat(confidence), stage, soil),
      advisory: getFarmingAdvisory(t, rc, 12),
      source: 'demo', lat, lon });
  }
});

// GET /api/weather/forecast?lat=26.84&lon=80.94
router.get('/forecast', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
      '&longitude=' + lon +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode&timezone=auto&forecast_days=7';
    const resp = await fetch(url);
    const d = await resp.json();
    const forecast = d.daily.time.map((date, i) => ({
      date, tempMax: d.daily.temperature_2m_max[i], tempMin: d.daily.temperature_2m_min[i],
      rain: d.daily.precipitation_sum[i], rainChance: d.daily.precipitation_probability_max[i],
      wind: d.daily.windspeed_10m_max[i], weathercode: d.daily.weathercode[i]
    }));
    res.json({ forecast, source: 'open-meteo' });
  } catch (err) {
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
      tempMax: Math.round(28 + Math.random() * 10), tempMin: Math.round(20 + Math.random() * 6),
      rain: parseFloat((Math.random() * 15).toFixed(1)), rainChance: Math.round(Math.random() * 80),
      wind: Math.round(8 + Math.random() * 22), weathercode: [0,1,2,3,61,80][Math.floor(Math.random()*6)]
    }));
    res.json({ forecast, source: 'demo' });
  }
});

module.exports = router;
