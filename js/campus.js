/* «Университетская жизнь»: студенческий билет, уровни (Fresher → Professor), значки, табель по навыкам (Band),
   цель дня, советы тренера, конфетти. Всё считается из данных профиля. */
(function () {
  'use strict';
  const IE = window.IE, U = IE.util, ST = IE.store, esc = U.esc;
  const C = (IE.campus = {});
  IE.ui = { bar: (f, cls) => `<div class="bar ${cls || ''}"><i style="width:${Math.round(Math.max(0, Math.min(1, f)) * 100)}%"></i></div>` };

  const MASCOTS = [['🦁', 'Lions'], ['🐉', 'Dragons'], ['🦌', 'Stags'], ['🦅', 'Eagles'], ['🐻', 'Bears'], ['🐺', 'Wolves'], ['🦊', 'Foxes']];
  const LEVELS = [
    { name: 'Fresher', xp: 0, icon: '🌱' }, { name: 'Undergraduate', xp: 400, icon: '📘' }, { name: 'Graduate', xp: 1200, icon: '🎓' },
    { name: 'Postgraduate', xp: 2500, icon: '🏅' }, { name: 'Doctor', xp: 4500, icon: '🏆' }, { name: 'Professor', xp: 8000, icon: '👑' },
  ];
  const DAILY_GOAL = 10;

  C.card = function () {
    const p = ST.p();
    if (!p.card) {
      const y = new Date().getFullYear() + (new Date().getMonth() > 5 ? 1 : 0);
      p.card = { mascot: 0, classYear: y, num: String(100000 + (Math.floor(p.created / 1000) % 900000)) };
      ST.save();
    }
    return p.card;
  };

  C.xp = function () {
    const p = ST.p(); let xp = 0;
    Object.values(p.qs).forEach((r) => { xp += r.right * 5 + (r.tries - r.right); });
    xp += Object.keys(p.lessons).length * 30 + p.tests.length * 200 + p.writing.length * 60 + p.speaking.length * 40;
    xp += Object.values(p.vocab).reduce((a, v) => a + v.box * 2, 0);
    return xp;
  };
  C.level = function () {
    const xp = C.xp(); let i = 0;
    LEVELS.forEach((l, k) => { if (xp >= l.xp) i = k; });
    const cur = LEVELS[i], next = LEVELS[i + 1];
    return { xp, cur, next, frac: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1 };
  };

  const BADGES = [
    { id: 'first', icon: '🎒', name: 'First Day', desc: 'Решите первое задание', ok: (o) => o.tries >= 1 },
    { id: 'bookworm', icon: '📚', name: 'Bookworm', desc: 'Изучите 5 уроков', ok: (o) => o.lessons >= 5 },
    { id: 'scholar', icon: '📜', name: 'Scholar', desc: 'Изучите все уроки', ok: (o) => o.lessons >= IE.lessons.length },
    { id: 'century', icon: '💯', name: 'Century Club', desc: 'Решите 100 заданий', ok: (o) => o.tries >= 100 },
    { id: 'sharp', icon: '🎯', name: 'Sharpshooter', desc: '90%+ верных при 30+ заданиях', ok: (o) => o.tries >= 30 && o.right / o.tries >= 0.9 },
    { id: 'streak3', icon: '🔥', name: 'Hot Streak', desc: '3 дня занятий подряд', ok: () => IE.stats.streak() >= 3 },
    { id: 'streak7', icon: '☄️', name: 'Iron Student', desc: '7 дней подряд', ok: () => IE.stats.streak() >= 7 },
    { id: 'perfect', icon: '✨', name: 'Perfect Set', desc: '10 из 10 в наборе', ok: (o, p) => !!(p.flags && p.flags.perfect) },
    { id: 'mock', icon: '📝', name: 'Exam Hall', desc: 'Пройдите пробный тест', ok: (o) => o.tests >= 1 },
    { id: 'b6', icon: '🥉', name: 'Band 6', desc: 'Band 6.0+ в пробном тесте', ok: (o) => o.bestBand >= 6 },
    { id: 'b7', icon: '🥈', name: 'Band 7', desc: 'Band 7.0+ в пробном тесте', ok: (o) => o.bestBand >= 7 },
    { id: 'b8', icon: '🥇', name: 'Band 8', desc: 'Band 8.0+ в пробном тесте', ok: (o) => o.bestBand >= 8 },
    { id: 'writer', icon: '✒️', name: 'Essayist', desc: 'Сохраните 5 письменных работ', ok: (o) => o.writing >= 5 },
    { id: 'w7', icon: '🖋️', name: 'Polished Prose', desc: 'Самооценка Writing 7.0+', ok: (o) => o.bestWriting >= 7 },
    { id: 'orator', icon: '🎤', name: 'Orator', desc: '5 тренировок Speaking', ok: (o) => o.speaking >= 5 },
    { id: 'lexicon', icon: '📖', name: 'Walking Dictionary', desc: '50 слов выучены', ok: (o) => o.words >= 50 },
  ];
  C.badges = BADGES;

  C.check = function () {
    const p = ST.p(); if (!p) return;
    p.badges = p.badges || {};
    const o = IE.stats.overall(), fresh = [];
    BADGES.forEach((b) => { if (!p.badges[b.id] && b.ok(o, p)) { p.badges[b.id] = Date.now(); fresh.push(b); } });
    const before = p.lvl || 0, lv = C.level(), idx = LEVELS.indexOf(lv.cur);
    if (idx > before) { p.lvl = idx; toast(`${lv.cur.icon} Новый уровень: ${lv.cur.name}!`, true); }
    else if (p.lvl === undefined) p.lvl = idx;
    fresh.forEach((b) => toast(`${b.icon} Значок «${b.name}» — ${b.desc}`));
    if (fresh.length || idx > before) ST.save();
  };

  function toast(text, big) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast' + (big ? ' big' : '');
    t.textContent = text;
    box.appendChild(t);
    if (big) C.confetti();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 5200);
  }
  C.toast = toast;
  C.confetti = function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#c8102e', '#0b2455', '#f2b705', '#ffffff', '#1f8f4e'], wrap = document.createElement('div');
    wrap.className = 'confetti'; wrap.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 70; i++) {
      const s = document.createElement('i');
      s.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.8}s;animation-duration:${2.4 + Math.random() * 1.6}s;transform:rotate(${Math.random() * 360}deg)`;
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 4800);
  };

  const TIPS = [
    'В Listening запись звучит один раз: используйте паузу, чтобы подчеркнуть ключевые слова в вопросах.',
    'В Reading не тратьте больше 20 минут на один текст: нерешённый вопрос можно угадать — штрафа нет.',
    'Ответ в gap fill пишется ровно так, как в тексте: проверьте орфографию и число (singular/plural).',
    'NOT GIVEN — это «в тексте этого нет», а не «мне кажется, что нет».',
    'В Task 1 всегда пишите overview — без него балл за Task Achievement ограничен.',
    'Task 2 стоит вдвое больше Task 1: распределяйте время 20 / 40 минут.',
    'Не используйте сокращения (don’t, it’s) в Writing — это неформально.',
    'В Part 2 Speaking говорите все две минуты — экзаменатор остановит вас сам.',
    'Не заучивайте ответы Speaking: заученная речь снижает оценку за беглость.',
    'Если забыли слово — перефразируйте, а не молчите. Это тоже оценивается как навык.',
    'Читайте вопросы Listening заранее и предсказывайте тип ответа: число, имя, место.',
    'Ставьте цель: 10 действий в день за месяц — это 300 упражнений.',
    'Слушайте английскую речь ежедневно: подкасты, лекции, новости BBC.',
    'После каждого теста разбирайте ошибки: у каждой есть тип — найдите повторяющийся.',
    'Выспитесь перед экзаменом: свежая голова даёт больше, чем ещё один тест ночью.',
  ];
  C.tip = () => TIPS[Math.floor(Date.now() / 86400000) % TIPS.length];

  /* Табель: band по навыкам */
  C.reportCard = function () {
    const target = ST.p().target || 7;
    const rows = IE.SKILL_IDS.map((s) => ({ s: IE.SKILLS[s], band: IE.stats.skillBand(s) }));
    const est = IE.overall(rows.map((r) => r.band));
    return { rows, est, target };
  };
  const comment = (b, t) => (b === null ? 'Начните тренироваться' : b >= t ? 'Цель достигнута!' : b >= t - 1 ? 'Почти у цели' : 'Нужно больше практики');

  C.idCard = function (editable) {
    const c = C.card(), lv = C.level(), p = ST.p(), best = IE.stats.overall().bestBand, [emoji, team] = MASCOTS[c.mascot] || MASCOTS[0];
    const bars = Array.from({ length: 34 }, (_, i) => `<i style="width:${1 + ((c.num.charCodeAt(i % 6) + i * 7) % 4)}px"></i>`).join('');
    const prog = best ? Math.max(0, Math.min(1, (best - 3) / Math.max(1, p.target - 3))) : 0;
    const opts = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((b) => `<option ${b === p.target ? 'selected' : ''}>${b.toFixed(1)}</option>`).join('');
    const form = editable ? `<div class="id-edit card"><h3>Настроить билет</h3>
        <label class="muted small">Талисман команды</label>
        <div class="mascots">${MASCOTS.map((m, i) => `<button class="mascot ${i === c.mascot ? 'on' : ''}" data-act="setMascot" data-i="${i}" title="${m[1]}" aria-label="${m[1]}">${m[0]}</button>`).join('')}</div>
        <div class="row" style="margin-top:12px">
          <label class="small muted">Выпуск<br><select id="classYear">${[0, 1, 2, 3, 4].map((k) => { const y = new Date().getFullYear() + k; return `<option ${y === c.classYear ? 'selected' : ''}>${y}</option>`; }).join('')}</select></label>
          <label class="small muted">Целевой Band<br><select id="targetBand">${opts}</select></label>
          <label class="small muted">Дата экзамена<br><input type="date" id="examDate" value="${esc(p.examDate || '')}"></label>
          <button class="btn small" data-act="saveCard">Save</button></div></div>` : '';
    return `<div class="idwrap"><div class="idcard">
        <div class="id-hole"></div>
        <div class="id-head"><b>★ IELTS Boot Camp University ★</b><small>Student Identification Card</small></div>
        <div class="id-body">
          <div class="id-photo"><span>${emoji}</span><small>${esc(team)}</small></div>
          <div class="id-info">
            <div class="id-name">${esc(ST.name())}</div>
            <div class="id-row"><span>Class of</span><b>${c.classYear}</b></div>
            <div class="id-row"><span>Level</span><b>${lv.cur.name}</b></div>
            <div class="id-row"><span>Student ID</span><b>${c.num.slice(0, 3)}-${c.num.slice(3)}</b></div>
            <div class="id-row"><span>Target</span><b>Band ${U.band(p.target)}</b></div>
          </div>
        </div>
        <div class="id-goal"><span>Best mock: ${best ? U.band(best) : '—'} / ${U.band(p.target)}</span>${IE.ui.bar(prog)}</div>
        <div class="id-strip" aria-hidden="true">${bars}</div>
        <div class="id-foot">Valid through test day ★ XP ${lv.xp.toLocaleString('ru-RU')}</div>
      </div>${form}</div>`;
  };

  C.levelBar = function () {
    const lv = C.level();
    return `<div class="levelbar"><span class="lv-icon">${lv.cur.icon}</span>
      <div class="lv-main"><b>${lv.cur.name}</b><span class="muted small"> · ${lv.xp.toLocaleString('ru-RU')} XP${lv.next ? ` · до «${lv.next.name}» ещё ${(lv.next.xp - lv.xp).toLocaleString('ru-RU')}` : ' · максимум!'}</span>${IE.ui.bar(lv.frac)}</div></div>`;
  };

  C.homePanel = function () {
    const k = U.dayKey(Date.now()), done = Math.min(DAILY_GOAL, ST.p().days[k] || 0), deg = Math.round((done / DAILY_GOAL) * 360);
    return `<div class="grid three pep">
      <div class="card">${C.levelBar()}<p class="muted small" style="margin:10px 0 0">Каждое задание, урок, эссе и слово приносят XP.</p></div>
      <div class="card goal"><div class="ring" style="background:conic-gradient(var(--red) ${deg}deg, var(--sky) 0)"><b>${done}/${DAILY_GOAL}</b></div>
        <div><h3 style="margin:0">Daily Goal</h3><span class="muted small">${done >= DAILY_GOAL ? 'Цель дня выполнена! 🎉' : `Сделайте ${DAILY_GOAL} действий сегодня`}</span></div></div>
      <div class="card coach"><span class="coach-ico">📣</span><div><h3 style="margin:0">Coach’s Tip</h3><span class="small">${C.tip()}</span></div></div></div>`;
  };

  C.lockerPanel = function () {
    const p = ST.p(), got = p.badges || {}, n = BADGES.filter((b) => got[b.id]).length, rc = C.reportCard();
    const patches = BADGES.map((b) => `<div class="badge ${got[b.id] ? 'earned' : ''}" title="${esc(b.desc)}">
        <div class="patch-ico">${got[b.id] ? b.icon : '🔒'}</div><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`).join('');
    const rows = rc.rows.map((r) => `<tr><td>${r.s.icon} ${r.s.name}<br><span class="muted small">${r.s.ru}</span></td>
      <td class="gr ${r.band !== null && r.band >= rc.target ? 'gA' : 'gC'}">${U.band(r.band)}</td><td class="muted small">${comment(r.band, rc.target)}</td></tr>`).join('');
    return `<div class="grid two" style="align-items:start">${C.idCard(true)}
        <div class="card"><h3>Report Card</h3>
          <table class="data report"><tr><th>Skill</th><th>Band</th><th>Comment</th></tr>${rows}</table>
          <p style="margin:12px 0 0"><b>Estimated overall: ${U.band(rc.est)}</b> <span class="muted small">(цель ${U.band(rc.target)})</span> ${rc.est !== null && rc.est >= rc.target ? '<span class="chip ok">On target</span>' : ''}</p>
          <p class="muted small">Listening/Reading — по точности ответов, Writing/Speaking — по вашим самооценкам (среднее последних 3).</p>
          <div style="margin-top:14px">${C.levelBar()}</div></div></div>
      <div class="spacer"></div>
      <div class="card"><div class="domain-title"><h3>Badges</h3><span class="muted">${n} / ${BADGES.length}</span></div><div class="badges">${patches}</div></div>`;
  };

  IE.acts.setMascot = (el) => { C.card().mascot = +el.dataset.i; ST.save(); IE.refresh(); };
  IE.acts.saveCard = () => {
    C.card().classYear = +document.getElementById('classYear').value;
    ST.setTarget(+document.getElementById('targetBand').value);
    ST.setExamDate(document.getElementById('examDate').value);
    IE.refresh();
  };
})();
