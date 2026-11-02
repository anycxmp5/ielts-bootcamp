/* Уроки: стратегии и типичные ловушки по каждому навыку. practice — куда вести после урока */
(function () {
  'use strict';
  const L = (id, skill, title, ru, practice, html) => window.IE.addLessons([{ id, skill, title, ru, practice, html }]);

  L('l-intro', 'listening', 'Listening: format and strategy', 'Формат и стратегия', ['l1'], `
    <p>Listening длится около 30 минут и состоит из 4 частей по 10 вопросов. Запись звучит <b>один раз</b>.</p>
    <table><tr><th>Часть</th><th>Что звучит</th></tr><tr><td>1</td><td>Бытовой диалог (запись, бронирование)</td></tr><tr><td>2</td><td>Монолог на бытовую тему (экскурсия, объявление)</td></tr><tr><td>3</td><td>Обсуждение учебной темы 2–4 людьми</td></tr><tr><td>4</td><td>Академическая лекция</td></tr></table>
    <div class="callout">Пока идёт пауза перед частью, читайте вопросы и подчёркивайте ключевые слова. Предсказывайте тип ответа: имя, число, место, прилагательное.</div>
    <h3>Что делать</h3>
    <ul><li>Следите за вопросами по порядку: ответы идут в том же порядке, что и вопросы.</li><li>Не зависайте на пропущенном вопросе — переходите к следующему.</li><li>Пишите ответ сразу: слова пишутся по звукам, поэтому тренируйте орфографию.</li></ul>
    <div class="trap">Говорящий часто поправляет себя («Tuesday… no, sorry, Wednesday»). Верный ответ — последний.</div>`);

  L('l-form', 'listening', 'Form and note completion', 'Заполнение форм и заметок', ['l1', 'l4'], `
    <p>В Parts 1 и 4 вам нужно вписать слова или числа. Обращайте внимание на ограничение: <b>NO MORE THAN TWO WORDS AND/OR A NUMBER</b>.</p>
    <div class="callout">Слова пишутся ровно так, как звучат в записи. Орфография и форма слова (единственное/множественное число) проверяются.</div>
    <ul><li>Имена часто диктуют по буквам: тренируйте английский алфавит (A /eɪ/, E /iː/, I /aɪ/, G /dʒiː/, J /dʒeɪ/).</li><li>Числа: <i>fifteen</i> / <i>fifty</i> различайте по ударению (fifTEEN / FIFty).</li><li>Даты: 14 April, 14th April — принимаются оба варианта.</li></ul>
    <div class="trap">Часто называют и неверное значение: «forty-two pounds a month, or 410 for the year». Вопрос про «monthly price» — ответ 42.</div>`);

  L('l-mc', 'listening', 'Multiple choice and matching', 'Тесты и сопоставление', ['l2', 'l3'], `
    <p>В вариантах ответа слова из записи обычно <b>перефразированы</b>. Совпадение слов само по себе — подсказка к ловушке.</p>
    <div class="example">В записи: «a group of retired sailors». В вариантах: A «a shipping company», B «retired sailors» — верно B, а не A.</div>
    <ul><li>Следите за словами-сигналами смены мысли: <i>but, however, actually, in fact</i>.</li><li>В matching (кто что делает) отмечайте имена и действия параллельно.</li></ul>`);

  L('r-skim', 'reading', 'Skimming and scanning', 'Быстрое чтение и поиск', ['r1'], `
    <p>На Reading 60 минут на 3 текста и 40 вопросов — читать всё подряд не хватит времени.</p>
    <ul><li><b>Skimming</b> (30–60 секунд): заголовок, первое и последнее предложения абзацев — понять общую идею.</li><li><b>Scanning</b>: искать в тексте ключевые слова вопроса — числа, имена, даты, необычные слова.</li></ul>
    <div class="callout">Сначала читайте вопросы, потом текст. Вопросы чаще всего идут в порядке текста (кроме matching headings).</div>
    <div class="trap">Не тратьте более 20 минут на один текст. Вопросы на «поиск слов» (gap fill) решайте первыми.</div>`);

  L('r-tfng', 'reading', 'True / False / Not Given', 'True / False / Not Given', ['r1', 'r2', 'r4'], `
    <p>Это самый коварный тип. Правило: решение принимается только по тексту, не по вашим знаниям.</p>
    <table><tr><th>Ответ</th><th>Когда</th></tr><tr><td>TRUE</td><td>Текст говорит то же (в других словах)</td></tr><tr><td>FALSE</td><td>Текст прямо говорит <b>обратное</b></td></tr><tr><td>NOT GIVEN</td><td>Текст вообще не касается этого утверждения</td></tr></table>
    <div class="trap">Если вы «чувствуете, что это правда», но в тексте нет — это NOT GIVEN. Слова <i>all, always, only, never</i> часто делают утверждение ложным.</div>
    <div class="example">Текст: «over three summers». Утверждение: «The study lasted for two years» → FALSE (противоречие). Утверждение: «The study was funded by the government» → NOT GIVEN.</div>`);

  L('r-yn', 'reading', 'Yes / No / Not Given and matching headings', 'Мнение автора и заголовки', ['r2', 'r3'], `
    <p><b>Yes / No / Not Given</b> спрашивает о <i>мнении автора</i>, а не о фактах. Ищите слова оценки: <i>I believe, unfortunately, clearly</i>.</p>
    <p><b>Matching headings</b>: прочитайте абзац и сформулируйте его главную мысль, затем найдите заголовок. Лишние заголовки — дистракторы: часто содержат слова из текста, но описывают другую мысль.</p>
    <div class="callout">В matching headings сначала делайте очевидные абзацы — оставшиеся варианты станут яснее.</div>`);

  L('r-gap', 'reading', 'Completion and word limits', 'Заполнение пропусков', ['r1', 'r4'], `
    <p>Слова берутся <b>из текста</b> без изменений. Если ограничение «NO MORE THAN TWO WORDS», три слова — ошибка, даже если смысл верен.</p>
    <ul><li>Определите часть речи пропуска по контексту.</li><li>Проверьте грамматику: артикль, число (singular/plural).</li><li>Числа считаются как слово: «50 per cent» — два слова + число.</li></ul>
    <div class="trap">Формулировка в вопросе перефразирована. Ищите синонимы: «warmer» в тексте может стоять рядом с «a few degrees».</div>`);

  L('w-t1', 'writing', 'Task 1: structure and overview', 'Task 1: структура и overview', ['t1-1', 't1-2'], `
    <p>Task 1 — 20 минут, минимум <b>150 слов</b>. Нужно описать данные, не интерпретировать причины.</p>
    <table><tr><th>Абзац</th><th>Содержание</th></tr><tr><td>1</td><td>Перефразируйте задание: что, где, когда</td></tr><tr><td>2</td><td><b>Overview</b>: 2 главных тренда/контраста без цифр</td></tr><tr><td>3</td><td>Детали: группа 1 с цифрами</td></tr><tr><td>4</td><td>Детали: группа 2 с цифрами</td></tr></table>
    <div class="callout">Без чёткого overview оценка по Task Achievement обычно не поднимется выше 5.</div>
    <div class="trap">Не перечисляйте каждую цифру. Выбирайте главное: максимумы, минимумы, пересечения, резкие изменения.</div>`);

  L('w-trend', 'writing', 'Task 1: language of trends', 'Task 1: лексика трендов', ['t1-1', 't1-3', 't1-4'], `
    <table><tr><th>Направление</th><th>Глаголы / существительные</th></tr><tr><td>Рост</td><td>rise, increase, grow, climb / a rise, an increase</td></tr><tr><td>Падение</td><td>fall, decline, drop, decrease / a decline</td></tr><tr><td>Стабильность</td><td>remain stable, level off, stay constant</td></tr><tr><td>Пик/минимум</td><td>peak at, reach a high of, bottom out at</td></tr></table>
    <p><b>Скорость:</b> sharply, dramatically (быстро); gradually, steadily, slightly (медленно).</p>
    <div class="example">«Country B rose steadily from 5% to 35%, then climbed sharply to 80%.»</div>
    <div class="callout">Сравнения: <i>twice as many as, nearly five times, a third of, three times higher than, respectively</i>.</div>`);

  L('w-t2', 'writing', 'Task 2: essay types and structure', 'Task 2: типы эссе', ['t2-1', 't2-2'], `
    <p>Task 2 — 40 минут, минимум <b>250 слов</b>, ценится вдвое больше Task 1.</p>
    <table><tr><th>Тип</th><th>Что делать</th></tr><tr><td>Opinion</td><td>Ясная позиция с самого начала</td></tr><tr><td>Discussion</td><td>Оба мнения + ваше</td></tr><tr><td>Problem/solution</td><td>Причины и решения, соотнесённые</td></tr><tr><td>Advantages/disadvantages</td><td>Взвесить; сказать, что перевешивает</td></tr><tr><td>Two-part</td><td>Ответ на оба вопроса</td></tr></table>
    <div class="callout">Структура: Intro (перефраз + позиция) → Body 1 → Body 2 → Conclusion. В каждом Body: главная мысль → объяснение → пример.</div>
    <div class="trap">Не переписывайте формулировку задания и не пишите ответ «в общем». Отвечайте именно на заданный вопрос.</div>`);

  L('w-band7', 'writing', 'What raises your Writing band', 'Что поднимает балл Writing', ['t2-3', 't2-4'], `
    <ul><li><b>Task Response:</b> позиция и аргументы развиты до конца; пример к каждой идее.</li><li><b>Coherence:</b> одна идея на абзац; разнообразные связки, но не по две в каждом предложении.</li><li><b>Lexical:</b> коллокации (<i>raise awareness, heavy traffic</i>), а не «умные» слова ради слов.</li><li><b>Grammar:</b> сочетание простых и сложных предложений; точность важнее сложности.</li></ul>
    <div class="trap">Типичные ошибки: пропущенные артикли, <i>informations</i>, <i>advices</i>, сокращения (don’t), «I think» в каждом абзаце, повтор одного слова.</div>
    <p>Используйте анализатор текста в редакторе: он покажет количество слов, связки и повторы.</p>`);

  L('s-format', 'speaking', 'Speaking: format and criteria', 'Формат и критерии', ['p1-hometown'], `
    <p>Speaking — 11–14 минут, живой разговор с экзаменатором и запись.</p>
    <table><tr><th>Часть</th><th>Время</th><th>Что</th></tr><tr><td>Part 1</td><td>4–5 мин</td><td>Вопросы о вас и привычных темах</td></tr><tr><td>Part 2</td><td>3–4 мин</td><td>Карточка: 1 мин подготовки, 1–2 мин монолога</td></tr><tr><td>Part 3</td><td>4–5 мин</td><td>Абстрактные вопросы по теме Part 2</td></tr></table>
    <div class="callout">Критерии: Fluency &amp; Coherence, Lexical Resource, Grammar, Pronunciation — по 25%.</div>
    <div class="trap">Отвечайте развёрнуто: «Yes.» — это слабый ответ. Хороший ответ: ответ + причина + пример (2–3 предложения).</div>`);

  L('s-p2', 'speaking', 'Part 2: long turn technique', 'Part 2: монолог', ['p2-person', 'p2-place'], `
    <p>За минуту подготовки запишите <b>ключевые слова</b> (не предложения) по каждому пункту карточки.</p>
    <ul><li>Говорите все 2 минуты: экзаменатор остановит вас.</li><li>Используйте структуру: intro → пункты карточки → why it matters.</li><li>Тренируйте время: 2 минуты — это около 250–300 слов.</li></ul>
    <div class="example">«I would like to talk about… To begin with… What impressed me most was… That is why…»</div>
    <div class="trap">Не заучивайте ответы наизусть. Экзаменатор замечает заученный текст — это снижает балл за беглость.</div>`);

  L('s-p3', 'speaking', 'Part 3: abstract discussion', 'Part 3: абстрактные вопросы', ['p2-skill', 'p2-help'], `
    <p>В Part 3 вопросы шире и абстрактнее: общество, тенденции, будущее. Нужны <b>развёрнутые аргументы</b>.</p>
    <div class="callout">Формула: позиция → причина → пример → (контраст). <i>I think… because… For example… However, …</i></div>
    <ul><li>Сравнивайте: «in the past / nowadays», «younger / older generation».</li><li>Допускайте неопределённость: «It depends on…», «To some extent…».</li></ul>
    <div class="trap">Не отвечайте личной историей, если вопрос общий. Переходите от «I» к «people».</div>`);
})();
