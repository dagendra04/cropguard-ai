# 🌾 CropGuard AI v2.0
**AI-Enabled Community Crop Health Early-Warning System**

## 🚀 Quick Start (3 steps)
```bash
# 1. Install dependencies
npm install

# 2. Add your API keys to .env (weather works without any key!)
nano .env

# 3. Start the server
node server.js
```
Open: **http://localhost:3000**

## 🔑 .env File — API Keys

| Key | Where to Get | Required? |
|-----|-------------|----------|
| TWILIO_ACCOUNT_SID | console.twilio.com | ❌ Optional |
| TWILIO_AUTH_TOKEN | console.twilio.com | ❌ Optional |
| TWILIO_FROM_NUMBER | Your Twilio number | ❌ Optional |
| KINDWISE_API_KEY | crop.health → API Keys | ❌ Optional |
| OPENAI_API_KEY | platform.openai.com | ❌ Optional |
| ELEVENLABS_API_KEY | elevenlabs.io | ❌ Optional |

> 🌤️ **Weather API = Open-Meteo (100% FREE, no key needed!)**
> 💡 **All features have demo fallbacks — app works without any keys!**

## ✨ Features
- 🔬 Disease Detection (Kindwise AI / demo)
- 🌦️ Live Weather + 7-Day Forecast + Risk Score (Open-Meteo FREE)
- 🗺️ Community Disease Map (Leaflet + OpenStreetMap)
- 📊 Officer Dashboard with SMS Alerts (Twilio — optional)
- 🤖 AI Crop Advisor Hindi & English (OpenAI / demo)
- 🔊 Voice Assistant (ElevenLabs — optional)
- 📱 Fully Responsive + Dark Mode
- 👨‍🌾 Farmer Registration with GPS Map

## 📁 Project Structure
```
cropguard-ai/
├── public/
│   └── index.html       ← Full SPA frontend
├── routes/
│   ├── weather.js       ← Open-Meteo (FREE, always works)
│   ├── disease.js       ← Kindwise detection
│   ├── sms.js           ← Twilio SMS (OPTIONAL)
│   └── chat.js          ← OpenAI chatbot
├── middleware/
│   └── auth.js          ← Officer auth
├── server.js            ← Express backend
├── .env                 ← ← ADD YOUR KEYS HERE
├── package.json
└── README.md
```

## 📞 KCC Helpline: 1800-180-1551 (Free, 24x7 for farmers)
"# cropguard-ai" 
