/* Экраны: приветствие, главная, курс, уроки, практика L/R, Writing, Speaking, словарь, гайд, калькулятор, кабинет */
(function () {
  'use strict';
  const IE = window.IE, U = IE.util, ST = IE.store, esc = U.esc, bar = (f, c) => IE.ui.bar(f, c);
  const V = (IE.views = {});
  const app = () => document.getElementById('app');
  const show = (html) => { app().innerHTML = html; window.scrollTo(0, 0); };
  const LET = 'ABCDEFG';
  const band = U.band;

  /* ---------- Таймеры экрана ---------- */
  IE.timers = {};
  IE.clearTimers = () => { Object.values(IE.timers).forEach(clearInterval); IE.timers = {}; };
  IE.tick = (id, sec, el, onEnd) => {
    clearInterval(IE.timers[id]);
    let left = sec;
    const paint = () => { const e = document.getElementById(el); if (e) e.textContent = U.fmtTime(left); };
    paint();
    IE.timers[id] = setInterval(() => {
      left--; paint();
      if (left <= 0) { clearInterval(IE.timers[id]); onEnd && onEnd(); }
    }, 1000);
  };

  const hrefFor = (id) => (/^[lr]\d/.test(id) ? '#/practice/' : /^t\d/.test(id) ? '#/write/' : '#/speak/') + id;
  const chip = (txt, cls) => `<span class="chip ${cls || ''}">${txt}</span>`;
  const row = (href, num, title, sub, ch) => `<a class="topic-row" href="${href}"><span class="num">${num}</span><span class="t"><b>${title}</b><span>${sub}</span></span>${ch || ''}</a>`;
  V.notFound = () => show('<div class="card"><h2>Страница не найдена</h2><p><a href="#/">На главную</a></p></div>');

  /* ---------- Приветствие ---------- */
  V.welcome = () => {
    const names = ST.names();
    show(`<div class="center-screen"><div class="hero"><h1>IELTS <em>Boot Camp</em></h1>
      <p>Подготовка к IELTS Academic: уроки, практика по Listening, Reading, Writing и Speaking, словарь и пробный тест с таймером.</p></div><div class="spacer"></div>
      <div class="card"><h2>Создайте профиль</h2>
        <div class="row"><input type="text" id="newName" maxlength="24" placeholder="Ваше имя" style="flex:1;min-width:200px">
        <label class="small muted">Цель Band<br><select id="newTarget">${[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((b) => `<option ${b === 7 ? 'selected' : ''}>${b.toFixed(1)}</option>`).join('')}</select></label>
        <label class="small muted">Дата экзамена<br><input type="date" id="newDate"></label></div>
        <p><button class="btn" data-act="createProfile">Start</button></p>
        ${names.length ? `<h3>Существующие профили</h3><div class="row">${names.map((n) => `<button class="btn ghost small" data-act="switchProfile" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
        <p class="muted small">Прогресс хранится в браузере на этом компьютере.</p></div></div>`);
  };

  /* ---------- Главная ---------- */
  function nextStep() {
    const p = ST.p();
    const l = IE.lessons.find((x) => !p.lessons[x.id]);
    if (l) return { t: 'Урок: ' + l.title, href: '#/lesson/' + l.id };
    const s = IE.sets.find((x) => !p.sets[x.id]);
    if (s) return { t: 'Практика: ' + s.title, href: '#/practice/' + s.id };
    const w = IE.writingTasks.find((x) => !p.writing.some((y) => y.id === x.id));
    if (w) return { t: 'Writing: ' + w.title, href: '#/write/' + w.id };
    return { t: 'Пробный тест', href: '#/tests' };
  }
  V.home = () => {
    const p = ST.p(), o = IE.stats.overall(), nx = nextStep(), est = IE.stats.estimate();
    const days = p.examDate ? Math.ceil((new Date(p.examDate) - new Date(U.dayKey(Date.now()))) / 86400000) : null;
    const skills = IE.SKILL_IDS.map((id) => {
      const s = IE.SKILLS[id], b = IE.stats.skillBand(id);
      const ls = IE.lessons.filter((l) => l.skill === id), lDone = ls.filter((l) => p.lessons[l.id]).length;
      return `<div class="card"><div class="row"><span style="font-size:34px">${s.icon}</span><div><h3 style="margin:0">${s.name}</h3><span class="muted small">${s.ru}</span></div><span style="margin-left:auto" class="chip gold">Band ${band(b)}</span></div>
        <p class="muted small" style="margin:10px 0 6px">Уроки: ${lDone} / ${ls.length}</p>${bar(ls.length ? lDone / ls.length : 0)}
        <p style="margin:12px 0 0"><a class="btn small" href="#/course/${id}">Открыть</a></p></div>`;
    }).join('');
    show(`<div class="hero"><h1>Welcome, <em>${esc(ST.name())}</em>!</h1><p>Цель — Band ${band(p.target)}. ${days !== null ? (days >= 0 ? `До экзамена ${days} дн.` : 'Дата экзамена прошла.') : 'Укажите дату экзамена в My Locker.'}</p>
      <p><a class="btn gold" href="${nx.href}">${esc(nx.t)} →</a> <a class="btn ghost" href="#/tests">Mock Test</a></p></div><div class="spacer"></div>
      <div class="grid four"><div class="card stat"><div class="num">${band(est)}</div><div class="lbl">Оценка Band</div></div>
        <div class="card stat"><div class="num">${band(p.target)}</div><div class="lbl">Цель</div></div>
        <div class="card stat"><div class="num">${IE.stats.streak()}</div><div class="lbl">Дней подряд</div></div>
        <div class="card stat"><div class="num">${o.tries}</div><div class="lbl">Заданий решено</div></div></div>
      <div class="spacer"></div>${IE.campus.homePanel()}<div class="spacer"></div><div class="grid two">${skills}</div>`);
  };

  /* ---------- Курс ---------- */
  V.course = (only) => {
    const p = ST.p();
    const sec = (id) => {
      const s = IE.SKILLS[id];
      const lessons = IE.lessons.filter((l) => l.skill === id).map((l, i) => row('#/lesson/' + l.id, i + 1, esc(l.title), esc(l.ru), p.lessons[l.id] ? chip('Изучено', 'ok') : chip('Урок')));
      let practice = '';
      if (id === 'listening' || id === 'reading') {
        practice = IE.setsOf(id).sort((a, b) => (a.test || 99) - (b.test || 99)).map((x) => { const r = p.sets[x.id]; return row('#/practice/' + x.id, x.test ? 'T' + x.test : '▶', esc(x.title), `${esc(x.ru)} · ${x.marks} баллов${x.test ? '' : ' · мини-тренировка'}`, r ? chip(`${r.best}/${r.total}`, r.best === r.total ? 'ok' : 'prog') : chip('Новое', 'gold')); }).join('');
      } else if (id === 'writing') {
        practice = IE.writingTasks.map((t) => { const a = p.writing.filter((w) => w.id === t.id); return row('#/write/' + t.id, 'T' + t.task, esc(t.title), esc(t.ru) + (t.type ? ' · ' + t.type : ''), a.length ? chip('Band ' + band(Math.max.apply(null, a.map((w) => w.band))), 'ok') : chip('Новое', 'gold')); }).join('');
      } else {
        practice = IE.speakingTasks.map((t) => { const a = p.speaking.filter((w) => w.id === t.id); return row('#/speak/' + t.id, 'P' + t.part, esc(t.title), esc(t.ru), a.length ? chip('Band ' + band(Math.max.apply(null, a.map((w) => w.band))), 'ok') : chip('Новое', 'gold')); }).join('');
      }
      return `<div class="section-head"><span class="badge">${s.icon} ${s.name}</span><span class="muted">${s.ru}</span></div>
        <div class="domain"><div class="domain-title"><h3>Уроки</h3></div>${lessons}</div>
        <div class="domain"><div class="domain-title"><h3>Практика</h3></div>${practice}</div>`;
    };
    const ids = only && IE.SKILLS[only] ? [only] : IE.SKILL_IDS;
    show(`<h1>Course</h1><p class="muted">Уроки с разбором ловушек и практика по каждому навыку IELTS Academic.</p>
      <div class="tabs"><a class="btn small ${only ? 'ghost' : ''}" href="#/course">Все</a>${IE.SKILL_IDS.map((s) => `<a class="btn small ${only === s ? '' : 'ghost'}" href="#/course/${s}">${IE.SKILLS[s].icon} ${IE.SKILLS[s].name}</a>`).join('')}</div>${ids.map(sec).join('')}`);
  };

  V.lesson = (id) => {
    const l = IE.lessons.find((x) => x.id === id);
    if (!l) return V.notFound();
    const done = !!ST.p().lessons[id], i = IE.lessons.indexOf(l), nx = IE.lessons[i + 1];
    show(`<div class="crumbs"><a href="#/course/${l.skill}">← ${IE.SKILLS[l.skill].name}</a></div>
      <h1>${esc(l.title)}</h1><p class="muted">${esc(l.ru)}</p>
      <div class="lesson">${l.html}</div>
      <div class="cta-bar"><button class="btn ${done ? 'ghost' : ''}" data-act="toggleLesson" data-id="${id}">${done ? '✓ Изучено (снять)' : 'Отметить изученным'}</button>
        ${l.practice.map((pid) => `<a class="btn navy" href="${hrefFor(pid)}">Практика: ${esc((IE.setById[pid] || IE.writingTasks.find((t) => t.id === pid) || IE.speakingTasks.find((t) => t.id === pid)).title)}</a>`).join('')}
        ${nx ? `<a class="btn ghost" href="#/lesson/${nx.id}">Следующий урок →</a>` : ''}</div>`);
  };

  /* ---------- Рендер заданий (общий для практики и пробного теста) ---------- */
  IE.cur = { answers: {}, checked: false };
  IE.qHTML = function (q, num) {
    const cur = IE.cur, given = cur.answers[q.id], rev = cur.checked, ok = rev && IE.isCorrect(q, given);
    const dis = rev ? 'disabled' : '';
    let text = esc(q.q), body = '';
    if (q.t === 'tf' || q.t === 'yn') {
      const o = q.t === 'tf' ? [['T', 'TRUE'], ['F', 'FALSE'], ['NG', 'NOT GIVEN']] : [['Y', 'YES'], ['N', 'NO'], ['NG', 'NOT GIVEN']];
      body = `<div class="opts">${o.map(([v, l]) => `<button class="opt ${given === v ? 'sel' : ''} ${rev && v === q.answer ? 'right' : ''} ${rev && given === v && v !== q.answer ? 'wrong' : ''}" data-act="pick" data-q="${q.id}" data-v="${v}" ${dis}>${l}</button>`).join('')}</div>`;
    } else if (q.t === 'mc') {
      body = `<div class="choices">${q.choices.map((c, i) => `<button class="choice ${given === i ? 'sel' : ''} ${rev && i === q.answer ? 'right' : ''} ${rev && given === i && i !== q.answer ? 'wrong' : ''}" data-act="pick" data-q="${q.id}" data-v="${i}" ${dis}><span class="ltr">${LET[i]}</span><span class="txt">${esc(c)}</span></button>`).join('')}</div>`;
    } else if (q.t === 'ms') {
      const g = Array.isArray(given) ? given : [];
      body = `<div class="choices">${q.choices.map((c, i) => `<button class="choice ${g.includes(i) ? 'sel' : ''} ${rev && q.answer.includes(i) ? 'right' : ''} ${rev && g.includes(i) && !q.answer.includes(i) ? 'wrong' : ''}" data-act="pickms" data-q="${q.id}" data-v="${i}" ${dis}><span class="ltr">${LET[i]}</span><span class="txt">${esc(c)}</span></button>`).join('')}</div>`;
    } else if (q.t === 'sel') {
      body = `<select class="js-inp selq ${rev ? (ok ? 'right' : 'wrong') : ''}" data-q="${q.id}" ${dis}><option value="">— choose —</option>${q.opts.map((o, i) => `<option value="${i}" ${given === i ? 'selected' : ''}>${LET[i]}) ${esc(o)}</option>`).join('')}</select>`;
    } else {
      const inp = `<input type="text" class="js-inp gapinp ${rev ? (ok ? 'right' : 'wrong') : ''}" data-q="${q.id}" value="${esc(given || '')}" autocomplete="off" spellcheck="false" aria-label="Answer ${num}" ${dis}>`;
      text = q.q.includes('___') ? esc(q.q).replace('___', inp) : esc(q.q) + ' ' + inp;
    }
    const fb = rev ? `<div class="feedback ${ok ? 'ok' : 'bad'}"><b class="h">${ok ? 'Correct!' : 'Правильный ответ: ' + esc(IE.answerText(q))}</b>${q.exp ? esc(q.exp) : ''}</div>` : '';
    return `${q.inst ? `<div class="inst">${esc(q.inst)}</div>` : ''}<div class="qitem" id="q-${q.id}"><span class="qnum ${q.t === 'ms' ? 'wide' : ''}">${q.t === 'ms' ? num + '–' + (num + 1) : num}</span><div class="qbody"><div class="qtext">${text}</div>${body}${fb}</div></div>`;
  };
  const passageHTML = (s) => `<div class="passage"><h3>${esc(s.title)}</h3>${s.paras.map((p) => `<p><b class="pl">${p.l}</b> ${esc(p.t)}</p>`).join('')}</div>`;
  IE.playerHTML = (s) => `<div class="player card"><div class="row"><button class="btn" id="pbtn" data-act="lPlay">▶ Play</button><button class="btn ghost small" data-act="lStop">■ Stop</button>
      <label class="small muted">Speed <select id="prate"><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option></select></label>
      <span class="muted small" id="pstat">${IE.tts.supported ? 'Нажмите Play. В настоящем тесте запись звучит один раз.' : 'Озвучка недоступна в этом браузере — откройте транскрипт.'}</span></div>${bar(0).replace('class="bar', 'id="pbar" class="bar')}
      <p class="muted small" style="margin:8px 0 0">Голос — синтезатор браузера (английский). Качество зависит от установленных голосов.</p></div>`;

  /* ---------- Практика Listening / Reading ---------- */
  V.practice = (id) => {
    const s = IE.setById[id];
    if (!s) return V.notFound();
    if (!IE.practice || IE.practice.id !== id) IE.practice = { id, answers: {}, checked: false };
    IE.cur = IE.practice; IE.cur.set = s;
    const cur = IE.cur, qs = s.qs.map((q) => IE.qHTML(q, q.no)).join('');
    let res = '';
    if (cur.checked) {
      const c = IE.scoreSets([s], cur.answers), raw = IE.scaleRaw(c, s.marks), b = IE.bandFromRaw(s.skill, raw);
      const types = {}; s.qs.forEach((q) => { const t = types[q.t] = types[q.t] || [0, 0]; t[1] += IE.marks(q); t[0] += IE.score(q, cur.answers[q.id]); });
      const nx = IE.setsOf(s.skill, s.test)[IE.setsOf(s.skill, s.test).indexOf(s) + 1];
      res = `<div class="card blue"><h2>Результат: ${c} / ${s.marks}</h2><p>Примерный Band: <b>${band(b)}</b> ${s.marks === 40 ? '' : '(одна часть — оценка условна: пересчёт на 40 вопросов по таблице Academic)'}</p>
        <p class="small">${Object.entries(types).map(([t, v]) => `${IE.TYPE_NAMES[t]}: ${v[0]}/${v[1]}`).join(' · ')}</p>
        <div class="cta-bar"><button class="btn gold" data-act="retry">Повторить</button>${nx ? `<a class="btn ghost" href="#/practice/${nx.id}">Следующий →</a>` : ''}<a class="btn ghost" href="#/course/${s.skill}">К курсу</a></div></div><div class="spacer"></div>`;
    }
    const transcript = s.skill === 'listening' && cur.checked ? `<details class="card" style="margin-top:16px"><summary><b>Transcript</b></summary>${s.script.map(([sp, t]) => `<p><b>${esc((s.speakers || [])[({ A: 0, B: 1, C: 2 })[sp]] || sp)}:</b> ${esc(t)}</p>`).join('')}</details>` : '';
    const left = s.skill === 'reading' ? passageHTML(s) : IE.playerHTML(s);
    show(`<div class="crumbs"><a href="#/course/${s.skill}">← ${IE.SKILLS[s.skill].name}</a></div><h1>${esc(s.title)}</h1><p class="muted">${esc(s.ru)}</p>${res}
      <div class="${s.skill === 'reading' ? 'split' : ''}"><div class="${s.skill === 'reading' ? 'split-l' : ''}">${left}</div>
      <div class="qlist card">${qs}${cur.checked ? '' : '<div class="cta-bar"><button class="btn" data-act="check">Check answers</button></div>'}</div></div>${transcript}`);
  };
  IE.leavePractice = () => { IE.tts.stop(); IE.practice = null; };

  /* ---------- Writing ---------- */
  const bandOpts = (sel) => { let o = ''; for (let b = 3; b <= 9; b += 0.5) o += `<option ${b === sel ? 'selected' : ''} value="${b}">${b.toFixed(1)}</option>`; return o; };
  const descFor = (crit, v) => crit.d[Math.max(5, Math.min(9, Math.floor(v)))];
  V.write = (id) => {
    const t = IE.writingTasks.find((x) => x.id === id);
    if (!t) return V.notFound();
    const p = ST.p(), draft = p.drafts[id] || '', hist = p.writing.filter((w) => w.id === id);
    const crit = IE.CRITERIA.writing;
    show(`<div class="crumbs"><a href="#/course/writing">← Writing</a></div>
      <div class="row">${chip('Task ' + t.task, 'gold')}${t.type ? chip(t.type) : ''}<h1 style="margin:0">${esc(t.title)}</h1></div><p class="muted">${esc(t.ru)}</p>
      <div class="card"><p class="qtext">${esc(t.prompt)}</p>${t.chart ? IE.chart(t.chart) : ''}
        <p class="muted small">Минимум ${t.task === 1 ? '150' : '250'} слов · рекомендуемое время ${t.task === 1 ? 20 : 40} минут.</p></div><div class="spacer"></div>
      <div class="grid two" style="align-items:start"><div class="card"><div class="row"><b>Ваш текст</b><span style="margin-left:auto" class="chip" id="wtimer">${U.fmtTime((t.task === 1 ? 20 : 40) * 60)}</span><button class="btn small ghost" data-act="wTimer" data-min="${t.task === 1 ? 20 : 40}">⏱ Таймер</button></div>
        <textarea id="wtext" class="inp wtext" placeholder="Write your ${t.task === 1 ? 'report' : 'essay'} here…" spellcheck="true">${esc(draft)}</textarea>
        <div class="cta-bar"><button class="btn small" data-act="wSaveDraft">Save draft</button><button class="btn small ghost" data-act="wClear">Clear</button></div></div>
        <div class="card"><h3>Анализ текста</h3><div id="wstats"></div></div></div><div class="spacer"></div>
      <div class="card"><h3>Чек-лист задания</h3><ul>${t.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="spacer"></div>
      <div class="card"><h3>Автоматическая проверка</h3><p class="muted small">Офлайн-проверка работает сразу и без ключа. Проверка Claude оценивает смысл, аргументы и грамматику как экзаменатор${IE.grade.hasKey() ? '.' : ' — для неё нужен API-ключ (My Locker → Настройки проверки).'}</p>
        <div class="cta-bar" style="margin-top:0"><button class="btn small" data-act="wCheck" data-mode="offline">⚡ Быстрая проверка (офлайн)</button><button class="btn small navy" data-act="wCheck" data-mode="ai">🤖 Проверить с Claude</button></div><div id="gout" aria-live="polite"></div></div><div class="spacer"></div>
      <div class="card"><h3>Самооценка по критериям</h3><p class="muted small">Результат проверки подставляется ниже, вы можете скорректировать оценки; итог — среднее четырёх критериев с округлением до 0.5.</p>
        ${crit.map((c) => `<div class="crit"><label><b>${c.name}</b> <span class="muted small">${c.ru}</span><br><select class="js-crit" data-id="${c.id}">${bandOpts(6)}</select></label><span class="muted small" id="d-${c.id}">${esc(descFor(c, 6))}</span></div>`).join('')}
        <p><b>Band за работу: <span id="wband">6.0</span></b></p><button class="btn" data-act="wSave" data-id="${id}">Save attempt</button></div><div class="spacer"></div>
      <div class="card"><h3>Образец ответа</h3>${t.model ? `<p class="muted small">Сначала напишите свой текст — потом сравнивайте.</p><button class="btn small navy" data-act="toggle" data-target="model">Показать образец</button><div id="model" hidden><div class="passage">${t.model.split('\n\n').map((x) => `<p>${esc(x)}</p>`).join('')}</div></div>` : ''}
        ${t.plan ? `<p class="muted small">План ответа:</p><ol>${t.plan.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}</div>
      ${hist.length ? `<div class="spacer"></div><div class="card"><h3>Ваши попытки</h3><table class="data"><tr><th>Дата</th><th>Слов</th><th>Band</th><th></th></tr>${hist.slice().reverse().map((h, i) => `<tr><td>${U.date(h.ts)}</td><td>${h.words}</td><td>${band(h.band)}</td><td><button class="btn small ghost" data-act="wLoad" data-i="${hist.length - 1 - i}" data-id="${id}">Открыть</button></td></tr>`).join('')}</table></div>` : ''}`);
    IE.acts.wLive();
  };
  IE.acts.wLive = () => {
    const ta = document.getElementById('wtext'), box = document.getElementById('wstats'); if (!ta || !box) return;
    const id = location.hash.split('/')[2], t = IE.writingTasks.find((x) => x.id === id), min = t && t.task === 1 ? 150 : 250, a = IE.analyze(ta.value);
    const warn = [];
    if (a.words && a.words < min) warn.push(`Не хватает ${min - a.words} слов до минимума.`);
    if (a.paragraphs && a.paragraphs < (t.task === 1 ? 3 : 4)) warn.push('Мало абзацев: нужна структура (intro, body, conclusion/overview).');
    if (a.contractions) warn.push(`Сокращений: ${a.contractions} — в академическом стиле лучше без них.`);
    if (a.iThink > 2) warn.push('«I think» повторяется слишком часто.');
    if (a.avgLen > 28) warn.push('Предложения слишком длинные — проверьте читаемость.');
    box.innerHTML = `<div class="grid four" style="gap:10px"><div class="stat"><div class="num ${a.words >= min ? 'okc' : ''}">${a.words}</div><div class="lbl">слов</div></div><div class="stat"><div class="num">${a.paragraphs}</div><div class="lbl">абзацев</div></div><div class="stat"><div class="num">${a.sentences}</div><div class="lbl">предложений</div></div><div class="stat"><div class="num">${a.diversity}%</div><div class="lbl">уник. слов</div></div></div>
      <p class="small">Связки (${a.connectors.length}): ${a.connectors.length ? a.connectors.map(esc).join(', ') : '—'}</p>
      <p class="small">Частые повторы: ${a.repeated.length ? a.repeated.map((r) => `${esc(r.w)} ×${r.n}`).join(', ') : '—'}</p>
      ${warn.map((w) => `<div class="notice">${esc(w)}</div>`).join('')}`;
  };

  /* ---------- Speaking ---------- */
  V.speak = (id) => {
    const t = IE.speakingTasks.find((x) => x.id === id);
    if (!t) return V.notFound();
    const qs = t.part === 1 ? t.qs : t.part3;
    IE.slots = {};
    const trBox = (slot) => `<textarea class="inp strans" data-slot="${slot}" id="tr-${slot}" rows="2" placeholder="${IE.stt.supported ? 'Транскрипт появится при записи — его можно поправить' : 'Распознавание речи недоступно в этом браузере: напечатайте или вставьте текст ответа'}"></textarea>`;
    const qblock = (list, base) => list.map((q, i) => `<div class="sq"><p class="qtext">${esc(q)}</p><div class="row"><button class="btn small ghost" data-act="sAsk" data-q="${esc(q)}">🔊 Ask</button><button class="btn small" data-act="sRec" data-slot="${base + i}">🎙 Record</button><span class="muted small">≈ 20–30 сек</span></div><div id="rec-${base + i}"></div>${trBox(base + i)}</div>`).join('');
    const crit = IE.CRITERIA.speaking;
    show(`<div class="crumbs"><a href="#/course/speaking">← Speaking</a></div>
      <div class="row">${chip('Part ' + t.part, 'gold')}<h1 style="margin:0">${esc(t.title)}</h1></div><p class="muted">${esc(t.ru)}</p>
      ${t.part === 2 ? `<div class="card cue"><h3>Part 2 — Cue card</h3><p class="qtext">${esc(t.topic)}</p><p>You should say:</p><ul>${t.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
        <div class="row"><span class="chip" id="sphase">Ready</span><span class="chip gold" id="stimer">01:00</span><button class="btn small" data-act="sPrep">⏱ Начать подготовку (1 мин)</button><button class="btn small ghost" data-act="sSpeakNow">Сразу говорить (2 мин)</button></div>
        <textarea class="inp" id="snotes" rows="3" style="width:100%;margin-top:10px" placeholder="Заметки: ключевые слова, не предложения"></textarea><div id="rec-main"></div>${trBox('main')}</div><div class="spacer"></div>
        <div class="card"><h3>Part 3 — Discussion</h3>${qblock(qs, 100)}</div>` : `<div class="card">${qblock(qs, 0)}</div>`}
      <div class="spacer"></div><div class="card"><h3>Образец ответа (Band ~7)</h3>${t.sample ? `<button class="btn small navy" data-act="toggle" data-target="ssample">Показать</button><div id="ssample" hidden><div class="passage"><p>${esc(t.sample)}</p></div></div>` : '<p class="muted small">Для этой темы образца нет — запишите свой ответ и сравните с критериями ниже.</p>'}
        <p class="small muted">Полезные фразы: ${IE.PHRASES.start.concat(IE.PHRASES.extend).map(esc).join(' · ')}</p></div>
      <div class="spacer"></div><div class="card"><h3>Автоматическая проверка ответа</h3><p class="muted small">Проверяется транскрипт: темп, объём, паразиты, связки, лексика, грамматические паттерны${IE.grade.hasKey() ? '' : '. Проверка Claude требует API-ключа (My Locker)'}. Произношение по тексту оценить нельзя — для него берётся лишь уверенность распознавания.</p>
        <div class="cta-bar" style="margin-top:0"><button class="btn small" data-act="sCheck" data-mode="offline" data-id="${id}">⚡ Быстрая проверка (офлайн)</button><button class="btn small navy" data-act="sCheck" data-mode="ai" data-id="${id}">🤖 Проверить с Claude</button></div><div id="sgout" aria-live="polite"></div></div>
      <div class="spacer"></div><div class="card"><h3>Самооценка</h3><p class="muted small">Прослушайте запись и оцените себя по четырём критериям; результат проверки подставляется автоматически.</p>
        ${crit.map((c) => `<div class="crit"><label><b>${c.name}</b> <span class="muted small">${c.ru}</span><br><select class="js-crit" data-id="${c.id}">${bandOpts(6)}</select></label><span class="muted small" id="d-${c.id}">${esc(descFor(c, 6))}</span></div>`).join('')}
        <p><b>Band: <span id="wband">6.0</span></b></p><button class="btn" data-act="sSave" data-id="${id}">Save session</button></div>`);
  };

  /* ---------- Словарь ---------- */
  const DAY = 86400000, INT = [0, 1, 3, 7, 14, 30];
  const allWords = () => IE.vocab.flatMap((t) => t.words);
  const dueWords = () => { const p = ST.p(), now = Date.now(); return allWords().filter((w) => p.vocab[w.w] && p.vocab[w.w].due <= now && p.vocab[w.w].box < 5); };
  V.vocab = (arg) => {
    const p = ST.p();
    if (arg) return V.flash(arg);
    const due = dueWords().length;
    show(`<h1>Vocabulary</h1><p class="muted">Карточки с интервальным повторением: слово переходит в следующую «коробку», если вы его вспомнили.</p>
      <div class="card"><div class="row"><h3 style="margin:0">Повторение на сегодня: ${due}</h3><a class="btn small ${due ? '' : 'ghost'}" href="#/vocab/due" style="margin-left:auto">Повторить</a></div></div><div class="spacer"></div>
      <div class="grid three">${IE.vocab.map((t) => { const learned = t.words.filter((w) => p.vocab[w.w] && p.vocab[w.w].box >= 3).length; return `<div class="card"><h3 style="margin:0">${esc(t.title)}</h3><span class="muted small">${esc(t.ru)}</span><p class="small muted" style="margin:8px 0 6px">Выучено ${learned} / ${t.words.length}</p>${bar(learned / t.words.length, 'green')}<p style="margin:12px 0 0"><a class="btn small" href="#/vocab/${t.id}">Учить</a> <a class="btn small ghost" href="#/vocab/list-${t.id}">Список</a></p></div>`; }).join('')}</div>`);
  };
  V.flash = (arg) => {
    const p = ST.p();
    if (arg.startsWith('list-')) {
      const t = IE.vocab.find((x) => x.id === arg.slice(5)); if (!t) return V.notFound();
      return show(`<div class="crumbs"><a href="#/vocab">← Vocabulary</a></div><h1>${esc(t.title)}</h1><div class="card"><table class="data"><tr><th>Слово</th><th>Перевод</th><th>Пример</th></tr>${t.words.map((w) => `<tr><td><b>${esc(w.w)}</b> <span class="muted small">${w.pos}</span></td><td>${esc(w.ru)}</td><td>${esc(w.ex)}</td></tr>`).join('')}</table></div>`);
    }
    if (!IE.vsess || IE.vsess.id !== arg) {
      let list = arg === 'due' ? dueWords() : ((IE.vocab.find((x) => x.id === arg) || { words: [] }).words.filter((w) => !p.vocab[w.w] || p.vocab[w.w].box < 5));
      IE.vsess = { id: arg, queue: U.shuffle(list.slice(0, 15)), flipped: false, known: 0, total: 0 };
    }
    const s = IE.vsess, w = s.queue[0];
    if (!w) {
      const k = s.known, tot = s.total; IE.vsess = null;
      return show(`<div class="center-screen"><div class="card blue"><h2>Готово!</h2><p>${tot ? `Вы вспомнили ${k} из ${tot} карточек.` : 'Сегодня повторять нечего.'}</p><a class="btn gold" href="#/vocab">К словарю</a></div></div>`);
    }
    show(`<div class="crumbs"><a href="#/vocab">← Vocabulary</a></div><div class="center-screen"><p class="muted">Осталось карточек: ${s.queue.length}</p>
      <div class="card flash"><span class="chip">${w.pos}</span><div class="fw">${esc(w.w)}</div><button class="btn small ghost" data-act="vSay" data-w="${esc(w.w)}">🔊</button>
        ${s.flipped ? `<div class="fb"><p><b>${esc(w.ru)}</b></p><p class="muted"><i>${esc(w.ex)}</i></p></div><div class="cta-bar" style="justify-content:center"><button class="btn ghost" data-act="vAns" data-k="0">Не знаю</button><button class="btn" data-act="vAns" data-k="1">Знаю</button></div>` : '<div class="cta-bar" style="justify-content:center"><button class="btn navy" data-act="vFlip">Показать перевод</button></div>'}</div></div>`);
  };
  IE.acts.vAns = (el) => {
    const s = IE.vsess, w = s.queue.shift(), p = ST.p(), rec = p.vocab[w.w] || { box: 0 }, know = el.dataset.k === '1';
    s.total++;
    if (know) { s.known++; const b = Math.min(5, rec.box + 1); ST.setVocab(w.w, b, Date.now() + INT[b] * DAY); }
    else { ST.setVocab(w.w, 1, Date.now()); s.queue.push(w); }
    s.flipped = false; IE.refresh();
  };

  /* ---------- Exam Guide ---------- */
  const tabHTML = (tab, name) => `<table><tr><th>${name}: верных из 40</th><th>Band</th></tr>${tab.filter((r) => r[1]).map((r, i, arr) => { const hi = i === 0 ? 40 : tab[i - 1][0] - 1; return `<tr><td>${r[0] === hi ? hi : r[0] + '–' + hi}</td><td>${r[1].toFixed(1)}</td></tr>`; }).join('')}</table>`;
  V.guide = () => show(`<h1>Exam Guide</h1><p class="muted">IELTS Academic: структура, время, оценивание.</p>
    <div class="grid two"><div class="card"><h3>Структура</h3><table class="data"><tr><th>Модуль</th><th>Время</th><th>Задания</th></tr><tr><td>Listening</td><td>≈30 мин (+10 на перенос в бланк на бумаге)</td><td>4 части, 40 вопросов</td></tr><tr><td>Reading</td><td>60 мин</td><td>3 текста, 40 вопросов</td></tr><tr><td>Writing</td><td>60 мин</td><td>Task 1 (150+ слов), Task 2 (250+ слов)</td></tr><tr><td>Speaking</td><td>11–14 мин</td><td>3 части, живой экзаменатор</td></tr></table>
      <p class="muted small">Task 2 весит вдвое больше Task 1. Listening, Reading и Writing сдаются в один день; Speaking — в тот же или за несколько дней до/после.</p></div>
      <div class="card"><h3>Как считается Band</h3><ul><li>Каждый навык оценивается от 0 до 9 (шаг 0.5).</li><li><b>Overall</b> = среднее четырёх навыков, округлённое до ближайшего 0.5: 6.25 → 6.5, 6.75 → 7.0, 6.125 → 6.0.</li><li>Listening и Reading: число верных ответов переводится в band по таблице.</li><li>Writing и Speaking: оценка экзаменатора по 4 критериям.</li></ul></div></div><div class="spacer"></div>
    <div class="grid two"><div class="card">${tabHTML(IE.L_TAB, 'Listening')}</div><div class="card">${tabHTML(IE.R_TAB, 'Reading (Academic)')}</div></div>
    <p class="muted small">Таблицы приблизительные: официальный пересчёт слегка различается от теста к тесту.</p><div class="spacer"></div>
    <div class="card"><h3>Чек-лист дня экзамена</h3><ul class="rules"><li>Паспорт или документ, указанный при регистрации.</li><li>Приходите за 30–45 минут. Телефоны и часы сдаются.</li><li>Карандаш, ластик, ручка (на бумажном экзамене).</li><li>Следите за временем: в Reading не больше 20 минут на текст.</li><li>В Writing распределите 20 минут на Task 1 и 40 на Task 2.</li><li>В Speaking не заучивайте ответы, говорите естественно.</li></ul></div>`);

  /* ---------- Калькулятор Band ---------- */
  V.calc = () => show(`<h1>Band Calculator</h1><p class="muted">Введите число верных ответов (0–40) по Listening/Reading и оценки Writing/Speaking.</p>
    <div class="card"><div class="row"><label class="small muted">Listening (из 40)<br><input type="number" class="js-calc" id="cL" min="0" max="40" style="width:110px"></label><label class="small muted">Reading (из 40)<br><input type="number" class="js-calc" id="cR" min="0" max="40" style="width:110px"></label>
      <label class="small muted">Writing band<br><input type="number" class="js-calc" id="cW" min="0" max="9" step="0.5" style="width:110px"></label><label class="small muted">Speaking band<br><input type="number" class="js-calc" id="cS" min="0" max="9" step="0.5" style="width:110px"></label></div>
      <div id="calcOut" class="calc-out"></div></div><div class="spacer"></div>
    <div class="card"><h3>Сколько нужно верных для цели?</h3><div class="row"><label class="small muted">Целевой Band<br><select id="cT" class="js-calc">${[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((b) => `<option ${b === (ST.p().target || 7) ? 'selected' : ''}>${b.toFixed(1)}</option>`).join('')}</select></label></div><div id="needOut"></div></div>`);
  IE.acts.calcUpdate = () => {
    const g = (id) => { const v = document.getElementById(id).value; return v === '' ? null : +v; };
    const L = g('cL'), R = g('cR'), W = g('cW'), S = g('cS');
    const bl = L === null ? null : IE.bandFromRaw('listening', L), br = R === null ? null : IE.bandFromRaw('reading', R);
    const ov = IE.overall([bl, br, W, S]);
    document.getElementById('calcOut').innerHTML = `<div class="grid four" style="margin-top:14px"><div class="stat"><div class="num">${band(bl)}</div><div class="lbl">Listening</div></div><div class="stat"><div class="num">${band(br)}</div><div class="lbl">Reading</div></div><div class="stat"><div class="num">${band(W)}</div><div class="lbl">Writing</div></div><div class="stat"><div class="num">${band(S)}</div><div class="lbl">Speaking</div></div></div><p style="text-align:center">Overall: <span class="score-big" style="font-size:56px">${band(ov)}</span></p>`;
    const t = +document.getElementById('cT').value;
    document.getElementById('needOut').innerHTML = `<p>Для Band <b>${t.toFixed(1)}</b> в одном модуле нужно: Listening — <b>${IE.rawForBand('listening', t)}</b>/40, Reading — <b>${IE.rawForBand('reading', t)}</b>/40.</p>`;
  };

  /* ---------- Пробные тесты ---------- */
  const avgOf = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  // Speaking-band теста: последние сессии по заданиям теста, сохранённые после его прохождения
  IE.speakingBandFor = (t) => {
    const test = IE.tests.find((x) => x.id === t.testId), p = ST.p();
    if (!test) return t.S;
    const vals = test.speaking.map((id) => { const l = p.speaking.filter((s) => s.id === id && s.ts >= t.ts); return l.length ? l[l.length - 1].band : null; }).filter((x) => x !== null);
    return vals.length ? IE.halfBand(avgOf(vals)) : (t.S === undefined ? null : t.S);
  };
  IE.testOverall = (t) => IE.overall([t.L.band, t.R.band, t.W, IE.speakingBandFor(t)]);
  V.tests = () => {
    const p = ST.p();
    const best = (id) => { const l = p.tests.filter((t) => t.testId === id).map((t) => (IE.testOverall(t) ?? t.overall)); return l.length ? Math.max.apply(null, l) : null; };
    show(`<h1>Practice Tests</h1><p class="muted">Полные тесты IELTS Academic: Listening (4 части, 40 баллов), Reading (3 текста, 40 баллов), Writing (Task 1 + Task 2) — с автоматической проверкой. Speaking сдаётся отдельно после теста: Part 1–3 с распознаванием речи.</p>
      <div class="grid three">${IE.tests.map((t) => `<div class="card test-card"><div class="no">${t.id}</div><h3>${t.title}</h3>
        <p class="small">Listening ${IE.sumMarks(t.listening.map((i) => IE.setById[i]))} · Reading ${IE.sumMarks(t.reading.map((i) => IE.setById[i]))} · Writing ${t.writing.length} задания · Speaking ${t.speaking.length} части</p>
        <p class="best">${best(t.id) !== null ? 'Лучший Overall: ' + band(best(t.id)) : 'Ещё не проходили'}</p>
        <div class="cta-bar"><button class="btn" data-act="startExam" data-test="${t.id}" data-mode="timed">Timed</button><button class="btn ghost" data-act="startExam" data-test="${t.id}" data-mode="untimed">Untimed</button></div></div>`).join('')}</div>
      <div class="spacer"></div><div class="card"><h3>Как это работает</h3><ul class="rules"><li><b>Timed:</b> Listening 30 мин (звук можно запустить один раз), Reading 60 мин, Writing 60 мин. <b>Untimed:</b> без таймера, звук можно повторять.</li><li>Listening и Reading переводятся в Band по таблице Academic; Writing оценивается автоматически (Task 2 весит вдвое больше Task 1); Speaking — через распознавание речи и самооценку.</li><li>Тесты авторские: форматы заданий как на экзамене, но тексты и записи короче реальных. Звук — синтез речи браузера.</li></ul></div>
      ${p.tests.length ? `<div class="spacer"></div><div class="card"><h3>История</h3><table class="data"><tr><th>Дата</th><th>Тест</th><th>Режим</th><th>L</th><th>R</th><th>W</th><th>S</th><th>Overall</th><th></th></tr>${p.tests.map((t, i) => `<tr><td>${U.date(t.ts)}</td><td>${t.testId || '—'}</td><td>${t.mode}</td><td>${band(t.L.band)}</td><td>${band(t.R.band)}</td><td>${band(t.W)}</td><td>${band(IE.speakingBandFor(t))}</td><td><b>${band(IE.testOverall(t) ?? t.overall)}</b></td><td><a href="#/results/${i}">Разбор</a></td></tr>`).reverse().join('')}</table></div>` : ''}`);
  };

  V.results = (i) => {
    const t = ST.p().tests[+i];
    if (!t) return V.notFound();
    const test = IE.tests.find((x) => x.id === t.testId), S = IE.speakingBandFor(t), ov = IE.testOverall(t);
    const L = test ? test.listening.map((id) => IE.setById[id]) : [], R = test ? test.reading.map((id) => IE.setById[id]) : [];
    const review = (list) => list.map((s) => { IE.cur = { answers: t.answers, checked: true }; const base = list.slice(0, list.indexOf(s)).reduce((a, x) => a + x.marks, 0); return `<h3>${esc(s.title)}</h3>${s.qs.map((q) => IE.qHTML(q, base + q.no)).join('')}`; }).join('');
    const types = {};
    L.concat(R).forEach((s) => s.qs.forEach((q) => { const x = types[q.t] = types[q.t] || [0, 0]; x[1] += IE.marks(q); x[0] += IE.score(q, t.answers[q.id]); }));
    const wd = (t.Wd || []).map((w, n) => `<details class="card" style="margin-top:12px"><summary><b>Task ${n + 1}</b> · ${w.words} слов · ${w.grade ? 'Band ' + band(w.grade.overall) + (w.grade.source === 'ai' ? ' (Claude)' : ' (офлайн)') : 'не написано'}</summary>
      ${w.grade ? IE.grade.panel(w.grade, ['ta', 'cc', 'lr', 'gra']) : ''}<h4>Ваш текст</h4><div class="passage">${esc(w.text).replace(/\n/g, '<br>')}</div></details>`).join('');
    const sp = test ? test.speaking.map((id) => IE.speakingTasks.find((x) => x.id === id)) : [];
    show(`<div class="crumbs"><a href="#/tests">← Practice Tests</a></div><div class="card blue"><h2>Test ${t.testId || ''} · ${U.date(t.ts)} · ${t.mode}</h2>
      <div class="row" style="gap:30px"><div><div class="score-big">${band(ov)}</div><div>Overall ${ov === null ? '<span class="small">(появится после Speaking)</span>' : ''}</div></div>
      <div><b>Listening ${band(t.L.band)}</b> (${t.L.correct}/${t.L.total})<br><b>Reading ${band(t.R.band)}</b> (${t.R.correct}/${t.R.total})<br><b>Writing ${band(t.W)}</b><br><b>Speaking ${band(S)}</b></div></div></div><div class="spacer"></div>
      <div class="card"><h3>Writing</h3><p class="muted small">Task 2 весит вдвое больше Task 1: Writing = (Task 1 + 2 × Task 2) / 3.</p>${wd}
        <div class="cta-bar"><button class="btn small navy" data-act="rGradeAI" data-i="${i}">🤖 Перепроверить с Claude</button></div><div id="rgout"></div></div><div class="spacer"></div>
      <div class="card"><h3>Speaking</h3><p class="muted small">Пройдите Part 1 и Part 2/3 этого теста — оценка подтянется автоматически (берутся сессии после даты теста).</p>
        <div class="cta-bar" style="margin-top:0">${sp.map((x) => `<a class="btn small ${x.part === 1 ? '' : 'navy'}" href="#/speak/${x.id}">Part ${x.part === 1 ? '1' : '2 + 3'}: ${esc(x.title)}</a>`).join('')}</div>
        <div class="row" style="margin-top:10px"><label class="small muted">Вручную: Writing<br><input type="number" id="rW" min="0" max="9" step="0.5" value="${t.W ?? ''}" style="width:100px"></label><label class="small muted">Speaking<br><input type="number" id="rS" min="0" max="9" step="0.5" value="${t.S ?? ''}" style="width:100px"></label><button class="btn small" data-act="saveWS" data-i="${i}">Save</button></div></div><div class="spacer"></div>
      <div class="card"><h3>По типам заданий</h3><table class="data"><tr><th>Тип</th><th>Баллов</th></tr>${Object.entries(types).map(([k, v]) => `<tr><td>${IE.TYPE_NAMES[k]}</td><td>${v[0]} / ${v[1]} (${U.pct(v[0], v[1])}%)</td></tr>`).join('')}</table></div><div class="spacer"></div>
      <div class="tabs"><button class="btn small on" data-act="revTab" data-t="rl">Listening</button><button class="btn small" data-act="revTab" data-t="rr">Reading</button></div>
      <div class="card" id="rl">${review(L)}</div><div class="card" id="rr" hidden>${review(R)}</div>`);
  };

  /* ---------- Личный кабинет ---------- */
  V.cabinet = () => {
    const p = ST.p(), o = IE.stats.overall();
    const types = {}; Object.entries(p.qs).forEach(([id, r]) => { const q = IE.qById[id]; if (!q) return; const x = types[q.t] = types[q.t] || [0, 0]; x[0] += r.right; x[1] += r.tries; });
    const pts = p.tests.map((t) => t.overall != null ? t.overall : IE.halfBand((t.L.band + t.R.band) / 2));
    let chart = '<p class="muted">Пройдите пробный тест — здесь появится график.</p>';
    if (pts.length) {
      const W = 520, H = 180, x = (i) => 40 + (pts.length === 1 ? 220 : (440 * i) / (pts.length - 1)), y = (b) => H - 28 - ((b - 3) / 6) * (H - 50);
      chart = `<svg class="chart" viewBox="0 0 ${W} ${H}">${[3, 5, 7, 9].map((b) => `<line x1="40" x2="${W - 10}" y1="${y(b)}" y2="${y(b)}" stroke="#c8d3ea"/><text x="8" y="${y(b) + 4}" font-size="12" fill="currentColor">${b}</text>`).join('')}<line x1="40" x2="${W - 10}" y1="${y(p.target)}" y2="${y(p.target)}" stroke="#c8102e" stroke-dasharray="5 4"/><polyline fill="none" stroke="#0b2455" stroke-width="3" points="${pts.map((b, i) => x(i) + ',' + y(b)).join(' ')}"/>${pts.map((b, i) => `<circle cx="${x(i)}" cy="${y(b)}" r="5" fill="#c8102e"/><text x="${x(i)}" y="${y(b) - 9}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${b}</text>`).join('')}</svg>`;
    }
    show(`<h1>My Locker</h1>${IE.campus.lockerPanel()}<div class="spacer"></div>
      <div class="grid four"><div class="card stat"><div class="num">${o.tries ? U.pct(o.right, o.tries) + '%' : '—'}</div><div class="lbl">Точность</div></div><div class="card stat"><div class="num">${o.lessons}</div><div class="lbl">Уроков</div></div><div class="card stat"><div class="num">${o.writing}</div><div class="lbl">Работ Writing</div></div><div class="card stat"><div class="num">${o.words}</div><div class="lbl">Слов выучено</div></div></div><div class="spacer"></div>
      <div class="grid two"><div class="card"><h3>Динамика пробных тестов</h3>${chart}</div>
        <div class="card"><h3>Слабые типы заданий</h3>${Object.keys(types).length ? Object.entries(types).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([k, v]) => `<div class="weak"><span>${IE.TYPE_NAMES[k]}</span><b>${U.pct(v[0], v[1])}% <span class="muted small">(${v[1]})</span></b></div>`).join('') : '<p class="muted">Пока нет данных.</p>'}</div></div><div class="spacer"></div>
      <div class="grid two"><div class="card"><h3>Writing</h3>${p.writing.length ? p.writing.slice(-6).reverse().map((w) => `<div class="weak"><a href="#/write/${w.id}">${esc((IE.writingTasks.find((t) => t.id === w.id) || { title: w.id }).title)}</a><span>${band(w.band)} · ${w.words} сл. · ${U.date(w.ts)}</span></div>`).join('') : '<p class="muted">Нет сохранённых работ.</p>'}</div>
        <div class="card"><h3>Speaking</h3>${p.speaking.length ? p.speaking.slice(-6).reverse().map((w) => `<div class="weak"><a href="#/speak/${w.id}">${esc((IE.speakingTasks.find((t) => t.id === w.id) || { title: w.id }).title)}</a><span>${band(w.band)} · ${U.date(w.ts)}</span></div>`).join('') : '<p class="muted">Нет сессий.</p>'}</div></div><div class="spacer"></div>
      <div class="card"><h3>Настройки проверки (Claude API)</h3>
        <p class="small">Для оценки Writing и Speaking «как экзаменатор» сайт отправляет ваш текст или транскрипт в Claude API. Ключ вводите вы сами; он хранится <b>только в этом браузере</b> (не попадает в экспорт данных), а запросы идут напрямую в api.anthropic.com и тарифицируются на вашем аккаунте. Без ключа работает офлайн-проверка.</p>
        <div class="row"><input type="password" id="apiKey" placeholder="${IE.grade.hasKey() ? 'Ключ сохранён — введите новый, чтобы заменить' : 'sk-ant-…'}" style="flex:1;min-width:240px" autocomplete="off"><button class="btn small" data-act="saveKey">Сохранить</button><button class="btn small ghost" data-act="testKey">Проверить</button><button class="btn small ghost" data-act="clearKey">Удалить</button></div>
        <p id="keyStatus" class="small muted">${IE.grade.hasKey() ? 'Статус: ключ задан.' : 'Статус: ключ не задан.'}</p></div><div class="spacer"></div>
      <div class="card"><h3>Профиль и данные</h3><div class="row">${ST.names().map((n) => `<button class="btn small ${n === ST.name() ? '' : 'ghost'}" data-act="switchProfile" data-name="${esc(n)}">${esc(n)}</button>`).join('')}<button class="btn small gold" data-act="newProfile">+ Новый</button></div>
        <p><button class="btn small ghost" data-act="exportData">Экспорт</button> <button class="btn small ghost" data-act="importData">Импорт</button> <button class="btn small ghost" data-act="resetProfile">Сбросить прогресс</button> <button class="btn small ghost" data-act="deleteProfile">Удалить профиль</button></p>
        <textarea id="dataBox" class="inp" rows="4" style="width:100%" placeholder="Здесь появится экспорт; для импорта вставьте JSON и нажмите «Импорт»"></textarea></div>`);
  };
})();
