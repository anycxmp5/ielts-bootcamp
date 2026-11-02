/* Ядро: структура экзамена, утилиты, хранилище прогресса, проверка ответов, пересчёт в Band */
(function () {
  'use strict';
  const IE = (window.IE = window.IE || {});
  IE.acts = IE.acts || {};

  IE.SKILLS = {
    listening: { id: 'listening', name: 'Listening', ru: 'Аудирование', icon: '🎧', minutes: 30 },
    reading: { id: 'reading', name: 'Reading', ru: 'Чтение', icon: '📖', minutes: 60 },
    writing: { id: 'writing', name: 'Writing', ru: 'Письмо', icon: '✍️', minutes: 60 },
    speaking: { id: 'speaking', name: 'Speaking', ru: 'Говорение', icon: '🗣️', minutes: 14 },
  };
  IE.SKILL_IDS = ['listening', 'reading', 'writing', 'speaking'];
  IE.TYPE_NAMES = { tf: 'True / False / Not Given', yn: 'Yes / No / Not Given', mc: 'Multiple choice', ms: 'Choose TWO', gap: 'Completion', sel: 'Matching' };

  /* ---------- Утилиты ---------- */
  const U = (IE.util = {});
  U.rng = function (seed) { // mulberry32
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.shuffle = (arr, rnd) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rnd || Math.random)() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.fmtTime = (sec) => {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const p = (n) => String(n).padStart(2, '0');
    return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
  };
  U.pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  U.date = (ts) => new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  U.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  U.dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
  U.band = (b) => (b === null || b === undefined || Number.isNaN(b) ? '—' : Number(b).toFixed(1));

  /* ---------- Реестр наборов заданий (Reading-тексты и Listening-части) ---------- */
  IE.sets = [];
  IE.addSets = (list) => list.forEach((s) => IE.sets.push(s));
  IE.lessons = [];
  IE.addLessons = (list) => list.forEach((l) => IE.lessons.push(l));
  IE.writingTasks = [];
  IE.speakingTasks = [];
  IE.vocab = [];

  // Конструкторы заданий. Ответы: tf — 'T'|'F'|'NG', yn — 'Y'|'N'|'NG', mc/sel — индекс, gap — список допустимых слов
  IE.tf = (q, answer, exp) => ({ t: 'tf', q, answer, exp });
  IE.yn = (q, answer, exp) => ({ t: 'yn', q, answer, exp });
  IE.mc = (q, choices, answer, exp) => ({ t: 'mc', q, choices, answer, exp });
  IE.gap = (q, answer, exp) => ({ t: 'gap', q, answer: [].concat(answer), exp });
  IE.sel = (q, opts, answer, exp) => ({ t: 'sel', q, opts, answer, exp });
  IE.group = (inst, list) => { list[0].inst = inst; return list; };
  // «Choose TWO letters»: answer — массив индексов (порядок не важен), даёт 2 балла (по одному за верный вариант)
  IE.ms = (q, choices, answer, exp) => ({ t: 'ms', q, choices, answer, pick: answer.length, exp });

  // Полные тесты: IE.tests[i] = { id, title, listening:[setId], reading:[setId], writing:[taskId,taskId], speaking:{p1,p2} }
  IE.tests = [];
  IE.addTests = (list) => list.forEach((t) => IE.tests.push(t));

  IE.init = function () {
    IE.qById = {};
    IE.setById = {};
    IE.sets.forEach((s) => {
      IE.setById[s.id] = s;
      let no = 1;
      s.test = s.test || 0; // 0 — отдельные тренировки вне полных тестов
      s.qs.forEach((q, i) => {
        q.id = s.id + '-' + (i + 1);
        q.set = s.id;
        q.n = i + 1;
        q.no = no; // номер вопроса внутри набора (у ms занимает два номера)
        no += IE.marks(q);
        q.skill = s.skill;
        IE.qById[q.id] = q;
      });
      s.marks = no - 1;
    });
  };
  // test: undefined — все наборы навыка, 0 — только тренировки, n — части полного теста n
  IE.setsOf = (skill, test) => IE.sets.filter((s) => s.skill === skill && (test === undefined || s.test === test));
  IE.marks = (q) => (q.t === 'ms' ? q.pick : 1);
  IE.sumMarks = (sets) => sets.reduce((a, s) => a + s.marks, 0);
  // Баллы за ответ: 0..marks (ms даёт частичные баллы)
  IE.score = function (q, given) {
    if (q.t === 'ms') {
      if (!Array.isArray(given)) return 0;
      return new Set(given.filter((g) => q.answer.includes(g))).size;
    }
    return IE.isCorrect(q, given) ? 1 : 0;
  };
  IE.scoreSets = (sets, answers) => sets.reduce((a, s) => a + s.qs.reduce((b, q) => b + IE.score(q, answers[q.id]), 0), 0);

  /* ---------- Проверка ответов ---------- */
  const norm = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[.,;:!?"()]/g, ' ').replace(/\s+/g, ' ').trim();
  const isNum = (s) => /^[\d\s\-£$€%.,:]+$/.test(s);
  const stripNum = (s) => s.replace(/[\s\-£$€]/g, '');
  IE.isCorrect = function (q, given) {
    if (given === undefined || given === null || given === '') return false;
    if (q.t === 'gap') {
      const g = String(given).trim();
      const cands = [norm(g), norm(g).replace(/^(a|an|the) /, '')];
      return q.answer.some((a) => {
        if (isNum(a) && isNum(g)) return stripNum(a) === stripNum(g);
        return cands.includes(norm(a));
      });
    }
    if (q.t === 'ms') return IE.score(q, given) === q.pick;
    return given === q.answer;
  };
  IE.answerText = (q) => {
    if (q.t === 'ms') return q.answer.slice().sort().map((i) => 'ABCDEFG'[i] + ') ' + q.choices[i]).join('; ');
    if (q.t === 'tf') return { T: 'TRUE', F: 'FALSE', NG: 'NOT GIVEN' }[q.answer];
    if (q.t === 'yn') return { Y: 'YES', N: 'NO', NG: 'NOT GIVEN' }[q.answer];
    if (q.t === 'mc') return 'ABCDEFG'[q.answer] + ') ' + q.choices[q.answer];
    if (q.t === 'sel') return 'ABCDEFG'[q.answer] + ') ' + q.opts[q.answer];
    return q.answer[0];
  };

  /* ---------- Band: пересчёт и усреднение ---------- */
  // Academic Listening / Reading: [минимум верных из 40, band]. Таблицы приблизительные — у каждого теста своя шкала.
  const L_TAB = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];
  const R_TAB = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];
  IE.L_TAB = L_TAB; IE.R_TAB = R_TAB;
  IE.scaleRaw = (correct, total) => (total ? Math.round((correct / total) * 40) : 0);
  IE.bandFromRaw = (skill, raw) => (skill === 'listening' ? L_TAB : R_TAB).find((r) => raw >= r[0])[1];
  IE.rawForBand = (skill, band) => { const t = skill === 'listening' ? L_TAB : R_TAB; const r = t.slice().reverse().find((x) => x[1] >= band); return r ? r[0] : 40; };
  // Общий балл: среднее четырёх навыков, округление до 0.5 (.25 → .5, .75 → 1.0)
  IE.overall = (arr) => {
    if (arr.length < 4 || arr.some((x) => x === null || x === undefined || Number.isNaN(+x))) return null;
    return Math.round((arr.reduce((a, b) => a + +b, 0) / 4) * 2) / 2;
  };
  IE.halfBand = (x) => Math.round(x * 2) / 2;

  /* ---------- Хранилище (localStorage) ---------- */
  const KEY = 'ieltsbootcamp.v1';
  let mem = null;
  const freshDb = () => ({ current: null, profiles: {} });
  const freshProfile = () => ({ created: Date.now(), lessons: {}, qs: {}, sets: {}, tests: [], writing: [], speaking: [], vocab: {}, drafts: {}, days: {}, examDate: '', target: 7 });
  function read() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY)) || freshDb(); } catch (e) { mem = freshDb(); }
    return mem;
  }
  function write() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* режим без хранилища */ } }

  const store = (IE.store = {});
  store.names = () => Object.keys(read().profiles);
  store.name = () => read().current;
  store.p = () => read().profiles[read().current];
  store.create = (name) => {
    const db = read();
    name = name.trim().slice(0, 24);
    if (!name) return false;
    if (!db.profiles[name]) db.profiles[name] = freshProfile();
    db.current = name; write(); return true;
  };
  store.switchTo = (name) => { const db = read(); if (db.profiles[name]) { db.current = name; write(); } };
  store.remove = (name) => {
    const db = read(); delete db.profiles[name];
    db.current = Object.keys(db.profiles)[0] || null; write();
  };
  store.logout = () => { read().current = null; write(); };
  store.save = write;
  const touch = (p, n) => { const k = U.dayKey(Date.now()); p.days[k] = (p.days[k] || 0) + (n || 1); };
  const after = () => { write(); if (IE.campus) IE.campus.check(); };
  store.recordAnswer = (q, correct) => {
    const p = store.p(); if (!p) return;
    const r = p.qs[q.id] || { tries: 0, right: 0 };
    r.tries++; if (correct) r.right++;
    r.last = correct; r.ts = Date.now();
    p.qs[q.id] = r; touch(p);
  };
  store.recordSet = (setId, correct, total) => {
    const p = store.p(); if (!p) return;
    const s = p.sets[setId] || { tries: 0, best: 0 };
    s.tries++; s.last = correct; s.total = total; s.best = Math.max(s.best, correct); s.ts = Date.now();
    p.sets[setId] = s;
    if (correct === total && IE.campus) { p.flags = p.flags || {}; p.flags.perfect = true; }
    after();
  };
  store.setLesson = (id, on) => {
    const p = store.p(); if (!p) return;
    if (on) { p.lessons[id] = Date.now(); touch(p); } else delete p.lessons[id];
    after();
  };
  store.addTest = (t) => { const p = store.p(); p.tests.push(t); touch(p, 5); after(); return p.tests.length - 1; };
  store.addWriting = (w) => { const p = store.p(); p.writing.push(w); touch(p, 3); after(); };
  store.addSpeaking = (s) => { const p = store.p(); p.speaking.push(s); touch(p, 3); after(); };
  store.setVocab = (word, box, due) => { const p = store.p(); p.vocab[word] = { box, due }; touch(p, 0); write(); if (IE.campus) IE.campus.check(); };
  store.touch = (n) => { touch(store.p(), n); write(); };
  store.setExamDate = (d) => { store.p().examDate = d; write(); };
  store.setTarget = (b) => { store.p().target = b; write(); };
  store.exportJSON = () => JSON.stringify(read(), null, 2);
  store.importJSON = (txt) => {
    const obj = JSON.parse(txt);
    if (!obj || typeof obj.profiles !== 'object') throw new Error('bad');
    mem = obj; write();
  };
  store.resetProfile = () => { const db = read(); db.profiles[db.current] = freshProfile(); write(); };

  /* ---------- Статистика ---------- */
  IE.stats = {
    // Точность по последним ответам на задания навыка (Listening / Reading)
    skillAcc(skill) {
      const p = store.p(); let a = 0, r = 0;
      IE.sets.filter((s) => s.skill === skill).forEach((s) => s.qs.forEach((q) => {
        const x = p.qs[q.id]; if (x) { a++; if (x.last) r++; }
      }));
      return { answered: a, right: r };
    },
    // Оценка band по навыку: L/R — по точности (нужно 10+ заданий), W/S — среднее последних трёх самооценок
    skillBand(skill) {
      const p = store.p();
      if (skill === 'listening' || skill === 'reading') {
        const x = IE.stats.skillAcc(skill);
        return x.answered >= 10 ? IE.bandFromRaw(skill, IE.scaleRaw(x.right, x.answered)) : null;
      }
      const list = skill === 'writing' ? p.writing : p.speaking;
      if (!list.length) return null;
      const last = list.slice(-3);
      return IE.halfBand(last.reduce((a, b) => a + b.band, 0) / last.length);
    },
    estimate() { return IE.overall(IE.SKILL_IDS.map((s) => IE.stats.skillBand(s))); },
    overall() {
      const p = store.p();
      let tries = 0, right = 0;
      Object.values(p.qs).forEach((r) => { tries += r.tries; right += r.right; });
      const bands = p.tests.map((t) => (t.overall != null ? t.overall : IE.halfBand((t.L.band + t.R.band) / 2)));
      const words = Object.values(p.vocab).filter((v) => v.box >= 3).length;
      return {
        tries, right, lessons: Object.keys(p.lessons).length, tests: p.tests.length,
        sets: Object.keys(p.sets).length, writing: p.writing.length, speaking: p.speaking.length,
        bestBand: bands.length ? Math.max.apply(null, bands) : null, words,
        bestWriting: p.writing.length ? Math.max.apply(null, p.writing.map((w) => w.band)) : null,
      };
    },
    streak() {
      const p = store.p(); let n = 0; const d = new Date();
      for (;;) {
        const k = U.dayKey(d.getTime());
        if (p.days[k]) n++; else if (n || k !== U.dayKey(Date.now())) break;
        d.setDate(d.getDate() - 1);
      }
      return n;
    },
  };
})();
