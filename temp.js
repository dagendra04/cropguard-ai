
    const K = { ts: '', tt: '', tf: '', kw: '', oa: '', el: '', ev: '21m00Tcm4TlvDq8ikWAM', be: '', ea: '' };
    const CH = []; const RC = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };
    let farmers = [], rmi = false, cmi = false, rmark = null, cw = null, ld = null, recog = null, isv = false, dark = false;
    const PM = { home: { t: 'Dashboard', s: 'Overview of your crop health network' }, reg: { t: 'Register Farmer', s: 'Add a new farmer to the network' }, det: { t: 'Disease Detection', s: 'AI-powered leaf disease diagnosis' }, wth: { t: 'Weather & Risk', s: 'Live weather + risk scoring (Open-Meteo FREE)' }, trap: { t: 'Pest Trap Module', s: 'Monitor pest populations & ETL thresholds' }, map: { t: 'Community Map', s: 'Disease hotspots across your region' }, ofc: { t: 'Officer Dashboard', s: 'Validate reports & send SMS alerts' }, cht: { t: 'AI Crop Advisor', s: 'Expert advice in Hindi & English' } };
    const MR = [
      { id: 1, name: 'Rajesh Yadav', crop: 'Wheat', disease: 'Wheat Rust', risk: 'HIGH', lat: 26.92, lon: 80.98, village: 'Rampur', district: 'Lucknow', mobile: '+919876543001', confidence: 87, status: 'validated', fieldConfirmed: true, lang: 'hi' },
      { id: 2, name: 'Sunita Devi', crop: 'Tomato', disease: 'Late Blight', risk: 'MEDIUM', lat: 26.80, lon: 80.91, village: 'Sitapur', district: 'Sitapur', mobile: '+919876543002', confidence: 72, status: 'pending', lang: 'hi' },
      { id: 3, name: 'Ramesh Patel', crop: 'Cotton', disease: 'Pink Bollworm', risk: 'HIGH', lat: 26.85, lon: 80.95, village: 'Rampur', district: 'Lucknow', mobile: '+919876543003', confidence: 95, status: 'validated', lang: 'en' },
      { id: 4, name: 'Mohan Singh', crop: 'Rice', disease: 'Brown Spot', risk: 'LOW', lat: 26.88, lon: 80.90, village: 'Rampur', district: 'Lucknow', mobile: '+919876543004', confidence: 60, status: 'pending', lang: 'hi' }
    ];
    const MD = [
      { disease: 'Tomato Late Blight', confidence: 87.3, severity: 'HIGH', treatment: 'Apply Mancozeb 75WP at 2g/L water. Remove infected leaves. Avoid overhead irrigation. Repeat every 10 days.', ipm_advice: 'Scout weekly. Use certified seeds. Apply neem oil (5mL/L) preventively.', organic: 'Spray Bordeaux mixture (1%). Remove and burn infected material.' },
      { disease: 'Rice Blast', confidence: 79.1, severity: 'HIGH', treatment: 'Apply Tricyclazole 75WP at 0.6g/L. Drain field 3-4 days. Avoid heavy nitrogen.', ipm_advice: 'Use resistant varieties. Remove infected debris. Monitor humidity.', organic: 'Apply Pseudomonas fluorescens 2.5kg/ha.' },
      { disease: 'Wheat Rust (Yellow)', confidence: 91.5, severity: 'MEDIUM', treatment: 'Apply Propiconazole 25EC at 1mL/L. Spray early morning. Repeat after 15 days.', ipm_advice: 'Plant resistant varieties. Sow early. Remove volunteer wheat.', organic: 'Use Bacillus subtilis biocontrol agent.' },
      { disease: 'Healthy Plant', confidence: 96.1, severity: 'NONE', treatment: 'No treatment needed. Your plant looks healthy!', ipm_advice: 'Maintain proper spacing, balanced fertilization, and drainage.', organic: 'Continue organic matter application.' }
    ];
    function ar() { return [...farmers, ...MR]; }
    function searchLoc(id) { const v = document.getElementById(id).value.toLowerCase(); if (!v) { toast('Enter village to focus', 'wn'); return; } if (id === 'mlocInput') { toast('Focusing map on ' + v, 'ok'); } else { toast('Fetching weather for ' + v, 'ok'); } }
    const pulsecss = document.createElement('style'); pulsecss.innerHTML = `@keyframes pulsate { 0% {transform: scale(0.1, 0.1); opacity: 0.0;} 50% {opacity: 1.0;} 100% {transform: scale(1.2, 1.2); opacity: 0.0;} } .hspot { border: 3px solid #ef4444; border-radius: 50%; height: 50px; width: 50px; position: absolute; left: -11px; top: -11px; animation: pulsate 2s ease-out; animation-iteration-count: infinite; opacity: 0.0; }`; document.head.appendChild(pulsecss);
    let userRole = 'farmer';
    let curLang = 'hi';
    // --- Multilingual strings ---
    const L = {
      hi: {
        noFarm: 'कोई खेत पंजीकृत नहीं', farmerWelcome: 'अपना खेत पंजीकृत करें',
        detecting: 'विश्लेषण हो रहा है...', analysisOk: 'विश्लेषण पूर्ण!',
        gpsOk: 'GPS स्थान मिला!', gpsDenied: 'GPS अनुमति नहीं। शहर का नाम टाइप करें।',
        pestAlert: 'कीट चेतावनी उत्पन्न!', pestSafe: 'ट्रैप रिकॉर्ड हो गया',
        weatherOk: 'मौसम अपडेट हो गया!', noLoc: 'पहले शहर खोजें या GPS उपयोग करें'
      },
      en: {
        noFarm: 'No farm registered yet', farmerWelcome: 'Register your farm to get started',
        detecting: 'Analyzing...', analysisOk: 'Analysis complete!',
        gpsOk: 'GPS location found!', gpsDenied: 'GPS denied. Type city name.',
        pestAlert: 'Pest Alert Generated!', pestSafe: 'Trap recorded safely',
        weatherOk: 'Weather updated!', noLoc: 'Search city first or use GPS'
      }
    };
    function t(k) { return L[curLang]?.[k] || L.en[k] || k; }
    function setLang(lang) {
      curLang = lang;
      localStorage.setItem('cgLang', lang);
      document.getElementById('lbHi').classList.toggle('active', lang === 'hi');
      document.getElementById('lbEn').classList.toggle('active', lang === 'en');
      applyLang();
    }
    function applyLang() {
      document.querySelectorAll('[data-hi]').forEach(el => {
        const v = el.getAttribute('data-' + curLang) || el.getAttribute('data-en');
        if (v !== null) el.textContent = v;
      });
      // Update dynamic elements
      updFarmerDash();
    }
    function loginAs(role) {
      userRole = role;
      document.getElementById('loginm').classList.remove('op');
      const farmerEls = document.querySelectorAll('.farmer-only');
      const officerEls = document.querySelectorAll('.officer-only');
      if (role === 'farmer') {
        farmerEls.forEach(e => e.style.display = 'flex');
        officerEls.forEach(e => e.style.display = 'none');
        document.getElementById('roleLabel').textContent = curLang === 'hi' ? 'किसान व्यू' : 'Farmer View';
        document.getElementById('roleNameLbl').textContent = curLang === 'hi' ? 'किसान' : 'Farmer';
        document.getElementById('roleDesc').textContent = curLang === 'hi' ? 'बुनियादी पहुंच' : 'Basic access';
        document.getElementById('roleIcon').innerHTML = '<i class="fa fa-seedling"></i>';
        document.getElementById('roleIcon').style.background = '#16a34a';
        document.getElementById('ni-ofc').style.display = 'none';
        document.getElementById('homeF').style.display = 'block';
        document.getElementById('homeO').style.display = 'none';
      } else {
        farmerEls.forEach(e => e.style.display = 'none');
        officerEls.forEach(e => e.style.display = 'flex');
        document.getElementById('roleLabel').textContent = curLang === 'hi' ? 'जिला प्राधिकरण' : 'District Authority';
        document.getElementById('roleNameLbl').textContent = curLang === 'hi' ? 'जिला अधिकारी' : 'District Officer';
        document.getElementById('roleDesc').textContent = curLang === 'hi' ? 'पूर्ण निगरानी' : 'Full surveillance access';
        document.getElementById('roleIcon').innerHTML = '<i class="fa fa-shield-halved"></i>';
        document.getElementById('roleIcon').style.background = '#1e293b';
        document.getElementById('homeF').style.display = 'none';
        document.getElementById('homeO').style.display = 'block';
        // Update officer network stats
        document.getElementById('s1').textContent = ar().length;
        document.getElementById('s2').textContent = ar().filter(r => r.risk !== 'LOW').length;
        document.getElementById('s3').textContent = ar().filter(r => r.risk === 'HIGH').length;
        document.getElementById('s4').textContent = ar().filter(r => r.status === 'validated').length;
      }
      toast((curLang === 'hi' ? 'स्वागत है! ' : 'Welcome! ') + (role === 'farmer' ? (curLang === 'hi' ? 'किसान' : 'Farmer') : (curLang === 'hi' ? 'जिला प्राधिकरण' : 'District Authority')), 'ok');
      rndAlerts();
      updFarmerDash();
      applyLang();
    }
    function logoutRole() { document.getElementById('loginm').classList.add('op'); }
    // --- Weather Auto-Location ---
    async function searchCity() {
      const city = document.getElementById('wcity').value.trim();
      if (!city) { toast('City/village name likhein', 'wn'); return; }
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const d = await r.json();
        if (!d.results || !d.results.length) { toast('Location nahi mila. Doosra naam try karein.', 'wn'); return; }
        const loc = d.results[0];
        document.getElementById('wlat').value = loc.latitude;
        document.getElementById('wlon').value = loc.longitude;
        document.getElementById('wlocName').textContent = loc.name + (loc.admin1 ? ', ' + loc.admin1 : '') + (loc.country ? ', ' + loc.country : '');
        document.getElementById('wlocDisp').style.display = 'block';
        toast('Location mila: ' + loc.name, 'ok');
        fetchW();
      } catch (e) { toast('Search fail. Internet check karein.', 'er'); }
    }
    function autoLocateW() {
      if (!navigator.geolocation) { toast('GPS is browser mein supported nahi', 'wn'); return; }
      const btn = document.getElementById('gpsWBtn');
      btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Locating...';
      btn.disabled = true;
      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude.toFixed(5), lon = pos.coords.longitude.toFixed(5);
        document.getElementById('wlat').value = lat;
        document.getElementById('wlon').value = lon;
        // Reverse geocode
        try {
          const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&count=0`);
          // Use nominatim for reverse geocode
          const rr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const dd = await rr.json();
          const name = (dd.address && (dd.address.village || dd.address.town || dd.address.city || dd.address.county)) || 'Your Location';
          document.getElementById('wlocName').textContent = name + ' (GPS)';
        } catch (_) { document.getElementById('wlocName').textContent = `${lat}, ${lon} (GPS)`; }
        document.getElementById('wlocDisp').style.display = 'block';
        btn.innerHTML = '<i class="fa fa-location-crosshairs"></i> Use My GPS Location (Auto-Detect)';
        btn.disabled = false;
        toast('GPS location mila!', 'ok');
        fetchW();
      }, err => {
        btn.innerHTML = '<i class="fa fa-location-crosshairs"></i> Use My GPS Location (Auto-Detect)';
        btn.disabled = false;
        toast('GPS access denied. City name type karein.', 'wn');
      }, { timeout: 10000 });
    }
    function sp(n, el) {
      document.querySelectorAll('.pg').forEach(s => s.classList.remove('on'));
      document.querySelectorAll('.ni').forEach(x => x.classList.remove('on'));
      document.getElementById('pg-' + n).classList.add('on');
      if (el) el.classList.add('on');
      else document.querySelectorAll('.ni').forEach(x => { if (x.getAttribute('onclick') && x.getAttribute('onclick').includes("'" + n + "'")) x.classList.add('on'); });
      const mObj = PM[n] || {};
      document.getElementById('ptitle').textContent = mObj.t || n;
      document.getElementById('psub').textContent = mObj.s || '';
      if (n === 'reg') setTimeout(initRM, 80);
      if (n === 'map') initCM();
      if (n === 'ofc') rndOfc();
      if (n === 'home') rndAlerts();
      csb(); window.scrollTo(0, 0);
      setTimeout(() => {
        if (typeof m !== 'undefined' && m && m.invalidateSize) m.invalidateSize();
        if (typeof rm !== 'undefined' && rm && rm.invalidateSize) rm.invalidateSize();
      }, 300);
    }
    function osb() { document.getElementById('sb').classList.add('op'); document.getElementById('sbo').classList.add('op'); }
    function csb() { document.getElementById('sb').classList.remove('op'); document.getElementById('sbo').classList.remove('op'); }
    function tdk() { dark = !dark; document.body.setAttribute('data-dark', dark ? '1' : ''); document.body.removeAttribute(dark ? '' : 'data-dark'); document.getElementById('dkico').className = dark ? 'fa fa-sun' : 'fa fa-moon'; }
    function lk() { try { const s = JSON.parse(localStorage.getItem('cgk') || '{}'); Object.assign(K, s); } catch (_) { } [{ e: 'kts', k: 'ts' }, { e: 'ktt', k: 'tt' }, { e: 'ktf', k: 'tf' }, { e: 'kkw', k: 'kw' }, { e: 'koa', k: 'oa' }, { e: 'kel', k: 'el' }, { e: 'kev', k: 'ev' }, { e: 'kea', k: 'ea' }, { e: 'kbe', k: 'be' }].forEach(({ e, k }) => { const el = document.getElementById(e); if (el) el.value = K[k] || ''; }); ustat(); }
    function saveK() { K.ts = gv('kts'); K.tt = gv('ktt'); K.tf = gv('ktf'); K.kw = gv('kkw'); K.oa = gv('koa'); K.el = gv('kel'); K.ev = gv('kev') || '21m00Tcm4TlvDq8ikWAM'; K.ea = gv('kea'); K.be = gv('kbe'); localStorage.setItem('cgk', JSON.stringify(K)); cm2('apm'); ustat(); toast('Configuration saved!', 'ok'); initConvAI(); }
    function gv(id) { return (document.getElementById(id) || {}).value?.trim() || ''; }
    function ustat() { const n = [K.ts, K.kw, K.oa, K.el].filter(Boolean).length; const d = document.getElementById('sdot'), l = document.getElementById('slbl'), s = document.getElementById('ssub'), b = document.getElementById('mbadge'); if (n > 0) { d.style.background = '#22c55e'; l.textContent = n + '/4 Keys'; s.textContent = 'Live mode'; b.textContent = 'LIVE'; b.className = 'blive'; } else { d.style.background = '#f59e0b'; l.textContent = 'Demo Mode'; s.textContent = 'No API keys'; b.textContent = 'DEMO'; b.className = 'bdemo'; } }
    function initRM() { if (rmi) return; rmi = true; const m = L.map('rmap').setView([26.84, 80.94], 11); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(m); m.on('click', e => { const { lat, lng } = e.latlng; document.getElementById('flat').value = lat.toFixed(6); document.getElementById('flon').value = lng.toFixed(6); const g = document.getElementById('gps'); g.style.display = 'flex'; g.innerHTML = '<i class="fa fa-location-dot"></i> GPS: ' + lat.toFixed(5) + ', ' + lng.toFixed(5); if (rmark) m.removeLayer(rmark); rmark = L.marker([lat, lng]).addTo(m).bindPopup('<b>Farm location</b>').openPopup(); document.getElementById('wlat').value = lat.toFixed(5); document.getElementById('wlon').value = lng.toFixed(5); }); }
    function initCM() { if (cmi) return; cmi = true; const m = L.map('cmap').setView([26.84, 80.94], 10); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(m); let vills = {}; ar().forEach(r => { if (!r.lat || !r.lon) return; const k = r.village; if (!vills[k]) vills[k] = { lat: r.lat, lon: r.lon, count: 0 }; if (r.risk === 'HIGH' || r.risk === 'MEDIUM') vills[k].count++; const c = RC[r.risk] || '#22c55e'; const ico = L.divIcon({ className: '', html: '<div style="width:28px;height:28px;border-radius:50%;background:' + c + ';border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:800">' + r.risk[0] + '</div>', iconSize: [28, 28], iconAnchor: [14, 14] }); L.marker([r.lat, r.lon], { icon: ico }).addTo(m).bindPopup('<div style="font-size:13px"><b>' + r.name + '</b><br>' + r.crop + ' &mdash; <span style="color:' + c + ';font-weight:700">' + r.risk + '</span><br>' + r.disease + '<br><small>' + r.village + ', ' + r.district + '</small></div>'); }); let hh = false; let vlist = ''; Object.keys(vills).forEach(k => { if (vills[k].count >= 2) { hh = true; vlist += `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--bd)"><span><b>${k}</b></span><span style="color:#ef4444;font-weight:700">${vills[k].count} Cases</span></div>`; const hico = L.divIcon({ className: '', html: '<div class="hspot"></div>', iconSize: [28, 28], iconAnchor: [14, 14] }); L.marker([vills[k].lat, vills[k].lon], { icon: hico }).addTo(m).bindPopup('<b style="color:#ef4444"><i class="fa fa-triangle-exclamation"></i> Hotspot Zone: ' + k + '</b><br>' + vills[k].count + ' active cases.'); } }); if (hh) { document.getElementById('mhotspot').innerHTML = '<div style="background:#fef2f2;border:1px solid #ef4444;color:#991b1b;padding:12px;border-radius:8px;margin-bottom:15px;font-weight:600"><i class="fa fa-triangle-exclamation"></i> WARNING: Disease Hotspot detected! Check Village list.</div>'; } document.getElementById('mvilList').innerHTML = vlist || '<div style="color:var(--tx2)">No hotspots detected.</div>'; document.getElementById('mlist').innerHTML = ar().map(r => '<div class="card"><div class="cb" style="padding:13px"><div style="display:flex;align-items:center;gap:9px"><div style="width:9px;height:9px;border-radius:50%;background:' + RC[r.risk] + ';flex-shrink:0"></div><div style="flex:1"><div style="font-weight:600;font-size:.83rem">' + r.name + '</div><div style="font-size:.69rem;color:var(--tx2);margin-top:2px">' + r.crop + ' &bull; ' + r.village + ', ' + r.district + '</div></div><span class="rt r' + r.risk[0] + '">' + r.risk + '</span></div><div style="margin-top:7px;font-size:.73rem;color:var(--tx2);background:var(--bg);padding:5px 9px;border-radius:6px">' + r.disease + ' &mdash; ' + r.confidence + '%</div></div></div>').join(''); }
    function regF(e) { e.preventDefault(); const lat = document.getElementById('flat').value, lon = document.getElementById('flon').value; if (!lat || !lon) { toast('Please click the map to set GPS location', 'wn'); return; } const f = { id: Date.now(), name: gv('fn'), mobile: gv('fm'), village: gv('fv'), district: gv('fd'), crop: document.getElementById('fc2').value, variety: gv('fcv'), stage: document.getElementById('fcs').value, soil: document.getElementById('fst').value, sowingDate: document.getElementById('fsd').value, prevCrop: gv('fpch'), planning: gv('fcyp'), lang: document.getElementById('fl').value, lat, lon, status: 'pending', disease: '', risk: 'LOW', confidence: 0 }; farmers.push(f); localStorage.setItem('cgf', JSON.stringify(farmers)); document.getElementById('s1').textContent = farmers.length; document.getElementById('pb').textContent = ar().filter(r => r.status.startsWith('pending')).length; updCtx(); toast('Farm registered!', 'ok'); e.target.reset(); document.getElementById('gps').style.display = 'none'; cmi = false; sp('det', null); }
    function prevImg(ev) { const f = ev.target.files[0]; if (!f) return; document.getElementById('imgprev').src = URL.createObjectURL(f); document.getElementById('imgprev').style.display = 'block'; document.getElementById('upico').style.display = 'none'; }
    function b64f(f) { return new Promise((r, j) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.onerror = j; fr.readAsDataURL(f); }); }
    function calcDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    function updateCommunityRisk(triggerFarmer) {
      if (!triggerFarmer.disease || triggerFarmer.confidence < 70) return;
      let alertsSent = 0;
      farmers.forEach(f => {
        if (f.id === triggerFarmer.id) return;
        const dist = calcDistance(triggerFarmer.lat, triggerFarmer.lon, f.lat, f.lon);
        let riskScore = 0;
        if (dist < 5) riskScore += 5; else if (dist < 15) riskScore += 3; else if (dist < 30) riskScore += 1;
        if (f.crop === triggerFarmer.crop) riskScore += 4;
        if (cw && cw.humidity > 70) riskScore += 2;
        let newRisk = 'LOW';
        if (riskScore >= 8) newRisk = 'HIGH'; else if (riskScore >= 5) newRisk = 'MEDIUM';
        if (newRisk === 'HIGH' && f.risk !== 'HIGH') {
          f.risk = 'HIGH'; alertsSent++;
          if (typeof toast !== 'undefined') toast('[Risk Engine] Early Warning: HIGH RISK for ' + f.name + ' (Distance: ' + dist.toFixed(1) + 'km)', 'wn');
        } else if (newRisk === 'MEDIUM' && f.risk === 'LOW') {
          f.risk = 'MEDIUM';
        }
      });
      if (alertsSent > 0) localStorage.setItem('cgf', JSON.stringify(farmers));
    }
    async function doDetect(isFollowUp) {
      const file = document.getElementById('lf').files[0]; if (!file) { toast('Please upload a leaf image first', 'wn'); return; } document.getElementById('dpla').style.display = 'none'; document.getElementById('dres').style.display = 'none'; toast('Analyzing...', ''); let res;
      if (K.kw && K.be) { try { const fd = new FormData(); fd.append('image', file); const r = await fetch(K.be + '/api/disease/detect', { method: 'POST', body: fd }); res = await r.json(); } catch (e) { res = { ...MD[0], demo: true }; } }
      else if (K.kw) { try { const img = await b64f(file); const r = await fetch('https://crop.kindwise.com/api/v1/identification', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Api-Key': K.kw }, body: JSON.stringify({ images: [img], similar_images: true }) }); const d = await r.json(); const t = d.result && d.result.disease && d.result.disease.suggestions && d.result.disease.suggestions[0]; res = { disease: t ? t.name : 'Unknown', confidence: t ? Math.round(t.probability * 1000) / 10 : 0, severity: 'MEDIUM', treatment: (t && t.details && t.details.treatment) || 'Consult agricultural officer.', ipm_advice: 'Follow IPM guidelines.', organic: 'Consult local extension officer.', source: 'kindwise' }; } catch (e) { res = { ...MD[0], demo: true }; } }
      else { res = { ...MD[Math.floor(Math.random() * MD.length)], demo: true }; }
      ld = res; const lat = document.getElementById('flat').value || gv('wlat') || 26.84; const lon = document.getElementById('flon').value || gv('wlon') || 80.94; const wd = await getWD(lat, lon, res.confidence);
      if (farmers.length > 0) { let f = farmers[farmers.length - 1]; let oldConf = f.confidence; f.disease = res.disease; f.confidence = res.confidence; if (file) { try { f.img = await b64f(file); } catch (e) { } } if (res.confidence < 80) { f.status = 'pending_expert'; } updateCommunityRisk(f); localStorage.setItem('cgf', JSON.stringify(farmers)); if (isFollowUp && oldConf) { const dday = document.getElementById('followUpDay').value; if (res.confidence < oldConf - 5) { res.followUpMsg = '<div style="background:#f0fdf4;border:1px solid #22c55e;color:#166534;padding:12px;border-radius:10px;margin-top:15px;font-size:.85rem"><b><i class="fa fa-arrow-trend-down"></i> Day ' + dday + ' Follow-up: IMPROVING</b><br>Severity dropped from ' + oldConf + '% to ' + res.confidence + '%. Current management is working.</div>'; } else if (res.confidence > oldConf + 5) { res.followUpMsg = '<div style="background:#fef2f2;border:1px solid #ef4444;color:#991b1b;padding:12px;border-radius:10px;margin-top:15px;font-size:.85rem"><b><i class="fa fa-arrow-trend-up"></i> Day ' + dday + ' Follow-up: WORSENING</b><br>Severity increased from ' + oldConf + '% to ' + res.confidence + '%. High-priority alert triggered. Consult expert immediately.</div>'; sndSMS(f.mobile, f.name, f.crop, f.disease, 'HIGH', res.confidence, f.village, f.district, f.lang); } else { res.followUpMsg = '<div style="background:#eff6ff;border:1px solid #3b82f6;color:#1e3a8a;padding:12px;border-radius:10px;margin-top:15px;font-size:.85rem"><b><i class="fa fa-minus"></i> Day ' + dday + ' Follow-up: STABLE</b><br>Severity is stable (' + oldConf + '% to ' + res.confidence + '%). Monitor closely.</div>'; } } } showDRes(res, wd); updCtx();
    }
    function showDRes(r, wd) {
      const c = r.confidence;
      const isHi = curLang === 'hi';
      const col = c > 80 ? '#ef4444' : c > 55 ? '#f59e0b' : '#22c55e';
      const sev = c > 80 ? { label: isHi ? 'गंभीर' : 'SEVERE', bg: '#fef2f2', border: '#ef4444', tc: '#991b1b' } : c > 55 ? { label: isHi ? 'मध्यम' : 'MODERATE', bg: '#fffbeb', border: '#f59e0b', tc: '#92400e' } : { label: isHi ? 'हल्का' : 'MILD', bg: '#f0fdf4', border: '#22c55e', tc: '#166534' };
      let exMsg = '';
      if (c < 80) { exMsg = `<div style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:12px;border-radius:10px;font-size:.82rem;margin-top:12px"><i class="fa fa-triangle-exclamation"></i> <b>${isHi ? 'विशेषज्ञ सत्यापन आवश्यक' : 'Needs Expert Verification'}</b><br>${isHi ? 'AI आत्मविश्वास कम है। केस जिला विशेषज्ञ समीक्षा के लिए भेजा गया।' : 'AI confidence is low. Case flagged for expert review.'}</div>`; }
      const f = farmers[farmers.length - 1] || {};
      const wdRisk = wd && wd.risk ? wd.risk.level : r.severity;
      document.getElementById('dcon').innerHTML = `
    <!-- DISEASE HEADER -->
    <div style="background:${sev.bg};border:2px solid ${sev.border};border-radius:14px;padding:18px;margin-bottom:14px;display:flex;align-items:flex-start;gap:14px">
      <div style="width:52px;height:52px;border-radius:12px;background:${sev.border};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="fa fa-virus" style="color:#fff;font-size:1.3rem"></i>
      </div>
      <div style="flex:1">
        <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.8px;color:${sev.tc};font-weight:700;margin-bottom:4px">${r.demo ? '[DEMO] ' : ''} ${isHi ? 'रोग पहचाना गया' : 'DISEASE IDENTIFIED'}</div>
        <div style="font-size:1.2rem;font-weight:800;color:var(--tx);margin-bottom:6px">${r.disease}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span style="background:${sev.border};color:#fff;padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:700">${sev.label}</span>
          <span style="background:var(--bg);border:1px solid var(--bd);color:var(--tx2);padding:3px 10px;border-radius:99px;font-size:.7rem">${isHi ? 'AI आत्मविश्वास' : 'AI Confidence'}: ${c}%</span>
          ${f.crop ? `<span style="background:var(--pbg);border:1px solid var(--p);color:var(--p);padding:3px 10px;border-radius:99px;font-size:.7rem">${f.crop} — ${f.stage || 'N/A'}</span>` : ''}
        </div>
      </div>
    </div>
    <!-- CONFIDENCE METER -->
    <div style="background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:14px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:.73rem;color:var(--tx2);margin-bottom:6px">
        <span><b>${isHi ? 'AI आत्मविश्वास' : 'AI Confidence Meter'}</b></span>
        <span style="color:${col};font-weight:700">${c}%</span>
      </div>
      <div style="height:10px;background:var(--bd);border-radius:99px;overflow:hidden">
        <div style="height:100%;width:${c}%;background:${col};border-radius:99px;transition:width .6s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.63rem;color:var(--tx3);margin-top:4px">
        <span>${isHi ? 'निम्न' : 'Low (<55%)'}</span><span>${isHi ? 'मध्यम' : 'Medium (55-80%)'}</span><span>${isHi ? 'उच्च' : 'High (>80%)'}</span>
      </div>
    </div>
    <!-- WEATHER + RISK GRID -->
    <div class="wpgrid" style="margin-bottom:14px">
      <div class="wpc">
        <div class="wpc-v" style="color:${wdRisk === 'HIGH' ? '#ef4444' : wdRisk === 'MEDIUM' ? '#f59e0b' : '#22c55e'}">${wdRisk || '--'}</div>
        <div class="wpc-l">${isHi ? 'मौसम जोखिम' : 'Weather Risk'}</div>
      </div>
      <div class="wpc">
        <div class="wpc-v" style="font-size:1rem">${wd ? wd.temperature + '°C' : '--'}</div>
        <div class="wpc-l">${isHi ? 'तापमान' : 'Temp'}</div>
      </div>
      <div class="wpc">
        <div class="wpc-v" style="font-size:1rem">${wd ? wd.humidity + '%' : '--'}</div>
        <div class="wpc-l">${isHi ? 'नमी' : 'Humidity'}</div>
      </div>
    </div>
    <!-- TREATMENT STEPS -->
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
      <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:12px 14px">
        <div style="font-size:.7rem;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px"><i class="fa fa-syringe"></i> ${isHi ? 'तत्काल उपचार' : 'Immediate Treatment'}</div>
        <div style="font-size:.82rem;color:#1e293b;line-height:1.6">${r.treatment}</div>
      </div>
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:12px 14px">
        <div style="font-size:.7rem;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px"><i class="fa fa-shield"></i> ${isHi ? 'IPM / रोकथाम' : 'IPM / Prevention'}</div>
        <div style="font-size:.82rem;color:#1e293b;line-height:1.6">${r.ipm_advice}</div>
      </div>
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:12px 14px">
        <div style="font-size:.7rem;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px"><i class="fa fa-seedling"></i> ${isHi ? 'जैविक / सुरक्षित विकल्प' : 'Organic / Safe Input'}</div>
        <div style="font-size:.82rem;color:#1e293b;line-height:1.6">${r.organic}</div>
      </div>
    </div>
    ${r.followUpMsg || ''}
    ${exMsg}
    
    ${r.neighbourhood_alerts && r.neighbourhood_alerts.length > 0 ? `
    <!-- COMMUNITY RISK ENGINE -->
    <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:14px;margin-top:14px">
      <div style="font-size:.8rem;font-weight:700;color:#0f172a;margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <i class="fa fa-tower-broadcast" style="color:#2563eb"></i> Community Risk Engine Activated
      </div>
      <div style="font-size:.7rem;color:#64748b;margin-bottom:10px">Alerts dispatched to nearby farmers based on risk factors (Distance, Crop, Stage, Weather).</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${r.neighbourhood_alerts.map(a => {
          const abg = a.risk_level === 'HIGH' ? '#fef2f2' : a.risk_level === 'MEDIUM' ? '#fffbeb' : '#f0fdf4';
          const abc = a.risk_level === 'HIGH' ? '#ef4444' : a.risk_level === 'MEDIUM' ? '#f59e0b' : '#22c55e';
          const atc = a.risk_level === 'HIGH' ? '#991b1b' : a.risk_level === 'MEDIUM' ? '#92400e' : '#166534';
          return `<div style="background:${abg};border-left:3px solid ${abc};padding:10px;border-radius:6px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-weight:700;color:${atc};font-size:.75rem">${a.farmer} - ${a.risk_level} RISK</span>
              <span style="font-size:.65rem;color:#64748b">${a.crop} | ${a.weather}</span>
            </div>
            <div style="font-size:.7rem;color:#334155">${a.message}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
    ` : ''}

    <button class="btn btp btf" style="margin-top:12px;width:100%" onclick="sp('cht',null)"><i class="fa fa-robot"></i> ${isHi ? 'AI से विस्तार में सलाह लें' : 'Ask AI for Detailed Advice'}</button>
  `;
      document.getElementById('dres').style.display = 'block';
      document.getElementById('dpla').style.display = 'none';
      toast(t('analysisOk'), 'ok');
      if (wd) {
        document.getElementById('wad').style.display = 'block';
        document.getElementById('wadc').innerHTML = wHTML(wd);
      }
    }
    function getFarmingAdvisory(temp, rainChance, windspeed) {
      if (rainChance > 50) return { title: 'Rain Expected', advice: 'Do not spray pesticides or fertilizers today. Wait for clear weather. (Barish ki sambhavna hai, spray na karein).', risk: 'HIGH' };
      if (temp > 35) return { title: 'Heat Stress', advice: 'High temperature. Irrigate fields in the early morning or late evening. (Adhik garmi, khet ki sinchai subah ya sham ko karein).', risk: 'MEDIUM' };
      if (windspeed > 25) return { title: 'High Wind', advice: 'Avoid spraying chemicals. Secure tall crops. (Tez hawa, spray na karein).', risk: 'MEDIUM' };
      if (temp < 15) return { title: 'Cold Stress', advice: 'Protect sensitive crops from cold. Provide light irrigation. (Sardi se fasal bachayen).', risk: 'LOW' };
      return { title: 'Favorable Conditions', advice: 'Weather is favorable for normal agricultural activities. (Mausam kheti ke anukool hai).', risk: 'LOW' };
    }
    async function getWD(lat, lon, conf) {
      const f = farmers[farmers.length - 1] || {}; const st = f.stage || ''; const sl = f.soil || ''; if (K.be) { try { const r = await fetch(K.be + '/api/weather?lat=' + lat + '&lon=' + lon + '&confidence=' + (conf || 0) + '&stage=' + encodeURIComponent(st) + '&soil=' + encodeURIComponent(sl)); return await r.json(); } catch (_) { } }
      try { const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true&hourly=relative_humidity_2m&daily=precipitation_probability_max&timezone=auto&forecast_days=1'; const r = await fetch(u); const d = await r.json(); const w = d.current_weather; const h = new Date().getUTCHours(); const hum = d.hourly && d.hourly.relative_humidity_2m ? d.hourly.relative_humidity_2m[h] : 65; const rc = d.daily && d.daily.precipitation_probability_max ? d.daily.precipitation_probability_max[0] : 0; return { temperature: w.temperature, humidity: hum, windspeed: w.windspeed, weathercode: w.weathercode, source: 'open-meteo', risk: rsk(w.temperature, hum, conf || 0, st, sl), advisory: getFarmingAdvisory(w.temperature, rc, w.windspeed) }; } catch (e) { const t = Math.round((28 + Math.random() * 12) * 10) / 10; const h = Math.round((55 + Math.random() * 35) * 10) / 10; const rc = Math.round(Math.random() * 80); return { temperature: t, humidity: h, windspeed: 12, weathercode: 0, source: 'demo', risk: rsk(t, h, conf || 0, st, sl), advisory: getFarmingAdvisory(t, rc, 12) }; }
    }
    async function getFC(lat, lon) {
      if (K.be) { try { const r = await fetch(K.be + '/api/weather/forecast?lat=' + lat + '&lon=' + lon); return (await r.json()).forecast; } catch (_) { } }
      try { const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode&timezone=auto&forecast_days=7'; const r = await fetch(u); const d = await r.json(); return d.daily.time.map((date, i) => ({ date, tempMax: d.daily.temperature_2m_max[i], tempMin: d.daily.temperature_2m_min[i], rain: d.daily.precipitation_sum[i], rainChance: d.daily.precipitation_probability_max[i], wind: d.daily.windspeed_10m_max[i], weathercode: d.daily.weathercode[i] })); } catch (e) { return Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10), tempMax: Math.round(28 + Math.random() * 10), tempMin: Math.round(20 + Math.random() * 6), rain: parseFloat((Math.random() * 15).toFixed(1)), rainChance: Math.round(Math.random() * 80), wind: Math.round(8 + Math.random() * 22), weathercode: [0, 1, 2, 3, 61, 80][Math.floor(Math.random() * 6)] })); }
    }
    function rsk(t, h, c, st, sl) { let s = 0; if (h > 80) s += 3; else if (h > 60) s += 2; else s += 1; if (t > 35) s += 3; else if (t > 30) s += 2; else s += 1; if (c > 70) s += 3; else if (c > 40) s += 2; if (st === 'Flowering' || st === 'Fruiting') s += 1; if (sl === 'Clay' && h > 75) s += 1; const lv = s >= 8 ? 'HIGH' : s >= 5 ? 'MEDIUM' : 'LOW'; const stm = st ? ' (Stage: ' + st + ')' : ''; const adv = { HIGH: 'Turant karwai! Apply fungicide NOW' + stm + '. KCC: 1800-180-1551', MEDIUM: 'Monitor closely. Consider preventive spray' + stm + '.', LOW: 'Conditions safe. Maintain regular monitoring.' }; return { level: lv, score: s, maxScore: 11, advice: adv[lv] }; }
    const WM = { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 61: 'Light rain', 63: 'Moderate rain', 80: 'Rain showers', 95: 'Thunderstorm' };
    const WI = { 0: '&#9728;', 1: '&#127780;', 2: '&#9925;', 3: '&#9729;', 45: '&#127787;', 61: '&#127783;', 63: '&#127783;', 80: '&#127783;', 95: '&#9928;' };
    function wHTML(w) {
      const risk = w.risk || rsk(w.temperature, w.humidity, 0, '', '');
      const isHi = curLang === 'hi';
      const rCol = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }[risk.level] || '#22c55e';
      const rBg = { HIGH: '#fef2f2', MEDIUM: '#fffbeb', LOW: '#f0fdf4' }[risk.level] || '#f0fdf4';
      const WIcon = { 0: '<i class="fa fa-sun"></i>', 1: '<i class="fa fa-cloud-sun"></i>', 2: '<i class="fa fa-cloud-sun"></i>', 3: '<i class="fa fa-cloud"></i>', 45: '<i class="fa fa-smog"></i>', 61: '<i class="fa fa-cloud-rain"></i>', 63: '<i class="fa fa-cloud-showers-heavy"></i>', 80: '<i class="fa fa-cloud-showers-water"></i>', 95: '<i class="fa fa-cloud-bolt"></i>' };
      const icon = WIcon[w.weathercode] || '<i class="fa fa-thermometer-half"></i>';
      const advHtml = w.advisory ? `<div style="background:#f8fafc;border:1px solid var(--bd);border-left:4px solid var(--p);border-radius:10px;padding:12px;margin-bottom:12px;display:flex;gap:12px">
      <div style="color:var(--p);font-size:1.5rem"><i class="fa fa-leaf"></i></div>
      <div>
        <div style="font-weight:700;font-size:.9rem;color:var(--tx)">${isHi ? 'कृषि सलाह' : 'Farming Advisory'}: ${w.advisory.title}</div>
        <div style="font-size:.8rem;color:var(--tx2);margin-top:2px">${w.advisory.advice}</div>
      </div>
    </div>` : '';
      // Parameter risk rows
      const params = [
        { label: isHi ? 'तापमान' : 'Temperature', val: w.temperature + '°C', risk: w.temperature > 35 || w.temperature < 10 ? 'HIGH' : w.temperature > 30 ? 'MEDIUM' : 'LOW', why: isHi ? (w.temperature > 35 ? 'अत्यधिक गर्मी — फसल तनाव में' : w.temperature < 10 ? 'अत्यधिक ठंड — वृद्धि रुकती है' : 'सामान्य तापमान') : (w.temperature > 35 ? 'Too hot — crop stress & fungal risk' : w.temperature < 10 ? 'Too cold — growth slows down' : 'Normal range') },
        { label: isHi ? 'नमी' : 'Humidity', val: w.humidity + '%', risk: w.humidity > 80 ? 'HIGH' : w.humidity > 60 ? 'MEDIUM' : 'LOW', why: isHi ? (w.humidity > 80 ? 'अत्यधिक नमी — कवक रोग खतरा' : w.humidity > 60 ? 'मध्यम नमी — निगरानी रखें' : 'सामान्य नमी') : (w.humidity > 80 ? 'Very high — fungal & bacterial disease likely' : w.humidity > 60 ? 'Medium humidity — monitor closely' : 'Low humidity — safe') },
        { label: isHi ? 'हवा गति' : 'Wind Speed', val: w.windspeed + ' km/h', risk: w.windspeed > 40 ? 'HIGH' : w.windspeed > 20 ? 'MEDIUM' : 'LOW', why: isHi ? (w.windspeed > 40 ? 'तेज हवा — फसल को नुकसान' : w.windspeed > 20 ? 'तेज हवा — कीटाणु फैलते हैं' : 'सामान्य हवा') : (w.windspeed > 40 ? 'Strong wind — crop lodging risk' : w.windspeed > 20 ? 'Moderate wind — spore dispersal' : 'Normal') },
        { label: isHi ? 'ओस बिंदु' : 'Dew Point', val: (w.temperature - ((100 - w.humidity) / 5)).toFixed(1) + '°C', risk: w.humidity > 75 ? 'HIGH' : w.humidity > 55 ? 'MEDIUM' : 'LOW', why: isHi ? 'ओस बिंदु और नमी से कवक रोग बढ़ता है' : 'Dew point affects leaf wetness & fungal growth' },
        { label: isHi ? 'अनुभव तापमान' : 'Feels Like', val: (w.temperature + 2).toFixed(0) + '°C', risk: 'LOW', why: isHi ? 'वास्तविक अनुभव' : 'Heat index considering humidity' },
        { label: isHi ? 'वर्षा संभावना' : 'Rain Prob.', val: w.weathercode >= 61 ? 'HIGH' : 'LOW', risk: w.weathercode >= 61 ? 'MEDIUM' : 'LOW', why: isHi ? (w.weathercode >= 61 ? 'बारिश हो सकती है — स्प्रे न करें' : 'बारिश नहीं — स्प्रे कर सकते हैं') : (w.weathercode >= 61 ? 'Rain expected — delay spraying' : 'No rain — good for spray') },
      ];
      const paramRows = params.map(p => `<tr><td style="padding:7px 10px;font-weight:500">${p.label}</td><td style="padding:7px 10px;font-weight:700">${p.val}</td><td style="padding:7px 10px"><span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:.65rem;font-weight:700;background:${p.risk === 'HIGH' ? '#fee2e2' : p.risk === 'MEDIUM' ? '#fef3c7' : '#dcfce7'};color:${p.risk === 'HIGH' ? '#991b1b' : p.risk === 'MEDIUM' ? '#92400e' : '#166534'}">${p.risk}</span></td><td style="padding:7px 10px;font-size:.72rem;color:var(--tx2)">${p.why}</td></tr>`).join('');
      return `<div style="margin:0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="font-size:2.4rem;color:var(--p)">${icon}</div>
        <div>
          <div style="font-size:2rem;font-weight:800;color:var(--tx)">${w.temperature}°C</div>
          <div style="font-size:.8rem;color:var(--tx2)">${WM[w.weathercode] || 'Current conditions'} &bull; <span style="font-size:.65rem;color:var(--tx3)">${w.source === 'demo' ? 'Demo' : 'Open-Meteo LIVE'}</span></div>
        </div>
      </div>
      <div style="background:${rBg};border:2px solid ${rCol};border-radius:12px;padding:10px 18px;text-align:center">
        <div style="font-size:1.1rem;font-weight:800;color:${rCol}">${isHi ? { HIGH: 'उच्च', MEDIUM: 'मध्यम', LOW: 'न्यून' }[risk.level] || risk.level : risk.level} ${isHi ? 'जोखिम' : 'RISK'}</div>
        <div style="font-size:.65rem;color:${rCol};opacity:.8">${risk.score}/${risk.maxScore} ${isHi ? 'अंक' : 'pts'}</div>
      </div>
    </div>
    <div style="background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:10px 4px;margin-bottom:12px">
      <div style="font-size:.68rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.6px;padding:0 10px 6px" data-hi="पैरामीटर-वार जोखिम विश्लेषण" data-en="Parameter-wise Risk Breakdown">Parameter-wise Risk Breakdown</div>
      <table class="risk-table" style="width:100%">
        <thead><tr><th>${isHi ? 'पैरामीटर' : 'Parameter'}</th><th>${isHi ? 'मान' : 'Value'}</th><th>${isHi ? 'स्तर' : 'Level'}</th><th>${isHi ? 'फसल प्रभाव' : 'Crop Impact'}</th></tr></thead>
        <tbody>${paramRows}</tbody>
      </table>
    </div>
    <div style="background:${rBg};border-left:4px solid ${rCol};border-radius:8px;padding:12px 14px;font-size:.82rem;color:var(--tx)">
      <b><i class="fa fa-lightbulb"></i> ${isHi ? 'सलाह' : 'Advisory'}:</b> ${risk.advice}
    </div>
  </div>`;
    }
    async function fetchW() {
      const lat = document.getElementById('wlat').value;
      const lon = document.getElementById('wlon').value;
      const conf = gv('wconf') || '0';
      if (!lat || !lon) { toast('Pehle city search karein ya GPS use karein &#128205;', 'wn'); return; }
      document.getElementById('wres').innerHTML = '<div class="card"><div class="cb" style="text-align:center;padding:28px"><i class="fa fa-spinner fa-spin" style="font-size:1.4rem;color:var(--p)"></i><p style="margin-top:8px;color:var(--tx2);font-size:.82rem">Fetching live weather from Open-Meteo...</p></div></div>';
      const w = await getWD(lat, lon, parseFloat(conf)); cw = w;
      document.getElementById('wres').innerHTML = '<div class="card" style="margin-bottom:14px">' + wHTML(w) + '</div>';
      const fc = await getFC(lat, lon);
      document.getElementById('fgrid').innerHTML = fc.map(d => '<div class="fd"><div class="fdd">' + d.date.slice(5) + '</div><div class="fdi">' + (d.rain > 5 ? '&#127783;' : d.tempMax > 35 ? '&#9728;' : '&#9925;') + '</div><div class="fdt">' + d.tempMax + '&deg;/' + d.tempMin + '&deg;</div><div class="fdr">&#128167;' + d.rain + 'mm</div></div>').join('');
      document.getElementById('fcard').style.display = 'block';
      updCtx(); toast('Weather updated! &#127783;', 'ok');
    }
    function rndOfc() {
      const all = ar();
      document.getElementById('stats').innerHTML = `<div class="sc"><div class="t">${curLang === 'hi' ? 'सभी किसान' : 'Total Farmers'}</div><div class="v">${all.length}</div></div><div class="sc"><div class="t">${curLang === 'hi' ? 'उच्च अलर्ट' : 'High Alerts'}</div><div class="v" style="color:#ef4444">${all.filter(r => r.risk === 'HIGH').length}</div></div><div class="sc"><div class="t">${curLang === 'hi' ? 'समीक्षा लंबित' : 'Pending Review'}</div><div class="v" style="color:#f59e0b">${all.filter(r => r.status === 'pending_expert').length}</div></div><div class="sc"><div class="t">${curLang === 'hi' ? 'सत्यापित' : 'Validated'}</div><div class="v" style="color:#22c55e">${all.filter(r => r.status === 'validated').length}</div></div>`;
      // Render full farmer table
      renderFarmerTable(all);
      const p = all.filter(r => r.status === 'pending_expert');
      document.getElementById('penlist').innerHTML = p.length === 0 ? `<p style="color:var(--tx2);font-size:.8rem;padding:15px;text-align:center">${curLang === 'hi' ? 'कोई लंबित समीक्षा नहीं' : 'No pending reviews'}</p>` : p.map(r => `<div class="pr"><div style="flex:1"><div style="font-weight:700">${r.name} &mdash; ${r.crop} (${r.stage || '--'})</div><div style="font-size:.73rem;color:var(--tx2)">AI: ${r.disease} (${r.confidence}%)</div></div><button class="btn" style="background:#e0e7ff;color:#4f46e5;padding:6px 12px;font-size:0.75rem" onclick="reviewCase(${r.id})"><i class="fa fa-user-doctor"></i> Review</button></div>`).join('');
      const av = all.filter(r => r.status === 'validated' && !r.fieldConfirmed);
      document.getElementById('vallist').innerHTML = av.length === 0 ? `<p style="color:var(--tx2);font-size:.8rem;padding:15px;text-align:center">${curLang === 'hi' ? 'सभी मामलों की पुष्टि हो गई' : 'All cases confirmed'}</p>` : av.map(r => `<div class="pr"><div style="flex:1"><div style="font-weight:700">${r.name} &mdash; ${r.disease}</div><div style="font-size:.73rem;color:var(--tx2)">${curLang === 'hi' ? 'फील्ड पुष्टि के लिए तैयार' : 'Ready for field feedback'}</div></div><button class="btn" style="background:#dcfce7;color:#166534;padding:6px 12px;font-size:0.75rem" onclick="confirmField(${r.id})"><i class="fa fa-check"></i> ${curLang === 'hi' ? 'पुष्टि' : 'Confirm'}</button></div>`).join('');
      rndAlerts();
    }
    function renderFarmerTable(data) {
      const tbody = document.getElementById('farmerTbody');
      if (!tbody) return;
      if (!data || !data.length) { tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:20px;color:var(--tx2)">${curLang === 'hi' ? 'कोई किसान अभी तक पंजीकृत नहीं' : 'No farmers registered yet'}</td></tr>`; return; }
      tbody.innerHTML = data.map((r, i) => {
        const rc = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }[r.risk] || '#94a3b8';
        const sc = { validated: '<span style="background:#dcfce7;color:#166534;padding:2px 7px;border-radius:99px;font-size:.65rem;font-weight:700">Validated</span>', pending_expert: '<span style="background:#fee2e2;color:#991b1b;padding:2px 7px;border-radius:99px;font-size:.65rem;font-weight:700">Review</span>', pending: '<span style="background:#fef3c7;color:#92400e;padding:2px 7px;border-radius:99px;font-size:.65rem;font-weight:700">Pending</span>' }[r.status] || '<span style="background:var(--bg);color:var(--tx2);padding:2px 7px;border-radius:99px;font-size:.65rem">--</span>';
        return `<tr style="border-bottom:1px solid var(--bd);transition:background .15s" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">  
      <td style="padding:9px 12px;color:var(--tx2)">${i + 1}</td>
      <td style="padding:9px 12px;font-weight:600">${r.name}</td>
      <td style="padding:9px 12px;color:var(--tx2);font-size:.76rem">${r.mobile || '--'}</td>
      <td style="padding:9px 12px">${r.village || '--'}</td>
      <td style="padding:9px 12px">${r.district || '--'}</td>
      <td style="padding:9px 12px;font-weight:500">${r.crop || '--'}</td>
      <td style="padding:9px 12px;font-size:.76rem;color:var(--tx2)">${r.stage || '--'}</td>
      <td style="padding:9px 12px;font-size:.78rem">${r.disease || '--'}</td>
      <td style="padding:9px 12px;font-weight:700;color:${r.confidence > 80 ? '#ef4444' : r.confidence > 50 ? '#f59e0b' : '#22c55e'}">${r.confidence ? r.confidence + '%' : '--'}</td>
      <td style="padding:9px 12px"><span style="color:${rc};font-weight:700;font-size:.78rem">${r.risk || '--'}</span></td>
      <td style="padding:9px 12px">${sc}</td>
      <td style="padding:9px 12px"><button class="btn bts" style="font-size:.7rem;padding:4px 9px" onclick="reviewCase(${r.id})"><i class="fa fa-eye"></i></button></td>
    </tr>`;
      }).join('');
    }
    function filterFarmers() {
      const q = document.getElementById('fSearch')?.value.toLowerCase() || '';
      const filtered = ar().filter(r => !q || (r.name && r.name.toLowerCase().includes(q)) || (r.village && r.village.toLowerCase().includes(q)) || (r.crop && r.crop.toLowerCase().includes(q)) || (r.district && r.district.toLowerCase().includes(q)));
      renderFarmerTable(filtered);
    }
    function exportCSV() {
      const data = ar();
      const head = ['Name', 'Mobile', 'Village', 'District', 'Crop', 'Stage', 'Disease', 'Confidence%', 'Risk', 'Status'];
      const rows = data.map(r => [r.name, r.mobile, r.village, r.district, r.crop, r.stage, r.disease, r.confidence, r.risk, r.status].map(v => `"${v || ''}"`).join(','));
      const csv = 'data:text/csv;charset=utf-8,' + head.join(',') + '\n' + rows.join('\n');
      const a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'CropGuard_Farmers.csv'; a.click();
    }
    function confirmField(id) { const r = farmers.find(f => f.id === id); if (r) { r.fieldConfirmed = true; localStorage.setItem('cgf', JSON.stringify(farmers)); } rndOfc(); toast('Field confirmation saved to learning loop!', 'ok'); }
    function reviewCase(id) { const r = ar().find(f => f.id === id); if (!r) return; document.getElementById('reviewc').innerHTML = '<img src="' + (r.img || 'https://via.placeholder.com/300x200?text=No+Image') + '" style="width:100%;max-height:250px;object-fit:cover;border-radius:12px;margin-bottom:14px;background:#0f172a" alt="Leaf"><div style="font-weight:800;font-size:1.1rem;margin-bottom:4px;color:var(--tx)">AI Prediction: ' + r.disease + ' <span style="font-size:0.8rem;color:#ef4444;font-weight:600">(' + r.confidence + '%)</span></div><p style="font-size:0.8rem;color:var(--tx2);margin-bottom:15px">Crop: ' + r.crop + (r.stage ? ' (' + r.stage + ')' : '') + ' | Soil: ' + (r.soil || 'Unknown') + '</p><div class="fgp" style="margin-bottom:18px"><label>Correct Diagnosis (if wrong)</label><input class="fc" id="revDis" value="' + r.disease + '"></div><div style="display:flex;gap:10px"><button class="btn btp" style="flex:1" onclick="submitReview(' + id + ')"><i class="fa fa-check-double"></i> Validate & Approve</button></div>'; document.getElementById('reviewm').classList.add('op'); }
    function submitReview(id) { const r = farmers.find(f => f.id === id); if (r) { r.disease = document.getElementById('revDis').value; r.status = 'validated'; r.confidence = 100; localStorage.setItem('cgf', JSON.stringify(farmers)); } cm2('reviewm'); rndOfc(); toast('Report validated by expert!', 'ok'); }
    function doSMS(id) { const r = ar().find(x => x.id === id); if (!r) return; sndSMS(r.mobile, r.name, r.crop, r.disease, r.risk, r.confidence, r.village, r.district, r.lang); }
    async function sndSMS(mob, name, crop, dis, risk, conf, vil, dist, lang) { if (!K.ts || !K.tt) { toast('SMS demo: Add Twilio keys to .env to send real SMS', 'wn'); return; } if (!K.be) { toast('SMS needs backend. Run server.js and set Backend URL.', 'wn'); return; } try { const r = await fetch(K.be + '/api/sms/send-alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toNumber: mob, farmerName: name, crop, disease: dis, risk, confidence: conf, village: vil, district: dist, lang }) }); const d = await r.json(); let chMsg = d.channels ? d.channels.map(c => `${c.channel}: ${c.status}`).join(' | ') : ''; toast(d.demo ? 'Demo Alerts: ' + chMsg : 'Alerts sent: ' + chMsg, 'ok'); } catch (err) { toast('SMS error: ' + err.message, 'er'); } }
    function tbulk() { const p = document.getElementById('bcomp'); p.style.display = p.style.display === 'block' ? 'none' : 'block'; }
    async function sendBulk() { const msg = document.getElementById('bmsg').value.trim(); if (!K.ts || !K.tt) { toast('Bulk SMS: Add Twilio keys to .env to send. (SMS is optional)', 'wn'); return; } if (!K.be) { toast('Bulk SMS needs backend URL set in API Keys.', 'wn'); return; } try { const r = await fetch(K.be + '/api/sms/bulk-alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ farmers: ar().map(f => ({ mobile: f.mobile })), alertMsg: msg }) }); const d = await r.json(); toast('Bulk SMS: ' + d.sent + ' sent, ' + d.failed + ' failed', 'ok'); } catch (err) { toast('Error: ' + err.message, 'er'); } }
    function rndAlerts() { const al = ar().filter(r => r.risk !== 'LOW').slice(0, 4); document.getElementById('ralerts').innerHTML = al.length === 0 ? '<p style="color:var(--tx2);font-size:.8rem;text-align:center;padding:18px">No active alerts</p>' : al.map(r => '<div class="ai"><div class="adot" style="background:' + RC[r.risk] + '"></div><div class="ain"><div class="n">' + r.name + ' &mdash; ' + r.crop + '</div><div class="d">' + r.disease + ' &bull; ' + r.village + '</div></div><span class="rt r' + r.risk[0] + '">' + r.risk + '</span></div>').join(''); }
    const ETL = { 'Pink Bollworm': { thresh: 8, crop: 'Cotton', spray: 'Chlorpyrifos 20EC 2mL/L', life: 'Egg→Larva→Pupa→Adult (30-40 days)', hi: 'गुलाबी सुंडी', en: 'Pink Bollworm' }, 'Whitefly': { thresh: 10, crop: 'Cotton, Tomato, Chilli', spray: 'Imidacloprid 17.8SL 0.5mL/L', life: 'Egg→Nymph→Adult (20-28 days)', hi: 'सफेद मक्खी', en: 'Whitefly' }, 'Fall Armyworm': { thresh: 5, crop: 'Maize, Sorghum', spray: 'Emamectin Benzoate 5SG 0.4g/L', life: 'Egg→Larva(6 instars)→Pupa→Adult (30 days)', hi: 'फॉल आर्मीवर्म', en: 'Fall Armyworm' }, 'Fruit Borer': { thresh: 6, crop: 'Tomato, Brinjal', spray: 'Spinosad 45SC 0.75mL/L', life: 'Egg→Larva→Pupa→Adult (28-35 days)', hi: 'फल छेदक', en: 'Fruit Borer' }, 'Aphid': { thresh: 30, crop: 'Wheat, Mustard, Vegetables', spray: 'Dimethoate 30EC 1.5mL/L or Neem oil 5mL/L', life: 'Parthenogenesis (7-10 days per gen)', hi: 'माहू', en: 'Aphid' }, 'Mealybug': { thresh: 10, crop: 'Cotton, Vegetables, Fruits', spray: 'Profenofos 50EC 2mL/L', life: 'Egg→Nymph→Adult (45-50 days)', hi: 'मिलीबग', en: 'Mealybug' }, 'Thrips': { thresh: 20, crop: 'Onion, Cotton, Chilli', spray: 'Fipronil 5SC 1.5mL/L', life: 'Egg→Larva→Pupa→Adult (20-30 days)', hi: 'थ्रिप्स', en: 'Thrips' }, 'Stem Borer': { thresh: 5, crop: 'Rice, Maize, Sugarcane', spray: 'Chlorantraniliprole 18.5SC 0.4mL/L', life: 'Egg→Larva→Pupa→Adult (40-60 days)', hi: 'तना छेदक', en: 'Stem Borer' } };
    const trapHistory = JSON.parse(localStorage.getItem('cgTrap') || '[]');
    function showPestInfo() {
      const pest = document.getElementById('trppest').value;
      const info = ETL[pest];
      if (!info) return;
      document.getElementById('pestInfoTitle').textContent = (curLang === 'hi' ? info.hi : info.en) + ' — ' + pest;
      document.getElementById('pestInfoDesc').innerHTML = `<b>${curLang === 'hi' ? 'प्रभावित फसल' : 'Affected Crop'}:</b> ${info.crop}<br><b>${curLang === 'hi' ? 'जीवन चक्र' : 'Life Cycle'}:</b> ${info.life}<br><b>${curLang === 'hi' ? 'ETL सीमा' : 'ETL Threshold'}:</b> ${info.thresh} insects/trap/week<br><b>${curLang === 'hi' ? 'अनुशंसित स्प्रे' : 'Recommended Spray'}:</b> ${info.spray}`;
    }
    function recordTrap(e) {
      e.preventDefault();
      const pest = document.getElementById('trppest').value;
      const count = parseInt(document.getElementById('trpcount').value);
      const trapId = document.getElementById('trpid').value;
      const date = document.getElementById('trpdate').value;
      const info = ETL[pest];
      const thresh = info ? info.thresh : 10;
      const pct = Math.min(100, Math.round((count / thresh) * 100));
      const isAlert = count >= thresh;
      const fillColor = pct >= 100 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e';
      // ETL Gauge
      document.getElementById('etlGauge').innerHTML = `
    <div style="margin-bottom:10px">
      <div style="font-weight:700;font-size:.9rem;margin-bottom:4px">${pest}</div>
      <div style="font-size:.75rem;color:var(--tx2);margin-bottom:8px">${curLang === 'hi' ? 'जाल ID' : 'Trap ID'}: ${trapId} &bull; ${date}</div>
    </div>
    <div class="etl-bar-wrap">
      <div class="etl-bar-label"><span>${curLang === 'hi' ? 'कीट संख्या' : 'Count'}: <b>${count}</b></span><span>ETL: <b>${thresh}</b></span></div>
      <div class="etl-bar"><div class="etl-fill" style="width:${pct}%;background:${fillColor}"></div></div>
      <div style="font-size:.7rem;color:var(--tx2);margin-top:4px;text-align:right">${pct}% of threshold</div>
    </div>
    <div style="background:${isAlert ? '#fef2f2' : '#f0fdf4'};border:1px solid ${isAlert ? '#ef4444' : '#22c55e'};color:${isAlert ? '#991b1b' : '#166534'};padding:12px;border-radius:10px;margin-top:10px">
      <b><i class="fa fa-${isAlert ? 'triangle-exclamation' : 'check'}"></i> ${isAlert ? (curLang === 'hi' ? 'ETL पार! तुरंत स्प्रे करें' : 'ETL CROSSED! Apply spray immediately') : (curLang === 'hi' ? 'सुरक्षित स्तर' : 'SAFE — Continue monitoring')}</b><br>
      <span style="font-size:.78rem">${curLang === 'hi' ? 'अनुशंसित' : 'Recommended'}: ${info ? info.spray : 'Consult agronomist'}</span>
    </div>`;
      // Result
      const r = document.getElementById('trapRes');
      r.innerHTML = `<div style="background:${isAlert ? '#fef2f2' : '#f0fdf4'};border:1px solid ${isAlert ? '#ef4444' : '#22c55e'};color:${isAlert ? '#991b1b' : '#166534'};padding:12px;border-radius:8px"><b><i class="fa fa-${isAlert ? 'triangle-exclamation' : 'check'}"></i> ${isAlert ? (curLang === 'hi' ? 'चेतावनी' : 'ALERT') + ': ETL CROSSED!' : (curLang === 'hi' ? 'सुरक्षित' : 'SAFE')}</b><br>${curLang === 'hi' ? 'गिनती' : 'Count'} (${count}) ${isAlert ? '>= ' : '< '}ETL (${thresh}) ${curLang === 'hi' ? 'के लिए' : 'for'} ${pest}.</div>`;
      r.style.display = 'block';
      // Save to history
      trapHistory.unshift({ trapId, pest, count, thresh, date, status: isAlert ? 'ALERT' : 'SAFE' });
      localStorage.setItem('cgTrap', JSON.stringify(trapHistory.slice(0, 20)));
      renderTrapLog();
      toast(isAlert ? t('pestAlert') : t('pestSafe'), isAlert ? 'er' : 'ok');
    }
    function renderTrapLog() {
      const logEl = document.getElementById('trapLog');
      if (!trapHistory.length) { logEl.innerHTML = '<p style="color:var(--tx2);font-size:.8rem">No readings recorded yet.</p>'; return; }
      logEl.innerHTML = trapHistory.slice(0, 8).map(h => `<div class="trap-log-item"><div style="width:8px;height:8px;border-radius:50%;background:${h.status === 'ALERT' ? '#ef4444' : '#22c55e'};flex-shrink:0"></div><div style="flex:1"><div style="font-weight:600">${h.pest}</div><div style="font-size:.68rem;color:var(--tx2)">${h.date} &bull; ${h.trapId}</div></div><div style="text-align:right"><div style="font-weight:700;color:${h.status === 'ALERT' ? '#ef4444' : '#22c55e'}">${h.count}/${h.thresh}</div><div style="font-size:.65rem;color:var(--tx2)">${h.status}</div></div></div>`).join('');
    }
    function updCtx() { const f = farmers[farmers.length - 1] || {}; document.getElementById('ctx1').textContent = f.name || 'None registered yet'; document.getElementById('ctx2').textContent = f.crop ? (f.crop + (f.stage ? ' (' + f.stage + ')' : '')) : 'Unknown'; document.getElementById('ctx3').textContent = ld && ld.disease || 'Not detected'; document.getElementById('ctx4').textContent = cw && cw.risk ? cw.risk.level + ' RISK' : 'Fetch weather first'; updFarmerDash(); }
    function updFarmerDash() {
      const f = farmers[farmers.length - 1] || null;
      const cn = document.getElementById('myCropName');
      const fl = document.getElementById('myFarmLoc');
      if (cn) cn.textContent = f ? (f.crop + (f.variety ? ' (' + f.variety + ')' : '')) : (curLang === 'hi' ? 'कोई खेत नहीं' : 'No farm registered yet');
      if (fl) fl.textContent = f ? (f.village + ', ' + f.district) : (curLang === 'hi' ? 'खेत पंजीकृत करें' : 'Register your farm to get started');
      const m1 = document.getElementById('myf1'), m1s = document.getElementById('myf1s');
      const m2 = document.getElementById('myf2'), m2s = document.getElementById('myf2s');
      const m3 = document.getElementById('myf3'), m3s = document.getElementById('myf3s');
      const m4 = document.getElementById('myf4'), m4s = document.getElementById('myf4s');
      if (m1) m1.textContent = f ? f.crop : '--';
      if (m1s) m1s.textContent = f ? (f.stage || '--') : '--';
      if (m2) m2.textContent = f && f.disease ? f.disease.split(' ').slice(0, 2).join(' ') : '--';
      if (m2s) { const col = f && f.confidence > 80 ? 'color:#ef4444' : f && f.confidence > 50 ? 'color:#f59e0b' : ''; m2s.innerHTML = f && f.confidence ? `<span style="${col}">${f.confidence}% ${curLang === 'hi' ? 'आत्मविश्वास' : 'confidence'}</span>` : '--'; }
      if (m3) m3.textContent = cw && cw.risk ? cw.risk.level : '--';
      if (m3s) m3s.textContent = cw ? `${cw.temperature}°C, ${cw.humidity}% ${curLang === 'hi' ? 'नमी' : 'hum'}` : '--';
      if (m4) m4.textContent = f && f.sowingDate ? f.sowingDate : '--';
      if (m4s && f && f.sowingDate) { const days = Math.round((Date.now() - new Date(f.sowingDate)) / (86400000)); m4s.textContent = days > 0 ? days + (curLang === 'hi' ? ' दिन' : ' days ago') : '--'; }
    }
    const MHI = ['Aapki fasal ko turant dhyan ki zaroorat hai. Mancozeb 75WP 2g/L paani mein spray karein. Prabhavit pattiyaan hatayein. Har 10 din repeat karein. KCC: 1800-180-1551', 'Zyada nami se rog failta hai. Neem oil 5mL/L spray karein. Khet ki drainage sudharein.'];
    const MEN = ['Your crop needs immediate attention. Apply Mancozeb 75WP at 2g/L. Remove infected leaves. Repeat every 10 days. KCC Helpline: 1800-180-1551', 'High humidity increases disease spread. Apply neem oil (5mL/L) every 7 days. Improve field drainage.'];
    async function sendChat() {
      const inp = document.getElementById('cinp'), msg = inp.value.trim(); if (!msg) return; addMsg(msg, 'usr'); inp.value = ''; const th = addThink(); const f = farmers[farmers.length - 1] || {}; const hi = /[\u0900-\u097F]/.test(msg) || f.lang === 'hi'; let rep; if (K.oa && K.be) { try { const r = await fetch(K.be + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, crop: f.crop, disease: ld && ld.disease, weather: cw, lang: f.lang, history: CH.slice(-6) }) }); rep = (await r.json()).reply; } catch (e) { rep = (hi ? MHI : MEN)[0]; } } else if (K.oa) { try { const sys = 'You are CropGuard AI, expert Indian agricultural advisor. Crop: ' + (f.crop || '?') + '. Disease: ' + (ld && ld.disease || 'none') + '. Reply in Hindi Devanagari if Hindi input, else English. Specific pesticide names + dosages. Max 150 words.'; const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + K.oa }, body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: sys }, ...CH.slice(-6), { role: 'user', content: msg }], max_tokens: 300, temperature: 0.7 }) }); rep = (await r.json()).choices[0].message.content; } catch (e) { rep = (hi ? MHI : MEN)[0]; } } else { rep = (hi ? MHI : MEN)[Math.floor(Math.random() * 2)]; }
      th.remove(); CH.push({ role: 'user', content: msg }, { role: 'assistant', content: rep }); addMsg(rep, 'bot'); if (K.el) spkEL(rep);
    }
    function qp(m) { document.getElementById('cinp').value = m; sendChat(); }
    function addThink() { const b = document.getElementById('chatmsgs'); const r = document.createElement('div'); r.className = 'mr'; r.innerHTML = '<div class="ma bot"><i class="fa fa-robot"></i></div><div><div class="bub bot thk">Thinking...</div></div>'; b.appendChild(r); b.scrollTop = b.scrollHeight; return r; }
    function addMsg(txt, cls) { const b = document.getElementById('chatmsgs'); const iu = cls === 'usr'; const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); const r = document.createElement('div'); r.className = 'mr' + (iu ? ' u' : ''); r.innerHTML = '<div class="ma ' + (iu ? 'usr' : 'bot') + '"><i class="fa fa-' + (iu ? 'user' : 'robot') + '"></i></div><div><div class="bub ' + cls + '">' + txt.replace(/\n/g, '<br>') + '</div><div class="mt">' + now + '</div></div>'; b.appendChild(r); b.scrollTop = b.scrollHeight; }
    document.getElementById('cinp').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
    function tvoc() { isv ? stpV() : strtV(); }
    function strtV() { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) { toast('Voice not supported in this browser', 'wn'); return; } recog = new SR(); recog.lang = 'hi-IN'; recog.onresult = e => { document.getElementById('cinp').value = e.results[0][0].transcript; stpV(); sendChat(); }; recog.onerror = stpV; recog.onend = stpV; recog.start(); isv = true; const b = document.getElementById('vbtn'); b.classList.add('ls'); b.innerHTML = '<i class="fa fa-stop"></i>'; toast('Listening...', ''); }
    function stpV() { if (recog) { recog.stop(); recog = null; } isv = false; const b = document.getElementById('vbtn'); b.classList.remove('ls'); b.innerHTML = '<i class="fa fa-microphone"></i>'; }
    async function spkEL(txt) { if (!K.el) return; try { const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + (K.ev || '21m00Tcm4TlvDq8ikWAM'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': K.el }, body: JSON.stringify({ text: txt.slice(0, 500), model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }) }); new Audio(URL.createObjectURL(await r.blob())).play(); } catch (_) { } }
    function om(id) { document.getElementById(id).classList.add('op'); }
    function cm2(id) { document.getElementById(id).classList.remove('op'); }
    function toast(msg, type) { const s = document.getElementById('ts'); const t = document.createElement('div'); t.className = 'to ' + (type || ''); const i = { ok: '&#10003;', er: '&#10005;', wn: '&#9888;', '': '&#8505;' }; t.innerHTML = (i[type] || '&#8505;') + ' ' + msg; s.appendChild(t); setTimeout(() => { t.style.animation = 'none'; t.style.opacity = '0'; t.style.transform = 'translateX(28px)'; t.style.transition = 'all .3s ease'; setTimeout(() => t.remove(), 300); }, 3500); }
    async function initConvAI() {
      let agentId = K.ea;
      if (!agentId) {
        try { let r = await fetch((K.be || '') + '/api/config'); let c = await r.json(); agentId = c.agentId; } catch (e) { }
      }
      if (agentId && !document.querySelector('elevenlabs-convai')) {
        const el = document.createElement('elevenlabs-convai');
        el.setAttribute('agent-id', agentId);
        document.body.appendChild(el);
        if (!document.getElementById('el-convai-script')) {
          const script = document.createElement('script');
          script.id = 'el-convai-script';
          script.src = 'https://elevenlabs.io/convai-widget/index.js';
          script.async = true;
          script.type = 'text/javascript';
          document.head.appendChild(script);
        }
      }
    }
    // --- GPS for Registration Map ---
    function autoLocateReg() {
      if (!navigator.geolocation) { toast(curLang === 'hi' ? 'GPS ब्राउज़र में समर्थित नहीं' : 'GPS not supported', 'wn'); return; }
      const btn = document.getElementById('regGpsBtn');
      btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> ' + (curLang === 'hi' ? 'स्थान खोज रहा है...' : 'Locating...');
      btn.disabled = true;
      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude.toFixed(6), lon = pos.coords.longitude.toFixed(6);
        document.getElementById('flat').value = lat;
        document.getElementById('flon').value = lon;
        const g = document.getElementById('gps'); g.style.display = 'flex';
        g.innerHTML = '<i class="fa fa-location-dot"></i> GPS: ' + parseFloat(lat).toFixed(4) + ', ' + parseFloat(lon).toFixed(4);
        // Reverse geocode and fill village field
        try {
          const rr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const dd = await rr.json();
          const vill = dd.address && (dd.address.village || dd.address.suburb || dd.address.town || dd.address.city) || '';
          const dist = dd.address && (dd.address.county || dd.address.state_district) || '';
          if (vill && !document.getElementById('fv').value) document.getElementById('fv').value = vill;
          if (dist && !document.getElementById('fd').value) document.getElementById('fd').value = dist;
        } catch (_) { }
        btn.innerHTML = '<i class="fa fa-location-crosshairs"></i> ' + (curLang === 'hi' ? 'GPS से स्वचालित स्थान' : 'Auto-detect via GPS');
        btn.disabled = false;
        toast(t('gpsOk'), 'ok');
        // Re-init map to show marker
        if (rmi && rmark) { }
      }, err => {
        btn.innerHTML = '<i class="fa fa-location-crosshairs"></i> ' + (curLang === 'hi' ? 'GPS से स्वचालित स्थान' : 'Auto-detect via GPS');
        btn.disabled = false;
        toast(t('gpsDenied'), 'wn');
      }, { timeout: 10000 });
    }
    document.addEventListener('DOMContentLoaded', () => {
      lk();
      curLang = localStorage.getItem('cgLang') || 'hi';
      setLang(curLang);
      try { farmers = JSON.parse(localStorage.getItem('cgf') || '[]'); } catch (_) { farmers = []; }
      // Restore dashboard stats
      document.getElementById('s1').textContent = farmers.length;
      document.getElementById('s4').textContent = ar().filter(r => r.status === 'validated').length;
      document.getElementById('pb').textContent = ar().filter(r => r.status.startsWith('pending')).length;
      // Show farmer sidebar items by default (before login)
      document.querySelectorAll('.farmer-only').forEach(e => e.style.display = 'flex');
      document.querySelectorAll('.officer-only').forEach(e => e.style.display = 'none');
      // Init pest info
      showPestInfo();
      renderTrapLog();
      rndAlerts();
      updCtx();
      initConvAI();
    });
  