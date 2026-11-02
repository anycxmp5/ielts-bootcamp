/* Инструменты: озвучка (speechSynthesis), запись голоса, SVG-графики для Writing Task 1, анализатор текста */
(function () {
  'use strict';
  const IE = window.IE, esc = IE.util.esc;

  /* ---------- Озвучка ---------- */
  const tts = (IE.tts = { supported: 'speechSynthesis' in window, voices: [], token: 0, state: null });
  function loadVoices() {
    if (!tts.supported) return;
    const all = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
    const gb = all.filter((v) => /en[-_]GB/i.test(v.lang));
    tts.voices = gb.length >= 2 ? gb : all;
  }
  if (tts.supported) { loadVoices(); speechSynthesis.addEventListener('voiceschanged', loadVoices); }

  const SPEAKER_STYLE = { A: { pitch: 1, i: 0 }, B: { pitch: 0.85, i: 1 }, C: { pitch: 1.15, i: 2 } };
  const sentences = (t) => t.match(/[^.?!]+[.?!]+["')’]*\s*|[^.?!]+$/g) || [t];

  // Разбивает скрипт на короткие реплики: [{ speaker, text, line }]
  tts.queue = (script) => {
    const out = [];
    script.forEach(([sp, text], line) => sentences(text).forEach((s) => { if (s.trim()) out.push({ speaker: sp, text: s.trim(), line }); }));
    return out;
  };
  function speakOne(item, rate, done) {
    const u = new SpeechSynthesisUtterance(item.text);
    const st = SPEAKER_STYLE[item.speaker] || SPEAKER_STYLE.A;
    if (tts.voices.length) u.voice = tts.voices[st.i % tts.voices.length];
    u.lang = 'en-GB'; u.rate = rate; u.pitch = st.pitch;
    let fin = false;
    const end = () => { if (!fin) { fin = true; done(); } };
    u.onend = end; u.onerror = end;
    speechSynthesis.speak(u);
  }
  // Проигрывание: opts = { rate, from, onProgress(i, n), onEnd(finished) }
  tts.play = (script, opts) => {
    if (!tts.supported) { opts.onEnd(false); return; }
    tts.stop();
    const q = tts.queue(script), my = ++tts.token;
    let i = opts.from || 0;
    const step = () => {
      if (my !== tts.token) return;
      if (i >= q.length) { opts.onEnd(true); return; }
      opts.onProgress && opts.onProgress(i, q.length);
      const k = i++;
      speakOne(q[k], opts.rate || 1, () => { if (my === tts.token) { tts.pos = i; step(); } });
    };
    tts.pos = i; step();
    return q.length;
  };
  tts.stop = () => { tts.token++; if (tts.supported) speechSynthesis.cancel(); };
  tts.say = (text, rate) => {
    if (!tts.supported) return;
    tts.stop();
    speakOne({ speaker: 'C', text }, rate || 0.95, () => {});
  };

  /* ---------- Запись голоса ---------- */
  const rec = (IE.rec = { mr: null, chunks: [], stream: null, supported: !!(navigator.mediaDevices && window.MediaRecorder) });
  rec.start = async function () {
    if (!rec.supported) throw new Error('unsupported');
    rec.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    rec.chunks = [];
    rec.mr = new MediaRecorder(rec.stream);
    rec.mr.ondataavailable = (e) => e.data.size && rec.chunks.push(e.data);
    rec.mr.start();
  };
  rec.stop = () => new Promise((resolve) => {
    if (!rec.mr || rec.mr.state === 'inactive') { resolve(null); return; }
    rec.mr.onstop = () => {
      rec.stream.getTracks().forEach((t) => t.stop());
      resolve(URL.createObjectURL(new Blob(rec.chunks, { type: rec.mr.mimeType || 'audio/webm' })));
    };
    rec.mr.stop();
  });
  rec.active = () => !!(rec.mr && rec.mr.state === 'recording');

  /* ---------- SVG-графики ---------- */
  const COLORS = ['#c8102e', '#0b2455', '#f2b705', '#1f8f4e', '#7a4fc4'];
  function lineChart(c) {
    const W = 560, H = 300, L = 46, R = 16, T = 30, B = 44, max = Math.ceil(Math.max.apply(null, c.series.flatMap((s) => s.v)) / 20) * 20 || 20;
    const x = (i) => L + ((W - L - R) * i) / (c.x.length - 1), y = (v) => T + (H - T - B) * (1 - v / max);
    let g = '';
    for (let k = 0; k <= 5; k++) { const v = (max / 5) * k; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#c8d3ea"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="12">${Math.round(v)}</text>`; }
    c.x.forEach((l, i) => { g += `<text x="${x(i)}" y="${H - B + 18}" text-anchor="middle" font-size="12">${esc(l)}</text>`; });
    c.series.forEach((s, k) => {
      g += `<polyline fill="none" stroke="${COLORS[k]}" stroke-width="3" points="${s.v.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/>`;
      s.v.forEach((v, i) => { g += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${COLORS[k]}"/>`; });
    });
    return svg(c, W, H, g);
  }
  function barChart(c) {
    const W = 560, H = 300, L = 46, R = 16, T = 30, B = 52, max = Math.ceil(Math.max.apply(null, c.series.flatMap((s) => s.v)) / 5) * 5 || 5;
    const y = (v) => T + (H - T - B) * (1 - v / max), gw = (W - L - R) / c.x.length, bw = (gw * 0.7) / c.series.length;
    let g = '';
    for (let k = 0; k <= 5; k++) { const v = (max / 5) * k; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#c8d3ea"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="12">${Math.round(v)}</text>`; }
    c.x.forEach((l, i) => {
      g += `<text x="${L + gw * i + gw / 2}" y="${H - B + 18}" text-anchor="middle" font-size="12">${esc(l)}</text>`;
      c.series.forEach((s, k) => {
        const bx = L + gw * i + gw * 0.15 + bw * k;
        g += `<rect x="${bx}" y="${y(s.v[i])}" width="${bw}" height="${y(0) - y(s.v[i])}" fill="${COLORS[k]}"/><text x="${bx + bw / 2}" y="${y(s.v[i]) - 4}" text-anchor="middle" font-size="12" font-weight="700">${s.v[i]}</text>`;
      });
    });
    return svg(c, W, H, g);
  }
  function svg(c, W, H, body) {
    const legend = c.series.map((s, k) => `<span><i style="background:${COLORS[k]}"></i>${esc(s.name)}</span>`).join('');
    return `<figure class="chartfig"><figcaption>${esc(c.title)}${c.unit ? ' (' + esc(c.unit) + ')' : ''}</figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}" fill="currentColor" font-family="Source Sans 3, sans-serif">${body}</svg><div class="legend">${legend}</div></figure>`;
  }
  function pie(c) {
    return `<div class="pies">${c.charts.map((ch) => {
      const tot = ch.parts.reduce((a, p) => a + p.v, 0); let a0 = -Math.PI / 2, path = '';
      ch.parts.forEach((p, k) => {
        const a1 = a0 + (p.v / tot) * Math.PI * 2, r = 90, cx = 110, cy = 110, large = a1 - a0 > Math.PI ? 1 : 0;
        path += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${COLORS[k]}" stroke="#fff" stroke-width="2"/>`;
        a0 = a1;
      });
      const leg = ch.parts.map((p, k) => `<span><i style="background:${COLORS[k]}"></i>${esc(p.name)} ${p.v}%</span>`).join('');
      return `<figure class="chartfig"><figcaption>${esc(ch.title)}</figcaption><svg viewBox="0 0 220 220" role="img" aria-label="${esc(ch.title)}">${path}</svg><div class="legend">${leg}</div></figure>`;
    }).join('')}</div>`;
  }
  function table(c) {
    return `<figure class="chartfig"><figcaption>${esc(c.title)}</figcaption><table class="data"><tr>${c.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${c.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table></figure>`;
  }
  IE.chart = (c) => ({ line: lineChart, bar: barChart, pie, table }[c.type](c));

  /* ---------- Анализатор текста (Writing) ---------- */
  IE.analyze = function (text) {
    const t = text.trim(), words = t ? t.match(/[A-Za-z’'-]+/g) || [] : [];
    const paras = t ? t.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const sents = t ? (t.match(/[^.!?]+[.!?]+/g) || [t]).length : 0;
    const low = ' ' + t.toLowerCase().replace(/\s+/g, ' ') + ' ';
    const connectors = IE.CONNECTORS.filter((c) => low.includes(' ' + c + ' ') || low.includes(' ' + c + ','));
    const freq = {};
    words.map((w) => w.toLowerCase().replace(/’/g, "'")).forEach((w) => { if (w.length > 3 && !IE.STOPWORDS.includes(w)) freq[w] = (freq[w] || 0) + 1; });
    const repeated = Object.entries(freq).filter((e) => e[1] >= 4).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w, n]) => ({ w, n }));
    const contractions = (t.match(/\b\w+(n’t|n't|’m|'m|’re|'re|’ll|'ll|’ve|'ve)\b/gi) || []).length;
    const unique = new Set(words.map((w) => w.toLowerCase())).size;
    return {
      words: words.length, paragraphs: paras, sentences: sents,
      avgLen: sents ? Math.round((words.length / sents) * 10) / 10 : 0,
      connectors, repeated, contractions, diversity: words.length ? Math.round((unique / words.length) * 100) : 0,
      iThink: (low.match(/ i think /g) || []).length,
    };
  };
})();
