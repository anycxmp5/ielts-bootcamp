/* Academic Reading: 4 авторских текста по 10 заданий (всего 40, как в реальном тесте) */
(function () {
  'use strict';
  const { tf, yn, mc, gap, sel, group } = window.IE;
  const TFNG = 'Do the following statements agree with the information given in the text? Choose TRUE if the statement agrees, FALSE if it contradicts, NOT GIVEN if there is no information.';
  const YNNG = 'Do the following statements agree with the views of the writer? Choose YES, NO or NOT GIVEN.';
  const TWO = 'Complete the notes. Write NO MORE THAN TWO WORDS from the text for each answer.';

  const heads = ['A mistaken view of the sleeping brain', 'The stage that stores experiences', 'Why caffeine harms memory', 'An early belief about dreaming and memory', 'Advice for students and schools', 'Limits and cautions', 'The cost of sleep loss to the economy'];

  window.IE.addSets([
    {
      id: 'r1', skill: 'reading', title: 'Bees in the City', ru: 'Пчёлы в городе',
      paras: [
        { l: 'A', t: 'In the past decade, a surprising number of hives have appeared on the rooftops of cities from London to Tokyo. Hotels, banks and department stores have installed colonies of honeybees, and some even sell the honey in their own restaurants. Supporters say the trend helps to protect bee populations, which have declined sharply in the countryside since the 1990s. Intensive farming, they argue, has left rural areas with fewer wildflowers and more pesticides, while city gardens and parks offer a longer and more varied flowering season.' },
        { l: 'B', t: 'Research from a university team appears to support this view. The researchers monitored 40 hives, half in a large city and half on farmland, over three summers. The urban colonies produced on average 30 per cent more honey per hive and were less likely to die during winter. The scientists suggested that cities are generally a few degrees warmer than the surrounding land, which helps the bees to start foraging earlier in spring.' },
        { l: 'C', t: 'However, not everyone is convinced that the boom is beneficial. Ecologists point out that honeybees are only one of more than 250 bee species in many European countries, and that most of the others live alone rather than in hives. These wild bees depend on the same flowers as honeybees, and a rooftop with several colonies may therefore leave less food for them. A survey in one European capital found that wild bee numbers fell in areas where the density of hives had doubled.' },
        { l: 'D', t: 'Beekeepers’ associations respond that the answer is not fewer hives but better planning. Many now advise members to plant extra flowers, such as lavender and sage, around their hives, and to avoid placing colonies close to nature reserves. Some city councils have gone further, requiring new roof gardens to include nesting boxes for solitary species. Whether these measures will be enough remains unclear, but most experts agree that the real priority is more flowers, not more hives.' },
      ],
      qs: [
        ...group(TFNG, [
          tf('Honeybee numbers in the countryside have fallen since the 1990s.', 'T', 'Абзац A: «declined sharply in the countryside since the 1990s».'),
          tf('Most of the urban hives in the study belonged to hotels and banks.', 'NG', 'О владельцах ульев в исследовании ничего не сказано.'),
          tf('The urban hives in the university study were more likely to survive the winter.', 'T', 'Абзац B: «were less likely to die during winter».'),
          tf('The university study lasted for two years.', 'F', 'Абзац B: «over three summers».'),
          tf('Ecologists believe that all wild bee species build hives.', 'F', 'Абзац C: большинство диких пчёл живут поодиночке.'),
        ]),
        ...group(TWO, [
          gap('Cities are generally ___ than the surrounding land, so bees can start foraging earlier.', 'warmer', 'Абзац B: «a few degrees warmer».'),
          gap('Wild bees depend on the same ___ as honeybees.', 'flowers', 'Абзац C.'),
          gap('Beekeepers advise planting extra flowers such as lavender and ___ around hives.', 'sage', 'Абзац D.'),
          gap('Some councils require new roof gardens to include ___ for solitary species.', 'nesting boxes', 'Абзац D.'),
          gap('Beekeepers are advised to avoid placing colonies close to ___.', 'nature reserves', 'Абзац D.'),
        ]),
      ],
    },
    {
      id: 'r2', skill: 'reading', title: 'Sleep and Memory', ru: 'Сон и память',
      paras: [
        { l: 'A', t: 'For centuries sleep was regarded as a passive state in which the brain simply switched off. Since the 1950s, however, recordings of brain activity have shown that the sleeping brain passes through a regular cycle of stages, lasting roughly ninety minutes, and that some of these stages are almost as active as waking life.' },
        { l: 'B', t: 'One of these stages, known as rapid eye movement (REM) sleep, is when most vivid dreams occur. Early researchers assumed that it was the key to memory, and many textbooks of the time repeated the idea that dreaming helped the brain to file away the events of the day.' },
        { l: 'C', t: 'Later work pointed instead to deep, slow-wave sleep, which dominates the first half of the night. During this stage the hippocampus, which stores new experiences temporarily, appears to “replay” them to the cortex, where they are gradually turned into long-term memories. Volunteers who were woken whenever they entered deep sleep performed worse on memory tests the next day, even though they had slept for the same total number of hours.' },
        { l: 'D', t: 'The practical implications are considerable. Sleep researchers say that students who stay up all night before an exam are making a mistake: the extra hours of study are likely to be wasted if the material is not consolidated during sleep. Some studies have also linked later school start times to better results among teenagers, whose body clocks run late.' },
        { l: 'E', t: 'Yet sleep is not a cure-all. Researchers caution that most findings come from short laboratory studies with healthy young adults, and that sleeping aids can reduce deep sleep rather than increase it. The best advice remains simple: keep regular hours, avoid screens late at night, and treat sleep as part of learning rather than an interruption of it.' },
      ],
      qs: [
        ...group('The text has five paragraphs, A–E. Choose the correct heading for each paragraph from the list of headings.', [
          sel('Paragraph A', heads, 0, 'Абзац A опровергает старое представление о сне как о «выключении» мозга.'),
          sel('Paragraph B', heads, 3, 'Абзац B — ранняя вера в связь REM-сна и памяти.'),
          sel('Paragraph C', heads, 1, 'Абзац C — глубокий сон и гиппокамп, где опыт превращается в память.'),
          sel('Paragraph D', heads, 4, 'Абзац D — практические советы школьникам и школам.'),
          sel('Paragraph E', heads, 5, 'Абзац E — ограничения исследований и предостережения.'),
        ]),
        ...group('Choose the correct letter, A, B, C or D.', [
          mc('According to paragraph A, since the 1950s researchers have discovered that', ['sleep is one uniform state.', 'sleep stages repeat in a regular cycle.', 'each sleep stage lasts about ten minutes.', 'the brain is inactive during sleep.'], 1, 'Абзац A: «a regular cycle of stages».'),
          mc('Volunteers who were woken whenever they entered deep sleep', ['slept for fewer hours in total.', 'dreamed more vividly.', 'did worse on memory tests despite equal sleep time.', 'improved their results the next day.'], 2, 'Абзац C.'),
        ]),
        ...group(TWO, [
          gap('The hippocampus stores new experiences ___.', 'temporarily', 'Абзац C.'),
          gap('Most findings come from short ___ studies.', 'laboratory', 'Абзац E.'),
        ]),
        ...group(TFNG, [
          tf('Sleeping aids always increase the amount of deep sleep.', 'F', 'Абзац E: они могут её сокращать.'),
        ]),
      ],
    },
    {
      id: 'r3', skill: 'reading', title: 'The Case for Slower Cities', ru: 'Города без машин',
      paras: [
        { l: 'A', t: 'Few city centres were designed for cars. Most European ones date from centuries before the engine, and their narrow streets were made for walkers and carts. As traffic grew, planners widened roads, built flyovers and car parks, and assumed that more road space would reduce congestion. Experience has shown the opposite: new roads attract more drivers, and within a few years the jams return. This is known as induced demand.' },
        { l: 'B', t: 'Several cities have therefore chosen a different approach. After closing a main street to traffic in the early 2000s, one northern European city found that pedestrian numbers rose by a third, and shop owners, who had predicted ruin, reported higher takings. I believe that this experience deserves far wider attention than it has received.' },
        { l: 'C', t: 'Critics argue that restrictions harm disabled and elderly residents. That worry is understandable, but it is largely misplaced: most plans keep access for taxis, ambulances and delivery vehicles, and it is the noise and pollution of heavy traffic that does most harm to the vulnerable. Nor is it realistic to expect the free city-centre car park to survive: land in centres is simply too valuable.' },
        { l: 'D', t: 'Of course, banning cars is not enough by itself. People will only leave their cars at home if buses, trams and cycle routes are cheap, frequent and safe. Cities that have ignored this have seen traffic merely move to neighbouring streets. In my view, public transport must come first, restrictions second.' },
        { l: 'E', t: 'Whether every city will follow remains to be seen. But the evidence suggests that centres with fewer cars become places where people want to linger, rather than places they simply pass through, and that is a goal worth pursuing.' },
      ],
      qs: [
        ...group(YNNG, [
          yn('Building extra roads is an effective long-term way to reduce traffic jams.', 'N', 'Абзац A: «the jams return».'),
          yn('Shop owners were right to fear that closing a street would damage business.', 'N', 'Абзац B: после закрытия выручка выросла.'),
          yn('Restrictions on cars harm disabled people more than pollution does.', 'N', 'Абзац C: основной вред — шум и загрязнение.'),
          yn('Free car parks in city centres are likely to remain.', 'N', 'Абзац C: «Nor is it realistic to expect the free car park to survive».'),
          yn('Cities should improve public transport before restricting cars.', 'Y', 'Абзац D: «public transport must come first».'),
          yn('The writer has visited the northern European city.', 'NG', 'Об этом в тексте ничего нет.'),
        ]),
        ...group(TWO, [
          gap('Planners used to assume that more ___ would reduce congestion.', 'road space', 'Абзац A.'),
          gap('In cities that ignored public transport, traffic simply moved to ___.', 'neighbouring streets', 'Абзац D.'),
        ]),
        ...group('Choose the correct letter, A, B, C or D.', [
          mc('What is the writer’s main purpose in the text?', ['to persuade planners to take an idea seriously', 'to describe the history of city roads', 'to criticise public transport', 'to report a scientific experiment'], 0, 'Автор аргументирует и убеждает (I believe, In my view).'),
          mc('What does “induced demand” refer to?', ['drivers being forced to use new roads', 'new roads attracting more traffic', 'shops asking for more parking', 'planners demanding bigger budgets'], 1, 'Абзац A: «new roads attract more drivers».'),
        ]),
      ],
    },
    {
      id: 'r4', skill: 'reading', title: 'Farming in Towers', ru: 'Вертикальные фермы',
      paras: [
        { l: 'A', t: 'As the world’s population grows and farmland is lost to cities, some scientists argue that the future of food lies not in fields but in tall buildings. In a vertical farm, crops are grown on stacked shelves in a controlled indoor environment, using LED lights instead of sunlight and a mist or nutrient solution instead of soil.' },
        { l: 'B', t: 'The advantages are real. Because the system recycles water, vertical farms can use up to 95 per cent less water than conventional farming for the same crop. Fresh produce can be grown right beside the people who eat it, which reduces transport costs and the time between harvest and sale. There is no need for pesticides, since the indoor environment is sealed, and harvests are unaffected by drought, flood or frost.' },
        { l: 'C', t: 'The drawbacks, though, are significant. Lighting and climate control demand enormous quantities of electricity, and unless this comes from renewable sources, the carbon savings from reduced transport may be cancelled out. Start-up costs are also high; several well-funded companies have closed after failing to cover their costs. As a result, most vertical farms grow only a narrow range of crops, such as leafy greens, herbs and some berries, which are light, quick to grow and sell for a high price per kilo. Staple crops such as wheat and rice, which supply most of the world’s calories, are currently far too cheap and take up too much space to be grown this way.' },
        { l: 'D', t: 'Supporters nevertheless remain optimistic. Falling prices of LED lights have cut energy needs by roughly half over the last decade, and engineers are testing robotic harvesters that would reduce labour costs. Some argue that the real value of vertical farms will be in places where farming is nearly impossible, such as deserts, polar research stations or even spacecraft. On this view, vertical farming will supplement traditional agriculture rather than replace it.' },
      ],
      qs: [
        ...group('Choose the correct letter, A, B, C or D.', [
          mc('According to paragraph A, a vertical farm differs from a conventional farm because it', ['uses artificial light and no soil.', 'grows only one kind of crop.', 'is located far from cities.', 'depends on rainwater.'], 0, 'Абзац A: LED вместо солнца, раствор вместо почвы.'),
          mc('One advantage of vertical farms mentioned in paragraph B is that', ['they need no electricity.', 'produce can be sold soon after harvest.', 'they can grow staple crops cheaply.', 'they are cheap to build.'], 1, 'Абзац B: «the time between harvest and sale» сокращается.'),
          mc('Why do most vertical farms grow only certain crops?', ['Other crops need too much water.', 'Customers dislike other crops.', 'Light, fast crops with high prices are more profitable.', 'Laws restrict other crops.'], 2, 'Абзац C.'),
          mc('What is the writer’s attitude in the final paragraph?', ['strongly opposed', 'cautiously positive', 'completely uninterested', 'openly sceptical'], 1, 'Vertical farming «will supplement … rather than replace» — осторожный оптимизм.'),
        ]),
        ...group(TFNG, [
          tf('Vertical farms use less water than conventional farms.', 'T', 'Абзац B: до 95% меньше воды.'),
          tf('All well-funded vertical farm companies have survived.', 'F', 'Абзац C: «several well-funded companies have closed».'),
          tf('Vertical farms are more common in Asia than in Europe.', 'NG', 'География не обсуждается.'),
        ]),
        ...group(TWO, [
          gap('Vertical farms avoid using ___ because the environment is sealed.', 'pesticides', 'Абзац B.'),
          gap('Falling LED prices have reduced energy needs by roughly ___.', ['half', 'one half', '50%', '50 per cent'], 'Абзац D.'),
          gap('Vertical farms could be valuable in deserts, polar research stations or ___.', 'spacecraft', 'Абзац D.'),
        ]),
      ],
    },
  ]);
})();
