/* Проверка Writing и Speaking.
   1) Офлайн-эвристики по четырём критериям IELTS (без сети и ключа): объём, структура, связность, лексика, грамматические паттерны.
   2) Оценка языковой моделью через Claude API по вашему ключу (ключ хранится только в этом браузере).
   3) Распознавание речи (Web Speech API) для Speaking: транскрипт, темп, паразиты, уверенность распознавания.
   Оценки приблизительные: настоящие экзаменаторы могут отличаться на ±0.5–1 band. */
(function () {
  'use strict';
  const IE = window.IE, U = IE.util, esc = U.esc;
  const G = (IE.grade = {});

  /* ---------- Ключ API и настройки ---------- */
  const KEY_STORE = 'ieltsbootcamp.apikey', MODEL = 'claude-sonnet-5-5';
  G.getKey = () => { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } };
  G.setKey = (k) => { try { if (k) localStorage.setItem(KEY_STORE, k.trim()); else localStorage.removeItem(KEY_STORE); } catch (e) { /* без хранилища */ } };
  G.hasKey = () => G.getKey().length > 20;

  const clampBand = (x) => Math.max(0, Math.min(9, Math.round(+x * 2) / 2));
  const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const wordsOf = (t) => t.match(/[A-Za-z’'-]+/g) || [];

  /* ---------- Словари для эвристик ---------- */
  const AWL = ('analyse approach assess assume authority available benefit concept consequence consistent constitute context contribute create data define derive distribute economy environment establish estimate evidence factor finance function identify income indicate individual interpret involve issue labour legal legislation major method occur percent period policy principle process require research respond role sector significant similar source specific structure theory trend vary adequate alter attitude aspect comprehensive constraint crucial culture demonstrate device domestic dominant enhance ensure evolve exclude facilitate foundation generation impact implement implication inevitable infrastructure innovation integrate investigate justify maintain mental mechanism perceive perspective phenomenon potential predict priority promote reinforce relevant reluctant resource restrict stable sustain technique tendency transform widespread whereas mitigate substantial subsequently undermine vital burden foster curb tackle alleviate deter disparity overall constitute accumulate abstract acquire adapt adjacent advocate aggregate allocate ambiguous appreciate arbitrary automate bias category challenge circumstance clarify collapse commodity compensate complex comply conceive conduct confirm consent considerable contrast convert deduce deviate dimension discrete diversity eliminate emerge emphasis enormous equivalent erode ethical exploit fluctuate focus guarantee hypothesis illustrate immigrate inherent initiate insight instance intense interact internal intervene isolate Jan'.split(' ')).filter((w) => w !== 'Jan');
  const AWL_SET = new Set(AWL);
  const SPELL = { recieve: 'receive', definately: 'definitely', seperate: 'separate', occured: 'occurred', untill: 'until', wich: 'which', becuase: 'because', goverment: 'government', enviroment: 'environment', ocasion: 'occasion', accomodation: 'accommodation', neccessary: 'necessary', publically: 'publicly', tommorow: 'tomorrow', begining: 'beginning', beleive: 'believe', freind: 'friend', thier: 'their', existance: 'existence', independant: 'independent', succesful: 'successful', sucess: 'success', knowlege: 'knowledge', maintainance: 'maintenance', truely: 'truly', wierd: 'weird', adress: 'address', arguement: 'argument', comittee: 'committee', experiance: 'experience', foriegn: 'foreign', immediatly: 'immediately', intresting: 'interesting', noticable: 'noticeable', posible: 'possible', prefered: 'preferred', relevent: 'relevant', responsability: 'responsibility', strenght: 'strength', writting: 'writing', diffrent: 'different', usefull: 'useful', peaple: 'people', studens: 'students', goverments: 'governments', alot: 'a lot', developped: 'developed', carreer: 'career', percieve: 'perceive', enviromental: 'environmental', advertisment: 'advertisement', mantain: 'maintain' };
  // [regex, тип, пояснение (RU), исправление]
  const ERR = [
    [/\b(informations|advices|furnitures|equipments|knowledges|researches|homeworks)\b/gi, 'grammar', 'Неисчисляемое существительное не имеет формы множественного числа.', 'information, advice, equipment…'],
    [/\b(peoples|childs|mans|womans|childrens)\b/gi, 'grammar', 'Неверная форма множественного числа.', 'people, children, men, women'],
    [/\b(he|she|it|everyone|everybody) (don’t|don't|do not|have)\b/gi, 'grammar', 'Согласование подлежащего и сказуемого (3-е лицо ед. числа).', 'he/she/it doesn’t / has'],
    [/\b(people|children|police) (is|was|has)\b/gi, 'grammar', '«People» — множественное число, глагол во множественном числе.', 'people are / were / have'],
    [/\b(they|we|you) (is|was|has)\b/gi, 'grammar', 'Неверная форма глагола с подлежащим во множественном числе.', 'they are / were / have'],
    [/\bmore (better|easier|cheaper|faster|bigger|worse|harder|larger|smaller)\b/gi, 'grammar', 'Двойная степень сравнения.', 'better, easier… (без more)'],
    [/\b(can|could|should|must|will|would|may|might) to \w+/gi, 'grammar', 'После модального глагола частица to не нужна.', 'modal + infinitive without to'],
    [/\b(have|has) (went|came|did|took|saw|wrote|ate|made|began|ran)\b/gi, 'grammar', 'После have/has нужна форма причастия II.', 'have gone / come / done / taken…'],
    [/\b(did not|didn’t|didn't|does not|doesn’t|doesn't|do not|don’t|don't) (went|came|took|saw|made|had|was|were)\b/gi, 'grammar', 'После did/does/do глагол стоит в начальной форме.', 'did not go / take / see'],
    [/\ba (?!un|eu|uni|use|one|once|ubi|ur)[aeiou]\w+/gi, 'grammar', 'Артикль «a» перед гласным звуком — нужен «an».', 'an + vowel sound'],
    [/\ban (?!hour|honest|honour|honor|heir)[bcdfgjklmnpqrstvwxz]\w+/gi, 'grammar', 'Артикль «an» перед согласным звуком — нужен «a».', 'a + consonant sound'],
    [/\bin the other hand\b/gi, 'vocabulary', 'Устойчивое выражение: on the other hand.', 'on the other hand'],
    [/\bmost of (people|students|children|countries)\b/gi, 'grammar', 'Без «of» при обобщении.', 'most people / students'],
    [/\bthere (is|was) (many|several|few|a lot of \w+s)\b/gi, 'grammar', 'После many/several/few нужно there are/were.', 'there are many…'],
    [/\b(\w{3,}) \1\b/gi, 'grammar', 'Повтор слова подряд.', 'уберите повтор'],
    [/(^|[.!?]\s+)[a-z]/g, 'punctuation', 'Предложение должно начинаться с заглавной буквы.', 'Capital letter'],
    [/(^|[^A-Za-z’'])i(?=[ ’',.])/g, 'punctuation', 'Местоимение I всегда пишется с заглавной.', 'I'],
    [/,[A-Za-z]/g, 'punctuation', 'Нет пробела после запятой.', ', + space'],
    [/\bless (people|cars|students|children|jobs|workers)\b/gi, 'grammar', 'С исчисляемыми существительными используется fewer.', 'fewer people / cars…'],
  ];
  const INFORMAL = /\b(a lot of|lots of|kids|stuff|guys?|gonna|wanna|really|very very|thing|things|good|bad|nice|big|get|got)\b/gi;
  const OPINION = /\b(i think|in my opinion|i believe|i feel|i would say|should)\b/gi;
  const CONTENT_STOP = new Set(IE.STOPWORDS || []);

  /* ---------- Офлайн: Writing ---------- */
  function chartNumbers(task) {
    const c = task && task.chart; if (!c) return [];
    if (c.type === 'table') return c.rows.flatMap((r) => r.slice(1)).map(String);
    if (c.type === 'pie') return c.charts.flatMap((ch) => ch.parts.map((p) => String(p.v)));
    return c.series.flatMap((s) => s.v.map(String));
  }
  function relevance(text, prompt) {
    const key = [...new Set(wordsOf(prompt).map((w) => w.toLowerCase()).filter((w) => w.length > 4 && !CONTENT_STOP.has(w)))];
    if (!key.length) return 1;
    const low = text.toLowerCase();
    return key.filter((k) => low.includes(k.slice(0, Math.max(4, k.length - 2)))).length / key.length;
  }
  function findIssues(text) {
    const out = [];
    ERR.forEach(([re, type, explanation, fix]) => {
      re.lastIndex = 0; let m, n = 0;
      while ((m = re.exec(text)) && n < 3) {
        n++;
        const s = Math.max(0, m.index - 12), quote = text.slice(s, m.index + m[0].length + 14).replace(/\s+/g, ' ').trim();
        out.push({ quote, type, explanation, fix });
        if (m[0].length === 0) re.lastIndex++;
      }
    });
    wordsOf(text).forEach((w) => { const lw = w.toLowerCase(); if (SPELL[lw]) out.push({ quote: w, type: 'spelling', explanation: 'Орфографическая ошибка.', fix: SPELL[lw] }); });
    return out;
  }

  G.writingOffline = function (text, taskNo, task) {
    const a = IE.analyze(text), min = taskNo === 1 ? 150 : 250, words = a.words;
    const low = ' ' + text.toLowerCase().replace(/\s+/g, ' ') + ' ';
    const notes = { ta: [], cc: [], lr: [], gra: [] };
    const issues = findIssues(text);
    const grammarErr = issues.filter((i) => i.type === 'grammar' || i.type === 'punctuation').length;
    const spellErr = issues.filter((i) => i.type === 'spelling').length;
    const perHundred = words ? (issues.length / words) * 100 : 0;
    const paras = text.trim().split(/\n\s*\n/).filter((p) => p.trim());

    /* Task Achievement / Response */
    let ta = 5;
    const ratio = words / min;
    if (taskNo === 1) {
      const hasOverview = /\b(overall|in general|generally|as a whole|it is clear that|the main trend|in summary|to summarise)\b/.test(low);
      const nums = (text.match(/\d+(\.\d+)?/g) || []).length;
      const chartN = chartNumbers(task), covered = chartN.length ? chartN.filter((n) => new RegExp('(^|[^\\d.])' + n.replace('.', '\\.') + '([^\\d]|$)').test(text)).length / chartN.length : 0;
      const comps = (low.match(/\b(compared with|compared to|whereas|while|in contrast|by contrast|than|twice|three times|double|half|respectively|the same as)\b/g) || []).length;
      if (hasOverview) { ta += 1; notes.ta.push('+ есть overview (общий вывод).'); } else notes.ta.push('− нет явного overview: добавьте абзац с 2 главными трендами без цифр.');
      if (nums >= 6) { ta += 0.5; notes.ta.push('+ достаточно конкретных данных (' + nums + ').'); } else notes.ta.push('− мало цифр (' + nums + '): подкрепите описание данными.');
      if (covered >= 0.35) { ta += 0.5; notes.ta.push('+ использованы ключевые значения из графика.'); } else if (chartN.length) notes.ta.push('− мало значений из графика (использовано ' + Math.round(covered * 100) + '%).');
      if (comps >= 3) { ta += 0.5; notes.ta.push('+ есть сравнения.'); } else notes.ta.push('− мало сравнений между группами/годами.');
      if (OPINION.test(text)) { ta -= 1; notes.ta.push('− личное мнение или оценка в Task 1 не нужны.'); }
      OPINION.lastIndex = 0;
      if (nums === 0) ta = Math.min(ta, 4.5);
    } else {
      const first = (paras[0] || '').toLowerCase(), last = (paras[paras.length - 1] || '').toLowerCase();
      if (/\b(i (strongly |partly |totally )?(agree|disagree|believe|think)|in my opinion|this essay|will (discuss|examine|explore|consider)|to (a large|some) extent|outweigh)\b/.test(first + ' ' + last)) { ta += 0.5; notes.ta.push('+ позиция/план эссе обозначены.'); } else notes.ta.push('− не видно чёткой позиции во введении или заключении.');
      if (/\b(in conclusion|to conclude|to sum up|in summary|overall|all in all)\b/.test(last)) { ta += 0.5; notes.ta.push('+ есть заключение.'); } else notes.ta.push('− нет явного заключения.');
      const ex = (low.match(/\b(for example|for instance|such as|e\.g\.)\b/g) || []).length;
      if (ex >= 2) { ta += 0.5; notes.ta.push('+ идеи подкреплены примерами (' + ex + ').'); } else notes.ta.push('− мало примеров: к каждой идее нужен пример.');
      if (paras.length >= 4) { ta += 0.5; } else notes.ta.push('− абзацев ' + paras.length + ': нужна структура intro / body / conclusion.');
      if (words >= min * 1.1) { ta += 0.5; }
      const rel = task ? relevance(text, task.prompt) : 1;
      if (rel >= 0.4) { ta += 0.5; notes.ta.push('+ ответ соответствует теме.'); } else if (rel < 0.2) { ta -= 1; notes.ta.push('− ответ слабо связан с заданием (совпадение ключевых слов ' + Math.round(rel * 100) + '%).'); }
    }
    if (ratio < 0.5) { ta = Math.min(ta, 3.5); notes.ta.push('− критически мало слов: ' + words + ' из ' + min + '.'); }
    else if (ratio < 0.7) { ta = Math.min(ta, 4.5); notes.ta.push('− мало слов: ' + words + ' из ' + min + ' — штраф по Task Achievement.'); }
    else if (ratio < 0.9) { ta = Math.min(ta, 5.5); notes.ta.push('− меньше минимума: ' + words + ' из ' + min + '.'); }
    else if (ratio < 1) { ta = Math.min(ta, 6); }

    /* Coherence and Cohesion */
    let cc = 5;
    const conn = a.connectors.length;
    cc += conn >= 10 ? 1.5 : conn >= 7 ? 1 : conn >= 4 ? 0.5 : 0;
    notes.cc.push((conn >= 7 ? '+ ' : '− ') + 'разнообразных связок: ' + conn + (conn >= 7 ? '.' : ' (нужно 7+, но без перегруза).'));
    if (paras.length >= (taskNo === 1 ? 3 : 4)) { cc += 0.5; notes.cc.push('+ достаточное абзацирование.'); } else notes.cc.push('− слишком мало абзацев (' + paras.length + ').');
    const heavy = IE.CONNECTORS.filter((c) => (low.split(' ' + c).length - 1) >= 4);
    if (heavy.length) { cc -= 0.5; notes.cc.push('− связка «' + heavy[0] + '» повторяется слишком часто.'); }
    if (a.avgLen >= 12 && a.avgLen <= 28) { cc += 0.5; notes.cc.push('+ длина предложений сбалансирована (' + a.avgLen + ' слов).'); } else if (a.sentences) notes.cc.push('− средняя длина предложения ' + a.avgLen + ' слов: ' + (a.avgLen < 12 ? 'слишком отрывисто.' : 'слишком длинно.'));
    if (paras.length <= 1 && words > 80) cc = Math.min(cc, 5);
    if (words < 80) cc = Math.min(cc, 5);

    /* Lexical Resource */
    let lr = 4.5;
    const lw = wordsOf(text).map((w) => w.toLowerCase());
    const awl = lw.filter((w) => AWL_SET.has(w) || AWL_SET.has(w.replace(/(s|ed|ing|ly)$/, ''))).length;
    lr += a.diversity >= 60 ? 1.5 : a.diversity >= 55 ? 1 : a.diversity >= 50 ? 0.5 : 0;
    notes.lr.push((a.diversity >= 55 ? '+ ' : '− ') + 'разнообразие слов: ' + a.diversity + '% уникальных.');
    lr += awl >= 10 ? 1.5 : awl >= 6 ? 1 : awl >= 3 ? 0.5 : 0;
    notes.lr.push((awl >= 6 ? '+ ' : '− ') + 'академической лексики: ' + awl + '.');
    const avgLen = lw.length ? avg(lw.map((w) => w.length)) : 0;
    if (avgLen >= 4.8) { lr += 0.5; }
    if (a.repeated.filter((r) => r.n >= 6).length >= 3) { lr -= 0.5; notes.lr.push('− много повторов: ' + a.repeated.slice(0, 3).map((r) => r.w + ' ×' + r.n).join(', ') + '.'); }
    if (spellErr >= 3) { lr -= 1; notes.lr.push('− орфографических ошибок: ' + spellErr + '.'); } else if (spellErr) { lr -= 0.5; notes.lr.push('− орфографических ошибок: ' + spellErr + '.'); }
    const informal = (text.match(INFORMAL) || []).length;
    if (informal >= 4) { lr -= 0.5; notes.lr.push('− много разговорных или слишком общих слов (' + informal + '): good, bad, thing, a lot of.'); }
    if (words < 80) lr = Math.min(lr, 5);

    /* Grammatical Range and Accuracy */
    let gra = 5;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const complex = sentences.filter((s) => /\b(although|though|whereas|while|because|since|which|who|whom|whose|if|unless|when|where|that|so that|despite|in spite of|not only)\b/i.test(s)).length;
    const cr = sentences.length ? complex / sentences.length : 0;
    gra += cr >= 0.5 ? 1 : cr >= 0.3 ? 0.5 : 0;
    notes.gra.push((cr >= 0.3 ? '+ ' : '− ') + 'сложных предложений: ' + Math.round(cr * 100) + '% (цель 40–60%).');
    if ((low.match(/\b(is|are|was|were|been|be) (\w+ed|\w+en|made|built|known|seen|given|taken)\b/g) || []).length >= 2) { gra += 0.5; notes.gra.push('+ используется пассивный залог.'); }
    if (/\b(if|unless)\b[^.]*\b(would|will|could|had)\b/.test(low)) { gra += 0.5; notes.gra.push('+ есть условные конструкции.'); }
    const ep = grammarErr / Math.max(1, words) * 100;
    if (ep >= 3) { gra -= 1.5; notes.gra.push('− много ошибок: ' + grammarErr + ' (' + ep.toFixed(1) + ' на 100 слов).'); } else if (ep >= 2) { gra -= 1; notes.gra.push('− заметные ошибки: ' + grammarErr + '.'); } else if (ep >= 1) { gra -= 0.5; notes.gra.push('− ошибок: ' + grammarErr + '.'); } else { gra += 0.5; notes.gra.push('+ автоматическая проверка почти не нашла грамматических ошибок (проверяются только частые паттерны).'); }
    if (a.contractions >= 3) { gra -= 0.5; notes.gra.push('− сокращения (don’t, it’s) неуместны в академическом тексте.'); }
    if (sentences.filter((s) => wordsOf(s).length > 40).length) { gra -= 0.5; notes.gra.push('− есть предложения длиннее 40 слов.'); }
    if (words < 80) gra = Math.min(gra, 5);

    const bands = { ta: clampBand(Math.min(9, ta)), cc: clampBand(Math.min(9, cc)), lr: clampBand(Math.min(9, lr)), gra: clampBand(Math.min(9, gra)) };
    // Офлайн-оценка не отличает 8–9 от 7: потолок 7.5
    Object.keys(bands).forEach((k) => { bands[k] = Math.min(bands[k], 7.5); if (bands[k] < 3) bands[k] = 3; });
    const advice = [];
    if (ratio < 1) advice.push('Добавьте ' + Math.ceil(min - words) + ' слов: недобор объёма снижает оценку.');
    if (bands.ta <= bands.cc && bands.ta <= bands.lr && bands.ta <= bands.gra) advice.push(taskNo === 1 ? 'Проверьте overview и точность цифр.' : 'Усильте позицию и аргументы, добавьте конкретные примеры.');
    if (bands.cc <= 6) advice.push('Работайте над связностью: одна главная мысль в абзаце, разные связки.');
    if (bands.lr <= 6) advice.push('Заменяйте общие слова (good, thing, big) точными и академическими.');
    if (bands.gra <= 6) advice.push('Исправьте найденные ошибки и добавьте сложные предложения.');
    return { source: 'offline', bands, overall: IE.halfBand(avg(Object.values(bands))), notes, issues: issues.slice(0, 14), advice };
  };
  G.writingOverallFromBands = (b) => IE.halfBand(avg([b.ta, b.cc, b.lr, b.gra]));
  // Итог Writing: Task 2 весит вдвое больше Task 1
  G.writingTotal = (t1, t2) => IE.halfBand((t1 + 2 * t2) / 3);

  /* ---------- Офлайн: Speaking ---------- */
  const FILLERS = /\b(um+|uh+|er+|erm|ah+|like|you know|i mean|sort of|kind of|basically|actually)\b/gi;
  const IDIOMS = /\b(on the other hand|as far as i(’|')?m concerned|to be honest|in my view|it depends|a great deal|come across|look forward|as a matter of fact|having said that|in the long run|for the time being|not only|first and foremost|by and large|all in all)\b/gi;
  G.speakingOffline = function (transcript, meta) {
    meta = meta || {};
    const w = wordsOf(transcript), n = w.length, lw = w.map((x) => x.toLowerCase());
    const secs = meta.seconds || 0, wpm = secs ? Math.round(n / (secs / 60)) : null;
    const target = meta.part === 2 ? 180 : meta.part === 3 ? 120 : 60;
    const fillers = (transcript.match(FILLERS) || []).length, fillerRate = n ? (fillers / n) * 100 : 0;
    const notes = { fc: [], lr: [], gra: [], pr: [] };
    const uniq = new Set(lw).size, div = n ? (uniq / n) * 100 : 0;
    const issues = findIssues(transcript).filter((i) => i.type === 'grammar');

    let fc = 5;
    if (wpm) { fc += wpm >= 130 ? 1 : wpm >= 110 ? 0.5 : 0; notes.fc.push((wpm >= 110 ? '+ ' : '− ') + 'темп ' + wpm + ' слов/мин (естественная речь ≈ 120–160).'); }
    if (n >= target) { fc += 1; notes.fc.push('+ развёрнутый ответ: ' + n + ' слов.'); } else if (n >= target * 0.65) { fc += 0.5; notes.fc.push('− ответ чуть короче нужного (' + n + ' из ~' + target + ' слов).'); } else { fc -= 0.5; notes.fc.push('− слишком короткий ответ: ' + n + ' слов (цель ~' + target + ').'); }
    if (fillerRate <= 2) { fc += 0.5; } else if (fillerRate >= 6) { fc -= 1; notes.fc.push('− много слов-паразитов: ' + fillers + '.'); } else notes.fc.push('− слов-паразитов: ' + fillers + '.');
    const dm = (transcript.match(/\b(because|however|for example|for instance|so|but|although|actually|firstly|besides|also|on the other hand|as a result|that’s why|that's why)\b/gi) || []).length;
    if (dm >= 4) { fc += 0.5; notes.fc.push('+ связки в речи: ' + dm + '.'); } else notes.fc.push('− мало связок (' + dm + ').');
    if (n < target * 0.4) fc = Math.min(fc, 5);

    let lr = 5;
    lr += div >= 65 ? 1 : div >= 55 ? 0.5 : 0;
    notes.lr.push((div >= 55 ? '+ ' : '− ') + 'разнообразие слов: ' + Math.round(div) + '% уникальных.');
    const long = lw.filter((x) => x.length >= 7).length / Math.max(1, n);
    lr += long >= 0.18 ? 1 : long >= 0.12 ? 0.5 : 0;
    notes.lr.push((long >= 0.12 ? '+ ' : '− ') + 'доля длинных слов: ' + Math.round(long * 100) + '%.');
    const idi = (transcript.match(IDIOMS) || []).length;
    if (idi >= 2) { lr += 0.5; notes.lr.push('+ устойчивые выражения: ' + idi + '.'); }
    if (n < target * 0.4) lr = Math.min(lr, 5);

    let gra = 5;
    const clauses = (transcript.match(/\b(because|although|which|who|if|when|while|so that|that|since|unless)\b/gi) || []).length;
    const cr = n ? (clauses / n) * 100 : 0;
    gra += cr >= 6 ? 1 : cr >= 3.5 ? 0.5 : 0;
    notes.gra.push((cr >= 3.5 ? '+ ' : '− ') + 'придаточных на 100 слов: ' + cr.toFixed(1) + '.');
    if (/\b(have|has|had) (been|gone|done|seen|taken|made)\b|\b(would|could|might) (have )?\w+/i.test(transcript)) { gra += 0.5; notes.gra.push('+ разнообразие времён и модальных форм.'); }
    const ep = n ? (issues.length / n) * 100 : 0;
    if (ep >= 2) { gra -= 1; notes.gra.push('− найдено ошибок: ' + issues.length + '.'); } else if (ep >= 1) { gra -= 0.5; notes.gra.push('− заметны ошибки: ' + issues.length + '.'); } else { gra += 0.5; notes.gra.push('+ частых ошибок не обнаружено (по транскрипту).'); }
    if (n < target * 0.4) gra = Math.min(gra, 5);

    let pr = null;
    if (meta.confidence) {
      const c = meta.confidence;
      pr = c >= 0.95 ? 8 : c >= 0.9 ? 7 : c >= 0.85 ? 6.5 : c >= 0.8 ? 6 : c >= 0.7 ? 5.5 : 5;
      notes.pr.push('Уверенность распознавания ' + Math.round(c * 100) + '%. Это лишь косвенный показатель понятности речи, а не оценка акцента.');
    } else notes.pr.push('Распознавание речи недоступно — оцените произношение сами по записи.');

    const bands = { fc: Math.min(7.5, clampBand(fc)), lr: Math.min(7.5, clampBand(lr)), gra: Math.min(7.5, clampBand(gra)), pr };
    const parts = [bands.fc, bands.lr, bands.gra].concat(pr ? [pr] : []);
    return { source: 'offline', bands, overall: IE.halfBand(avg(parts)), notes, issues: issues.slice(0, 10), stats: { words: n, wpm, fillers, seconds: secs }, advice: [] };
  };

  /* ---------- Claude API ---------- */
  async function callClaude(system, user) {
    const key = G.getKey();
    if (!key) throw new Error('no-key');
    let r;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: MODEL, max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }),
      });
    } catch (e) { throw new Error('network'); }
    if (r.status === 401 || r.status === 403) throw new Error('auth');
    if (r.status === 429) throw new Error('rate');
    if (!r.ok) throw new Error('http-' + r.status);
    const data = await r.json();
    const text = (data.content || []).map((c) => c.text || '').join('');
    const s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s < 0 || e < 0) throw new Error('parse');
    try { return JSON.parse(text.slice(s, e + 1)); } catch (x) { throw new Error('parse'); }
  }
  G.errorText = (e) => ({
    'no-key': 'Ключ API не задан (My Locker → Настройки проверки).', auth: 'Ключ отклонён сервером: проверьте его правильность и доступ.',
    rate: 'Слишком много запросов или исчерпан лимит. Попробуйте позже.', network: 'Нет связи с сервером (сеть, блокировщик или ограничения браузера).', parse: 'Не удалось разобрать ответ модели. Повторите проверку.',
  }[e.message] || 'Ошибка проверки: ' + e.message);

  const fixBands = (b, keys) => { const o = {}; keys.forEach((k) => { o[k] = b && b[k] != null && !Number.isNaN(+b[k]) ? clampBand(b[k]) : null; }); return o; };
  const normalize = (j, keys) => {
    const bands = fixBands(j.bands, keys), vals = keys.map((k) => bands[k]).filter((x) => x !== null);
    return {
      source: 'ai', bands, overall: vals.length ? IE.halfBand(avg(vals)) : null, summary: j.summary_ru || '',
      notes: Object.fromEntries(keys.map((k) => [k, [(j.notes && j.notes[k]) || '']])),
      issues: (j.issues || []).slice(0, 14).map((i) => ({ quote: String(i.quote || ''), type: i.type || 'grammar', explanation: i.explanation_ru || '', fix: i.fix || '' })),
      advice: j.advice_ru || [],
    };
  };
  const SYS_COMMON = 'You are a certified, strict and consistent IELTS Academic examiner. Apply the public IELTS band descriptors conservatively: use half-band steps, do not inflate scores, and base every score only on evidence in the candidate response. Write explanations in Russian; quotes and corrections stay in English. Respond with ONLY one JSON object, no markdown.';

  G.writingAI = async function (text, taskNo, task) {
    const words = wordsOf(text).length, min = taskNo === 1 ? 150 : 250;
    const sys = SYS_COMMON + ' Criteria: ta = Task Achievement (Task 1) / Task Response (Task 2), cc = Coherence and Cohesion, lr = Lexical Resource, gra = Grammatical Range and Accuracy. Penalise responses under ' + min + ' words in ta, for Task 1 penalise a missing overview and inaccurate data, for Task 2 penalise unclear position, undeveloped ideas or off-topic content.';
    const user = 'Task ' + taskNo + ' prompt:\n' + (task ? task.prompt : '') + '\n' + (task && task.chart ? '\nChart data (JSON): ' + JSON.stringify(task.chart) + '\n' : '') +
      '\nCandidate response (' + words + ' words, minimum ' + min + '):\n"""\n' + text + '\n"""\n\nReturn JSON: {"bands":{"ta":0,"cc":0,"lr":0,"gra":0},"summary_ru":"2-3 sentences","notes":{"ta":"...","cc":"...","lr":"...","gra":"..."},"issues":[{"quote":"exact short quote from the response","type":"grammar|vocabulary|cohesion|task|spelling","explanation_ru":"...","fix":"corrected English"}],"advice_ru":["concrete step 1","step 2","step 3"]} Give up to 10 most important issues.';
    return normalize(await callClaude(sys, user), ['ta', 'cc', 'lr', 'gra']);
  };
  G.speakingAI = async function (transcript, meta) {
    meta = meta || {};
    const sys = SYS_COMMON + ' You are assessing a speech-to-text transcript of an IELTS Speaking answer (Part ' + (meta.part || 1) + '). Criteria: fc = Fluency and Coherence, lr = Lexical Resource, gra = Grammatical Range and Accuracy, pr = Pronunciation. Transcripts have no punctuation and may contain recognition errors, so do not penalise punctuation or capitalisation. Pronunciation cannot be judged reliably from text: give pr only as a cautious estimate from the transcript intelligibility and the recognition confidence provided, and say so in notes.pr.';
    const user = 'Question(s)/cue card:\n' + (meta.prompt || '') + '\n\nMeasured: ' + (meta.seconds ? Math.round(meta.seconds) + ' s of speech, ' : '') + (meta.wpm ? meta.wpm + ' words per minute, ' : '') + (meta.confidence ? 'average recognition confidence ' + Math.round(meta.confidence * 100) + '%.' : 'recognition confidence unavailable.') +
      '\n\nTranscript:\n"""\n' + transcript + '\n"""\n\nReturn JSON: {"bands":{"fc":0,"lr":0,"gra":0,"pr":0},"summary_ru":"2-3 sentences","notes":{"fc":"...","lr":"...","gra":"...","pr":"..."},"issues":[{"quote":"exact quote","type":"grammar|vocabulary|fluency","explanation_ru":"...","fix":"better English"}],"advice_ru":["...","...","..."]}';
    return normalize(await callClaude(sys, user), ['fc', 'lr', 'gra', 'pr']);
  };
  G.testKey = async () => { await callClaude('Reply with the JSON {"ok":true} only.', 'ping'); return true; };

  /* ---------- Распознавание речи ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const stt = (IE.stt = { supported: !!SR, active: false, text: '', conf: [], t0: 0, rec: null });
  stt.start = function (onUpdate) {
    if (!SR) return false;
    stt.text = ''; stt.conf = []; stt.t0 = Date.now(); stt.active = true;
    const r = (stt.rec = new SR());
    r.lang = 'en-GB'; r.continuous = true; r.interimResults = true;
    let finalText = '';
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) { finalText += res[0].transcript + ' '; stt.conf.push(res[0].confidence); } else interim += res[0].transcript;
      }
      stt.text = (finalText + interim).trim();
      onUpdate && onUpdate(stt.text);
    };
    r.onend = () => { if (stt.active) { try { r.start(); } catch (x) { /* уже запущено */ } } };
    r.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { stt.active = false; stt.denied = true; } };
    try { r.start(); } catch (e) { return false; }
    return true;
  };
  stt.stop = function () {
    stt.active = false;
    try { stt.rec && stt.rec.stop(); } catch (e) { /* не запущено */ }
    const c = stt.conf.filter((x) => x > 0);
    return { text: stt.text, seconds: (Date.now() - stt.t0) / 1000, confidence: c.length ? avg(c) : null };
  };

  /* ---------- Разметка результата ---------- */
  const NAMES = { ta: 'Task Achievement / Response', cc: 'Coherence & Cohesion', lr: 'Lexical Resource', gra: 'Grammar', fc: 'Fluency & Coherence', pr: 'Pronunciation' };
  G.panel = function (res, order) {
    const src = res.source === 'ai' ? '<span class="chip ok">Проверка Claude</span>' : '<span class="chip prog">Офлайн-эвристики · ±1 band</span>';
    return `<div class="gpanel"><div class="row">${src}<span style="margin-left:auto" class="gband">${U.band(res.overall)}</span></div>
      ${res.summary ? `<p>${esc(res.summary)}</p>` : ''}
      <div class="grid four" style="gap:10px;margin:10px 0">${order.map((k) => `<div class="stat"><div class="num">${U.band(res.bands[k])}</div><div class="lbl">${NAMES[k]}</div></div>`).join('')}</div>
      ${order.map((k) => `<div class="gnote"><b>${NAMES[k]}</b><ul>${(res.notes[k] || []).filter(Boolean).map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`).join('')}
      ${res.issues.length ? `<h4>Ошибки и правки</h4><div class="issues">${res.issues.map((i) => `<div class="issue"><q>${esc(i.quote)}</q> <span class="chip red">${esc(i.type)}</span><br><span class="small">${esc(i.explanation)}</span>${i.fix ? `<br><span class="small okc">→ ${esc(i.fix)}</span>` : ''}</div>`).join('')}</div>` : ''}
      ${res.advice && res.advice.length ? `<h4>Что делать дальше</h4><ul>${res.advice.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
      ${res.source === 'offline' ? '<p class="muted small">Офлайн-оценка считает объём, структуру, связки, лексику и частые ошибки, но не понимает смысла. Для оценки уровня экзаменатора подключите Claude API в My Locker.</p>' : ''}</div>`;
  };
  G.NAMES = NAMES;
})();
