/* Действия (data-act): профиль, ответы, плеер, Writing, Speaking, словарь, данные */
(function () {
  'use strict';
  const IE = window.IE, U = IE.util, ST = IE.store, A = IE.acts, esc = U.esc;
  const $ = (id) => document.getElementById(id);

  /* ---------- Профиль ---------- */
  A.createProfile = () => {
    if (!ST.create($('newName').value)) return;
    ST.setTarget(+$('newTarget').value);
    ST.setExamDate($('newDate').value);
    location.hash = '#/'; IE.refresh();
  };
  A.switchProfile = (el) => { ST.switchTo(el.dataset.name); location.hash = '#/'; IE.refresh(); };
  A.newProfile = () => { ST.logout(); IE.refresh(); };
  A.toggleLesson = (el) => { ST.setLesson(el.dataset.id, !ST.p().lessons[el.dataset.id]); IE.refresh(); };
  A.toggle = (el) => { const e = $(el.dataset.target); e.hidden = !e.hidden; };
  A.revTab = (el) => {
    $('rl').hidden = el.dataset.t !== 'rl'; $('rr').hidden = el.dataset.t !== 'rr';
    document.querySelectorAll('.tabs .btn').forEach((b) => b.classList.toggle('on', b === el));
  };

  /* ---------- Ответы ---------- */
  A.pick = (el) => {
    const v = /^\d+$/.test(el.dataset.v) ? +el.dataset.v : el.dataset.v;
    IE.cur.answers[el.dataset.q] = v;
    el.parentElement.querySelectorAll('[data-act="pick"]').forEach((b) => b.classList.toggle('sel', b === el));
    IE.cur.onChange && IE.cur.onChange();
  };
  // «Choose TWO»: хранится массив индексов, при превышении лимита вытесняется самый старый выбор
  A.pickms = (el) => {
    const q = IE.qById[el.dataset.q], v = +el.dataset.v, cur = IE.cur;
    let g = (cur.answers[q.id] || []).slice();
    g = g.includes(v) ? g.filter((x) => x !== v) : g.concat(v);
    while (g.length > q.pick) g.shift();
    cur.answers[q.id] = g;
    el.parentElement.querySelectorAll('[data-act="pickms"]').forEach((b) => b.classList.toggle('sel', g.includes(+b.dataset.v)));
    cur.onChange && cur.onChange();
  };
  A.inp = (el) => {
    const v = el.tagName === 'SELECT' ? (el.value === '' ? undefined : +el.value) : el.value;
    if (v === undefined) delete IE.cur.answers[el.dataset.q]; else IE.cur.answers[el.dataset.q] = v;
    IE.cur.onChange && IE.cur.onChange();
  };
  A.check = () => {
    const cur = IE.cur, s = cur.set;
    if (cur.checked) return;
    let c = 0;
    s.qs.forEach((q) => { c += IE.score(q, cur.answers[q.id]); ST.recordAnswer(q, IE.isCorrect(q, cur.answers[q.id])); });
    cur.checked = true;
    ST.recordSet(s.id, c, s.marks);
    IE.refresh();
  };
  A.retry = () => { IE.tts.stop(); IE.practice = null; IE.refresh(); };

  /* ---------- Аудио-плеер ---------- */
  A.lPlay = () => {
    const cur = IE.cur, s = cur.set, btn = $('pbtn');
    if (!s || !s.script) return;
    cur.plays = cur.plays || {};
    if (cur.once && cur.plays[s.id]) { $('pstat').textContent = 'В Timed-режиме запись звучит один раз.'; return; }
    cur.plays[s.id] = (cur.plays[s.id] || 0) + 1;
    if (btn) btn.disabled = !!cur.once;
    const rate = +($('prate') || { value: 1 }).value;
    $('pstat').textContent = 'Играет…';
    IE.tts.play(s.script, {
      rate,
      onProgress: (i, n) => { const b = document.querySelector('#pbar > i'); if (b) b.style.width = Math.round(((i + 1) / n) * 100) + '%'; },
      onEnd: (fin) => { const e = $('pstat'); if (e) e.textContent = fin ? 'Запись закончилась.' : 'Озвучка недоступна — используйте транскрипт после проверки.'; if (fin) cur.onAudioEnd && cur.onAudioEnd(); },
    });
  };
  A.lStop = () => { IE.tts.stop(); const e = $('pstat'); if (e) e.textContent = 'Остановлено.'; const b = $('pbtn'); if (b && !(IE.cur.once)) b.disabled = false; };

  /* ---------- Writing ---------- */
  A.wTimer = (el) => {
    IE.tick('w', +el.dataset.min * 60, 'wtimer', () => IE.campus.toast('⏱ Время вышло! Завершите мысль и проверьте текст.'));
  };
  A.wSaveDraft = () => {
    const id = location.hash.split('/')[2];
    ST.p().drafts[id] = $('wtext').value; ST.save(); IE.campus.toast('Черновик сохранён');
  };
  A.wClear = () => { if (confirm('Очистить текст?')) { $('wtext').value = ''; A.wLive(); } };
  const critBand = () => IE.halfBand(Array.from(document.querySelectorAll('.js-crit')).reduce((a, s) => a + +s.value, 0) / document.querySelectorAll('.js-crit').length);
  A.crit = (el) => {
    const set = location.hash.includes('/speak/') ? IE.CRITERIA.speaking : IE.CRITERIA.writing;
    const c = set.find((x) => x.id === el.dataset.id), v = +el.value;
    $('d-' + c.id).textContent = c.d[Math.max(5, Math.min(9, Math.floor(v)))];
    $('wband').textContent = critBand().toFixed(1);
  };
  A.wSave = (el) => {
    const t = IE.analyze($('wtext').value);
    if (t.words < 30) { IE.campus.toast('Напишите хотя бы 30 слов, прежде чем сохранять.'); return; }
    const task = IE.writingTasks.find((x) => x.id === el.dataset.id);
    ST.addWriting({ id: task.id, task: task.task, words: t.words, band: critBand(), ts: Date.now(), text: $('wtext').value, grade: IE.lastGrade ? { source: IE.lastGrade.source, overall: IE.lastGrade.overall } : null });
    delete ST.p().drafts[task.id]; ST.save();
    IE.campus.toast('Работа сохранена. Band ' + critBand().toFixed(1)); IE.refresh();
  };
  A.wLoad = (el) => {
    const h = ST.p().writing.filter((w) => w.id === el.dataset.id)[+el.dataset.i];
    if (h) { $('wtext').value = h.text; A.wLive(); window.scrollTo(0, 0); }
  };

  /* ---------- Проверка Writing ---------- */
  const critSet = () => (location.hash.includes('/speak/') ? IE.CRITERIA.speaking : IE.CRITERIA.writing);
  function applyBands(res, keys) {
    keys.forEach((k) => {
      const s = document.querySelector('.js-crit[data-id="' + k + '"]');
      if (s && res.bands[k] !== null && res.bands[k] !== undefined) { s.value = String(Math.min(9, Math.max(3, res.bands[k]))); A.crit(s); }
    });
  }
  const busy = (el, on) => { el.disabled = on; el.dataset.t = el.dataset.t || el.textContent; el.textContent = on ? 'Проверяю…' : el.dataset.t; };
  A.wCheck = async (el) => {
    const text = $('wtext').value, id = location.hash.split('/')[2], task = IE.writingTasks.find((x) => x.id === id), out = $('gout');
    if (IE.analyze(text).words < 30) { out.innerHTML = '<div class="notice">Напишите хотя бы 30 слов — иначе проверять нечего.</div>'; return; }
    try {
      let res;
      if (el.dataset.mode === 'ai') {
        if (!IE.grade.hasKey()) { out.innerHTML = '<div class="notice">Для проверки Claude добавьте API-ключ в My Locker → Настройки проверки. Пока доступна офлайн-проверка.</div>'; return; }
        busy(el, true); out.innerHTML = '<p class="muted">Claude оценивает текст…</p>';
        res = await IE.grade.writingAI(text, task.task, task);
      } else res = IE.grade.writingOffline(text, task.task, task);
      IE.lastGrade = res;
      out.innerHTML = IE.grade.panel(res, ['ta', 'cc', 'lr', 'gra']);
      applyBands(res, ['ta', 'cc', 'lr', 'gra']);
    } catch (e) { out.innerHTML = '<div class="notice">' + esc(IE.grade.errorText(e)) + '</div>'; }
    busy(el, false);
  };

  /* ---------- Speaking ---------- */
  IE.slots = {};
  A.sAsk = (el) => IE.tts.say(el.dataset.q);
  let slot = null;
  const trEl = (s) => $('tr-' + s);
  function sttBegin(s) {
    IE.slots[s] = { t0: Date.now(), text: (trEl(s) && trEl(s).value) || '' };
    if (IE.stt.supported) IE.stt.start((txt) => { if (trEl(s)) trEl(s).value = txt; });
  }
  function sttEnd(s) {
    const r = IE.stt.active ? IE.stt.stop() : { text: '', seconds: 0, confidence: null }, rec = IE.slots[s] || (IE.slots[s] = { t0: Date.now() });
    rec.seconds = r.seconds || (Date.now() - rec.t0) / 1000;
    rec.confidence = r.confidence;
    if (r.text) { rec.text = r.text; if (trEl(s)) trEl(s).value = r.text; }
  }
  A.sTrans = (el) => { const s = el.dataset.slot; (IE.slots[s] = IE.slots[s] || {}).text = el.value; };
  async function stopRec() {
    if (!IE.rec.active()) return;
    const s = slot; slot = null;
    sttEnd(s);
    const url = await IE.rec.stop(), box = $('rec-' + s);
    if (url && box) box.innerHTML = `<audio controls src="${url}"></audio>`;
    document.querySelectorAll('[data-act="sRec"]').forEach((b) => { b.textContent = '🎙 Record'; b.classList.remove('rec'); });
  }
  A.sRec = async (el) => {
    const s = el.dataset.slot;
    if (IE.rec.active()) { const same = slot === s; await stopRec(); if (same) return; }
    try {
      await IE.rec.start(); slot = s; sttBegin(s); el.textContent = '■ Stop'; el.classList.add('rec');
    } catch (e) { IE.campus.toast('Не удалось включить микрофон. Разрешите доступ или введите текст ответа вручную.'); }
  };
  A.sPrep = () => { $('sphase').textContent = 'Preparation'; IE.tick('s', 60, 'stimer', () => A.sSpeakNow()); };
  A.sSpeakNow = async () => {
    await stopRec();
    try { await IE.rec.start(); slot = 'main'; sttBegin('main'); } catch (e) { IE.campus.toast('Микрофон недоступен — говорите без записи и введите текст ниже.'); }
    $('sphase').textContent = 'Speaking';
    IE.tick('s', 120, 'stimer', () => { $('sphase').textContent = 'Done'; stopRec(); IE.tts.say('Thank you. That is the end of Part 2.'); });
  };
  A.sCheck = async (el) => {
    const task = IE.speakingTasks.find((x) => x.id === el.dataset.id), out = $('sgout');
    document.querySelectorAll('.strans').forEach((t) => { if (t.value) (IE.slots[t.dataset.slot] = IE.slots[t.dataset.slot] || {}).text = t.value; });
    const parts = Object.values(IE.slots).filter((x) => x.text && x.text.trim());
    const text = parts.map((x) => x.text.trim()).join('\n\n'), n = IE.analyze(text).words;
    if (n < 15) { out.innerHTML = '<div class="notice">Нет текста ответа: запишите ответ (при работающем распознавании речи) или впишите транскрипт в поле под вопросом.</div>'; return; }
    const secs = parts.reduce((a, x) => a + (x.seconds || 0), 0), confs = parts.map((x) => x.confidence).filter(Boolean);
    const meta = { part: task.part, seconds: secs || null, wpm: secs ? Math.round(n / (secs / 60)) : null, confidence: confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null, prompt: task.part === 2 ? task.topic + ' — ' + task.bullets.join('; ') + ' | Part 3: ' + task.part3.join(' / ') : task.qs.join(' / ') };
    try {
      let res;
      if (el.dataset.mode === 'ai') {
        if (!IE.grade.hasKey()) { out.innerHTML = '<div class="notice">Для проверки Claude добавьте API-ключ в My Locker → Настройки проверки.</div>'; return; }
        busy(el, true); out.innerHTML = '<p class="muted">Claude оценивает ответ…</p>';
        res = await IE.grade.speakingAI(text, meta);
      } else res = IE.grade.speakingOffline(text, meta);
      IE.lastGrade = res;
      out.innerHTML = IE.grade.panel(res, ['fc', 'lr', 'gra', 'pr']) + `<details><summary class="small muted">Использованный транскрипт</summary><div class="passage">${esc(text).replace(/\n/g, '<br>')}</div></details>`;
      applyBands(res, ['fc', 'lr', 'gra', 'pr']);
    } catch (e) { out.innerHTML = '<div class="notice">' + esc(IE.grade.errorText(e)) + '</div>'; }
    busy(el, false);
  };
  A.sSave = (el) => {
    const task = IE.speakingTasks.find((t) => t.id === el.dataset.id);
    ST.addSpeaking({ id: task.id, part: task.part, band: critBand(), ts: Date.now(), grade: IE.lastGrade ? { source: IE.lastGrade.source, overall: IE.lastGrade.overall } : null });
    IE.campus.toast('Сессия сохранена. Band ' + critBand().toFixed(1)); IE.refresh();
  };
  /* ---------- Словарь ---------- */
  A.vFlip = () => { IE.vsess.flipped = true; IE.refresh(); };
  A.vSay = (el) => IE.tts.say(el.dataset.w, 0.85);

  /* ---------- Результаты и данные ---------- */
  A.saveWS = (el) => {
    const t = ST.p().tests[+el.dataset.i], w = $('rW').value, s = $('rS').value;
    if (w !== '') t.W = +w;
    t.S = s === '' ? null : +s;
    t.overall = IE.testOverall(t) ?? t.overall;
    ST.save(); IE.campus.check(); IE.refresh();
  };
  A.rGradeAI = async (el) => {
    const t = ST.p().tests[+el.dataset.i], out = $('rgout');
    if (!IE.grade.hasKey()) { out.innerHTML = '<div class="notice">Добавьте API-ключ в My Locker → Настройки проверки.</div>'; return; }
    busy(el, true); out.innerHTML = '<p class="muted">Claude оценивает оба задания…</p>';
    try {
      const test = IE.tests.find((x) => x.id === t.testId);
      const grades = [];
      for (let n = 0; n < 2; n++) {
        const w = t.Wd[n], task = IE.writingTasks.find((x) => x.id === test.writing[n]);
        grades.push(w.words >= 20 ? await IE.grade.writingAI(w.text, n + 1, task) : null);
      }
      grades.forEach((g, n) => { if (g) t.Wd[n].grade = g; });
      t.W = IE.grade.writingTotal(grades[0] ? grades[0].overall : 0, grades[1] ? grades[1].overall : 0);
      t.overall = IE.testOverall(t) ?? t.overall;
      ST.save(); IE.refresh();
    } catch (e) { out.innerHTML = '<div class="notice">' + esc(IE.grade.errorText(e)) + '</div>'; busy(el, false); }
  };
  A.saveKey = () => { const v = $('apiKey').value.trim(); if (v.length < 20) { $('keyStatus').textContent = 'Ключ слишком короткий.'; return; } IE.grade.setKey(v); $('apiKey').value = ''; $('keyStatus').textContent = 'Статус: ключ сохранён в этом браузере.'; };
  A.clearKey = () => { IE.grade.setKey(''); $('keyStatus').textContent = 'Статус: ключ удалён.'; };
  A.testKey = async () => {
    $('keyStatus').textContent = 'Проверяю…';
    try { await IE.grade.testKey(); $('keyStatus').textContent = 'Статус: ключ работает ✓'; } catch (e) { $('keyStatus').textContent = 'Статус: ' + IE.grade.errorText(e); }
  };  A.exportData = () => { $('dataBox').value = ST.exportJSON(); $('dataBox').select(); };
  A.importData = () => {
    try { ST.importJSON($('dataBox').value); IE.campus.toast('Данные импортированы'); location.hash = '#/'; IE.refresh(); } catch (e) { IE.campus.toast('Не удалось прочитать JSON'); }
  };
  A.resetProfile = () => { if (confirm('Сбросить весь прогресс профиля?')) { ST.resetProfile(); IE.refresh(); } };
  A.deleteProfile = () => { if (confirm('Удалить профиль «' + ST.name() + '»?')) { ST.remove(ST.name()); location.hash = '#/'; IE.refresh(); } };
})();

