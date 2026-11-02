/* Пробный тест: Listening (4 части) → Reading (3 текста) → Writing (Task 1 + Task 2). Speaking — отдельно после теста.
   Timed: Listening 30 мин (звук один раз), Reading 60 мин, Writing 60 мин. Untimed: без таймера, звук можно повторять. */
(function () {
  'use strict';
  const IE = window.IE, U = IE.util, ST = IE.store, esc = U.esc, A = IE.acts;
  const $ = (id) => document.getElementById(id);
  const X = (IE.exam = { active: false });
  let st = null, timer = null;

  const sets = (phase) => (phase === 'L' ? st.test.listening : st.test.reading).map((id) => IE.setById[id]);
  const baseOf = (list, i) => list.slice(0, i).reduce((a, s) => a + s.marks, 0);
  const LIMITS = { L: IE.SKILLS.listening.minutes * 60, R: IE.SKILLS.reading.minutes * 60, W: IE.SKILLS.writing.minutes * 60 };
  const LABEL = { L: 'Listening', R: 'Reading', W: 'Writing' };

  A.startExam = (el) => {
    const test = IE.tests.find((t) => t.id === +el.dataset.test);
    if (!test) return;
    st = { test, testId: test.id, mode: el.dataset.mode, phase: 'L', idx: 0, answers: {}, plays: {}, once: el.dataset.mode === 'timed', wt: { 1: '', 2: '' }, wtab: 1 };
    X.active = true; document.body.classList.add('in-exam');
    startPhaseTimer();
    location.hash = '#/exam'; X.resume();
  };

  function startPhaseTimer() {
    clearInterval(timer);
    if (!st.once) return;
    st.left = LIMITS[st.phase];
    timer = setInterval(() => {
      st.left--;
      const e = $('xtime'); if (e) { e.textContent = U.fmtTime(st.left); e.parentElement.classList.toggle('low', st.left <= 300); }
      if (st.left <= 0) { clearInterval(timer); IE.campus.toast('⏱ Время вышло!'); advance(true); }
    }, 1000);
  }

  X.resume = function () {
    if (!st) { X.active = false; document.body.classList.remove('in-exam'); location.hash = '#/tests'; return; }
    if (st.phase === 'W') return renderWriting();
    const list = sets(st.phase), s = list[st.idx], base = baseOf(list, st.idx);
    IE.cur = st; st.set = s; st.checked = false; st.onChange = paintNav;
    const left = st.phase === 'L'
      ? IE.playerHTML(s)
      : `<div class="passage"><h3>${esc(s.title.replace(/^Test \d · /, ''))}</h3>${s.paras.map((p) => `<p><b class="pl">${p.l}</b> ${esc(p.t)}</p>`).join('')}</div>`;
    const qs = s.qs.map((q) => IE.qHTML(q, base + q.no)).join('');
    const last = st.idx === list.length - 1;
    $('app').innerHTML = `<div class="exam"><div class="exam-top"><div class="l">${LABEL[st.phase]}<small>${esc(s.title)} · ${st.idx + 1}/${list.length}</small></div>
      <div class="timer"><b id="xtime">${st.once ? U.fmtTime(st.left) : '--:--'}</b>${st.once ? '' : '<small>Untimed</small>'}</div>
      <div class="exam-tools"><button class="tool" data-act="xQuit">Quit</button></div></div>
      <div class="exam-body ${st.phase === 'L' ? 'single' : ''}"><div class="pane ${st.phase === 'L' ? '' : 'left'}">${left}${st.phase === 'L' ? `<div class="qlist">${qs}</div>` : ''}</div>${st.phase === 'R' ? `<div class="pane qlist">${qs}</div>` : ''}</div>
      <div class="exam-bottom"><div class="qnav" id="xnav"></div><div class="row"><button class="qnav-btn" data-act="xPrev" ${st.idx === 0 ? 'disabled' : ''}>← Back</button><button class="qnav-btn" data-act="xNext">${last ? (st.phase === 'L' ? 'Finish Listening' : 'Finish Reading') : 'Next →'}</button></div></div></div>`;
    paintNav();
    window.scrollTo(0, 0);
  };

  function paintNav() {
    const nav = $('xnav'); if (!nav) return;
    const list = sets(st.phase);
    nav.innerHTML = list.map((s, si) => { const b = baseOf(list, si); return s.qs.map((q) => {
      const a = st.answers[q.id], done = a !== undefined && a !== '' && !(Array.isArray(a) && !a.length);
      return `<a class="nb ${done ? 'done' : ''} ${si === st.idx ? 'cur' : ''}" data-act="xGo" data-s="${si}" data-q="${q.id}">${q.t === 'ms' ? (b + q.no) + '–' + (b + q.no + 1) : b + q.no}</a>`;
    }).join(''); }).join('');
  }
  A.xGo = (el) => { st.idx = +el.dataset.s; X.resume(); const q = $('q-' + el.dataset.q); q && q.scrollIntoView({ block: 'center' }); };
  A.xPrev = () => { IE.tts.stop(); st.idx--; X.resume(); };
  A.xNext = () => advance(false);
  A.xQuit = () => { if (confirm('Выйти из теста? Прогресс будет потерян.')) { end(); location.hash = '#/tests'; } };
  function end() { clearInterval(timer); IE.tts.stop(); st = null; X.active = false; document.body.classList.remove('in-exam'); }

  function unanswered() {
    return sets(st.phase).flatMap((s) => s.qs).filter((q) => { const a = st.answers[q.id]; return a === undefined || a === '' || (Array.isArray(a) && !a.length); }).length;
  }
  function advance(forced) {
    IE.tts.stop();
    if (st.phase === 'W') { finish(); return; }
    const list = sets(st.phase);
    if (st.idx < list.length - 1 && !forced) { st.idx++; X.resume(); return; }
    if (!forced) { const n = unanswered(); if (n && !confirm('Без ответа: ' + n + '. Завершить ' + LABEL[st.phase] + '? Штрафа за неверный ответ нет.')) return; }
    st.phase = st.phase === 'L' ? 'R' : 'W'; st.idx = 0;
    startPhaseTimer();
    IE.campus.toast(LABEL[st.phase === 'R' ? 'L' : 'R'] + ' завершён. Дальше: ' + LABEL[st.phase] + '.');
    X.resume();
  }

  /* ---------- Writing внутри теста ---------- */
  function renderWriting() {
    const tasks = st.test.writing.map((id) => IE.writingTasks.find((t) => t.id === id));
    const t = tasks[st.wtab - 1], min = st.wtab === 1 ? 150 : 250;
    $('app').innerHTML = `<div class="exam"><div class="exam-top"><div class="l">Writing<small>Task ${st.wtab} · минимум ${min} слов · Task 2 весит вдвое больше</small></div>
      <div class="timer"><b id="xtime">${st.once ? U.fmtTime(st.left) : '--:--'}</b>${st.once ? '' : '<small>Untimed</small>'}</div>
      <div class="exam-tools"><button class="tool" data-act="xWTab" data-t="1">Task 1</button><button class="tool" data-act="xWTab" data-t="2">Task 2</button><button class="tool" data-act="xQuit">Quit</button></div></div>
      <div class="exam-body"><div class="pane left"><p class="qtext">${esc(t.prompt)}</p>${t.chart ? IE.chart(t.chart) : ''}</div>
      <div class="pane"><textarea id="xwtext" class="inp wtext" placeholder="Write your answer here…" spellcheck="false">${esc(st.wt[st.wtab])}</textarea><p class="muted"><b id="xwcount">0</b> слов</p></div></div>
      <div class="exam-bottom"><span class="muted" style="color:#fff">Распределите время: ≈20 мин Task 1, ≈40 мин Task 2.</span><div class="row"><button class="qnav-btn" data-act="xNext">Finish Test</button></div></div></div>`;
    const ta = $('xwtext'), count = () => { st.wt[st.wtab] = ta.value; $('xwcount').textContent = IE.analyze(ta.value).words; };
    ta.addEventListener('input', count); count();
  }
  A.xWTab = (el) => { st.wt[st.wtab] = $('xwtext').value; st.wtab = +el.dataset.t; renderWriting(); };

  function finish() {
    if (st.phase === 'W' && $('xwtext')) st.wt[st.wtab] = $('xwtext').value;
    const L = sets('L'), R = sets('R');
    const part = (list, skill) => { const c = IE.scoreSets(list, st.answers), tot = IE.sumMarks(list); return { correct: c, total: tot, band: IE.bandFromRaw(skill, IE.scaleRaw(c, tot)) }; };
    const Ls = part(L, 'listening'), Rs = part(R, 'reading');
    L.concat(R).forEach((s) => s.qs.forEach((q) => ST.recordAnswer(q, IE.isCorrect(q, st.answers[q.id]))));
    const tasks = st.test.writing.map((id) => IE.writingTasks.find((t) => t.id === id));
    const wr = [1, 2].map((n) => {
      const text = st.wt[n] || '', words = IE.analyze(text).words;
      return { id: tasks[n - 1].id, text, words, grade: words >= 20 ? IE.grade.writingOffline(text, n, tasks[n - 1]) : null };
    });
    const bands = wr.map((w) => (w.grade ? w.grade.overall : 0));
    const Wband = wr[0].words >= 20 || wr[1].words >= 20 ? IE.grade.writingTotal(bands[0], bands[1]) : null;
    const rec = { ts: Date.now(), mode: st.mode, testId: st.testId, L: Ls, R: Rs, W: Wband, Wd: wr, S: null, answers: st.answers };
    rec.overall = IE.overall([Ls.band, Rs.band, Wband, null]) || IE.halfBand(avgOf([Ls.band, Rs.band].concat(Wband !== null ? [Wband] : [])));
    rec.partial = true;
    const idx = ST.addTest(rec);
    end();
    location.hash = '#/results/' + idx;
  }
  const avgOf = (a) => a.reduce((s, x) => s + x, 0) / a.length;
})();
