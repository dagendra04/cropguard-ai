const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const MOCK_DISEASES = [
  { disease: 'Tomato Late Blight', confidence: 87.3, severity: 'HIGH',
    treatment: 'Apply Mancozeb 75WP at 2g/L water. Remove infected leaves. Avoid overhead irrigation. Repeat every 10 days.',
    ipm_advice: 'Scout weekly. Use certified seeds. Apply neem oil 5mL/L preventively.',
    organic: 'Spray Bordeaux mixture (1%). Remove and burn infected material.' },
  { disease: 'Rice Blast', confidence: 79.1, severity: 'HIGH',
    treatment: 'Apply Tricyclazole 75WP at 0.6g/L. Drain field 3-4 days. Avoid heavy nitrogen.',
    ipm_advice: 'Use resistant varieties. Remove infected debris. Monitor humidity.',
    organic: 'Apply Pseudomonas fluorescens 2.5kg/ha.' },
  { disease: 'Wheat Rust (Yellow)', confidence: 91.5, severity: 'MEDIUM',
    treatment: 'Apply Propiconazole 25EC at 1mL/L. Spray early morning. Repeat after 15 days.',
    ipm_advice: 'Plant resistant varieties. Sow early. Remove volunteer wheat.',
    organic: 'Use Bacillus subtilis biocontrol agent.' },
  { disease: 'Powdery Mildew', confidence: 83.2, severity: 'MEDIUM',
    treatment: 'Apply Wettable Sulphur 80WP at 3g/L. Do not spray when temp > 35C.',
    ipm_advice: 'Improve air circulation. Avoid excess nitrogen.',
    organic: 'Spray diluted milk (1:9). Baking soda solution (1 tsp/L).' },
  { disease: 'Healthy Plant', confidence: 96.1, severity: 'NONE',
    treatment: 'No treatment needed. Plant looks healthy!',
    ipm_advice: 'Maintain proper spacing, balanced fertilization, and drainage.',
    organic: 'Continue organic matter application.' }
];

function generateCommunityRisk(disease, severity) {
  if (severity === 'NONE' || disease === 'Healthy Plant') return [];
  
  return [
    {
      farmer: "Farmer B (1.2 km)",
      crop: "Same Crop",
      stage: "Flowering",
      weather: "High Humidity",
      risk_level: "HIGH",
      message: "⚠️ Early Warning: Similar crop-health risk detected nearby. Increase field scouting and monitor symptoms."
    },
    {
      farmer: "Farmer C (3.5 km)",
      crop: "Same Crop",
      stage: "Vegetative",
      weather: "Moderate Humidity",
      risk_level: "MEDIUM",
      message: "⚠️ Preventative Warning: Monitor crop health closely, adjacent areas report infections."
    },
    {
      farmer: "Farmer D (8.1 km)",
      crop: "Different Crop",
      stage: "Seedling",
      weather: "Dry",
      risk_level: "WATCH",
      message: "ℹ️ Watch: Low risk for your crop, but disease pressure detected in the district."
    }
  ];
}

router.post('/detect', upload.single('image'), async (req, res) => {
  if (!process.env.KINDWISE_API_KEY || process.env.KINDWISE_API_KEY.trim() === '') {
    const mock = MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
    const neighbourhood_alerts = generateCommunityRisk(mock.disease, mock.severity);
    return res.json({ ...mock, demo: true, source: 'demo', neighbourhood_alerts });
  }
  try {
    const b64 = 'data:' + req.file.mimetype + ';base64,' + req.file.buffer.toString('base64');
    const resp = await fetch('https://crop.kindwise.com/api/v1/identification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': process.env.KINDWISE_API_KEY },
      body: JSON.stringify({ images: [b64], similar_images: true })
    });
    const data = await resp.json();
    const top = data.result && data.result.disease && data.result.disease.suggestions && data.result.disease.suggestions[0];
    
    const diseaseName = top ? top.name : 'Unknown';
    const severity = top && top.probability > 0.7 ? 'HIGH' : (top ? 'MEDIUM' : 'NONE');
    const neighbourhood_alerts = generateCommunityRisk(diseaseName, severity);

    res.json({
      disease: diseaseName,
      confidence: top ? Math.round(top.probability * 1000) / 10 : 0,
      severity: severity,
      treatment: (top && top.details && top.details.treatment) || 'Consult your nearest agricultural officer.',
      ipm_advice: 'Follow Integrated Pest Management guidelines for your region.',
      organic: 'Consult local organic farming extension officer.',
      source: 'kindwise',
      neighbourhood_alerts
    });
  } catch (e) {
    const mock = MOCK_DISEASES[0];
    const neighbourhood_alerts = generateCommunityRisk(mock.disease, mock.severity);
    res.json({ ...mock, demo: true, source: 'demo-fallback', neighbourhood_alerts });
  }
});

module.exports = router;
