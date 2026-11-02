/* Запуск: инициализация данных, роутер, делегирование событий */
(function () {
  'use strict';
  const IE = window.IE, ST = IE.store;

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const page = parts[0] || '', arg = parts[1];
    document.getElementById('who').textContent = ST.name() ? '★ ' + ST.name() : '';
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === (page === 'lesson' || page === 'practice' || page === 'write' || page === 'speak' ? 'course' : page === 'results' ? 'tests' : page)));
    IE.clearTimers();

    if (IE.exam.active) { // во время теста другие страницы недоступны
      if (page !== 'exam') { location.hash = '#/exam'; return; }
      IE.exam.resume(); return;
    }
    if (!ST.p()) return IE.views.welcome();
    if (page !== 'practice') IE.leavePractice();
    if (page !== 'speak' && page !== 'vocab') IE.tts.stop();
    switch (page) {
      case '': return IE.views.home();
      case 'course': return IE.views.course(arg);
      case 'lesson': return IE.views.lesson(arg);
      case 'practice': return IE.views.practice(arg);
      case 'write': return IE.views.write(arg);
      case 'speak': return IE.views.speak(arg);
      case 'vocab': return IE.views.vocab(arg);
      case 'guide': return IE.views.guide();
      case 'calc': IE.views.calc(); IE.acts.calcUpdate(); return;
      case 'tests': return IE.views.tests();
      case 'results': return IE.views.results(arg);
      case 'cabinet': return IE.views.cabinet();
      case 'exam': location.hash = '#/tests'; return;
      default: return IE.views.notFound();
    }
  }
  IE.refresh = route;

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = IE.acts[el.dataset.act];
    if (fn) fn(el, e);
  });
  // Ввод: ответы на задания, редактор Writing, критерии, калькулятор
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.classList.contains('js-inp')) IE.acts.inp(t);
    else if (t.id === 'wtext') IE.acts.wLive();
    else if (t.classList.contains('strans')) IE.acts.sTrans(t);
    else if (t.classList.contains('js-calc')) IE.acts.calcUpdate();
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.classList.contains('js-inp')) IE.acts.inp(t);
    else if (t.classList.contains('js-crit')) IE.acts.crit(t);
    else if (t.classList.contains('js-calc')) IE.acts.calcUpdate();
  });
  window.addEventListener('hashchange', route);

  IE.init();
  route();
})();
