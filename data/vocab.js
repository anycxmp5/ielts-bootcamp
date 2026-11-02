/* Словарь по темам: [слово, часть речи, перевод, пример] */
(function () {
  'use strict';
  const T = (id, title, ru, words) => window.IE.vocab.push({ id, title, ru, words: words.map((w) => ({ w: w[0], pos: w[1], ru: w[2], ex: w[3], topic: id })) });

  T('env', 'Environment', 'Окружающая среда', [
    ['pollution', 'n', 'загрязнение', 'Air pollution is a serious problem in big cities.'],
    ['sustainable', 'adj', 'устойчивый', 'We need more sustainable sources of energy.'],
    ['renewable', 'adj', 'возобновляемый', 'Wind is a renewable resource.'],
    ['emissions', 'n', 'выбросы', 'The government wants to cut carbon emissions.'],
    ['endangered', 'adj', 'находящийся под угрозой', 'The tiger is an endangered species.'],
    ['deforestation', 'n', 'вырубка лесов', 'Deforestation destroys the habitat of many animals.'],
    ['conservation', 'n', 'охрана природы', 'Conservation projects protect rare plants.'],
    ['landfill', 'n', 'свалка', 'Most household waste ends up in landfill.'],
    ['greenhouse effect', 'n', 'парниковый эффект', 'The greenhouse effect causes global warming.'],
    ['biodiversity', 'n', 'биоразнообразие', 'Biodiversity is declining in many regions.'],
  ]);
  T('edu', 'Education', 'Образование', [
    ['curriculum', 'n', 'учебная программа', 'The school curriculum includes two foreign languages.'],
    ['tuition fees', 'n', 'плата за обучение', 'Tuition fees have risen sharply.'],
    ['literacy', 'n', 'грамотность', 'Adult literacy has improved over the decades.'],
    ['compulsory', 'adj', 'обязательный', 'Education is compulsory until the age of sixteen.'],
    ['vocational', 'adj', 'профессиональный', 'Vocational courses prepare students for specific jobs.'],
    ['scholarship', 'n', 'стипендия', 'She won a scholarship to study abroad.'],
    ['undergraduate', 'n', 'студент бакалавриата', 'Most undergraduates live on campus.'],
    ['assignment', 'n', 'задание', 'The assignment must be submitted on Friday.'],
    ['plagiarism', 'n', 'плагиат', 'Plagiarism is treated very seriously.'],
    ['peer pressure', 'n', 'давление сверстников', 'Teenagers often suffer from peer pressure.'],
  ]);
  T('tech', 'Technology', 'Технологии', [
    ['breakthrough', 'n', 'прорыв', 'Scientists announced a major breakthrough in medicine.'],
    ['innovation', 'n', 'инновация', 'Innovation drives economic growth.'],
    ['automation', 'n', 'автоматизация', 'Automation has replaced many factory jobs.'],
    ['obsolete', 'adj', 'устаревший', 'Typewriters became obsolete in the 1990s.'],
    ['cutting-edge', 'adj', 'передовой', 'The lab uses cutting-edge equipment.'],
    ['artificial intelligence', 'n', 'искусственный интеллект', 'Artificial intelligence can analyse huge amounts of data.'],
    ['privacy', 'n', 'конфиденциальность', 'Online privacy is a growing concern.'],
    ['addictive', 'adj', 'вызывающий зависимость', 'Some games are highly addictive.'],
    ['digital divide', 'n', 'цифровое неравенство', 'The digital divide separates rich and poor regions.'],
    ['upgrade', 'v', 'обновлять', 'I need to upgrade my computer.'],
  ]);
  T('health', 'Health', 'Здоровье', [
    ['sedentary', 'adj', 'малоподвижный', 'A sedentary lifestyle increases health risks.'],
    ['obesity', 'n', 'ожирение', 'Obesity rates are rising among children.'],
    ['balanced diet', 'n', 'сбалансированное питание', 'A balanced diet includes fruit and vegetables.'],
    ['chronic', 'adj', 'хронический', 'He suffers from a chronic illness.'],
    ['preventive', 'adj', 'профилактический', 'Preventive care reduces hospital costs.'],
    ['life expectancy', 'n', 'продолжительность жизни', 'Life expectancy has increased significantly.'],
    ['well-being', 'n', 'благополучие', 'Exercise improves mental well-being.'],
    ['epidemic', 'n', 'эпидемия', 'The epidemic spread rapidly.'],
    ['vaccination', 'n', 'вакцинация', 'Vaccination protects the whole community.'],
    ['stress', 'n', 'стресс', 'Too much stress can damage your health.'],
  ]);
  T('work', 'Work and careers', 'Работа и карьера', [
    ['workforce', 'n', 'рабочая сила', 'The workforce is getting older.'],
    ['unemployment', 'n', 'безработица', 'Youth unemployment remains high.'],
    ['promotion', 'n', 'повышение', 'She got a promotion after two years.'],
    ['flexible hours', 'n', 'гибкий график', 'Flexible hours help parents balance work and family.'],
    ['colleague', 'n', 'коллега', 'My colleagues are very supportive.'],
    ['salary', 'n', 'зарплата', 'The salary depends on experience.'],
    ['qualification', 'n', 'квалификация', 'A degree is the minimum qualification.'],
    ['deadline', 'n', 'крайний срок', 'We must meet the deadline.'],
    ['redundancy', 'n', 'сокращение (увольнение)', 'Hundreds of workers faced redundancy.'],
    ['work-life balance', 'n', 'баланс работы и жизни', 'A good work-life balance is essential.'],
  ]);
  T('crime', 'Crime and law', 'Преступность и закон', [
    ['offender', 'n', 'правонарушитель', 'First-time offenders often receive lighter sentences.'],
    ['deter', 'v', 'удерживать, отпугивать', 'Cameras deter thieves.'],
    ['rehabilitation', 'n', 'реабилитация', 'Rehabilitation helps prisoners find work.'],
    ['sentence', 'n', 'приговор', 'He received a five-year sentence.'],
    ['penalty', 'n', 'наказание', 'The penalty for speeding is a fine.'],
    ['witness', 'n', 'свидетель', 'A witness described the robbery.'],
    ['fraud', 'n', 'мошенничество', 'Online fraud is on the rise.'],
    ['law-abiding', 'adj', 'законопослушный', 'Most citizens are law-abiding.'],
    ['community service', 'n', 'общественные работы', 'He was ordered to do community service.'],
    ['reoffend', 'v', 'совершить повторное преступление', 'Many prisoners reoffend after release.'],
  ]);
  T('media', 'Media', 'СМИ', [
    ['broadcast', 'v', 'транслировать', 'The match will be broadcast live.'],
    ['circulation', 'n', 'тираж', 'The newspaper has a circulation of one million.'],
    ['biased', 'adj', 'предвзятый', 'Some reports are biased.'],
    ['headline', 'n', 'заголовок', 'The headline caught my attention.'],
    ['advertisement', 'n', 'реклама', 'Television advertisements target children.'],
    ['censorship', 'n', 'цензура', 'Censorship limits freedom of speech.'],
    ['viral', 'adj', 'вирусный', 'The video went viral overnight.'],
    ['influence', 'v', 'влиять', 'Social media influences young people.'],
    ['journalist', 'n', 'журналист', 'The journalist interviewed the minister.'],
    ['sensational', 'adj', 'сенсационный', 'Tabloids prefer sensational stories.'],
  ]);
  T('travel', 'Travel and tourism', 'Путешествия и туризм', [
    ['itinerary', 'n', 'маршрут', 'Our itinerary includes three cities.'],
    ['sightseeing', 'n', 'осмотр достопримечательностей', 'We spent the day sightseeing.'],
    ['accommodation', 'n', 'жильё', 'Accommodation is expensive in summer.'],
    ['package holiday', 'n', 'организованный тур', 'They booked a package holiday to Spain.'],
    ['off the beaten track', 'idiom', 'вдали от туристических маршрутов', 'We prefer places off the beaten track.'],
    ['landmark', 'n', 'достопримечательность', 'The tower is a famous landmark.'],
    ['overcrowded', 'adj', 'переполненный', 'The beach was overcrowded.'],
    ['souvenir', 'n', 'сувенир', 'I bought a souvenir for my sister.'],
    ['ecotourism', 'n', 'экотуризм', 'Ecotourism protects local nature.'],
    ['delay', 'n', 'задержка', 'There was a two-hour delay at the airport.'],
  ]);
  T('society', 'Society', 'Общество', [
    ['inequality', 'n', 'неравенство', 'Income inequality has grown.'],
    ['urbanisation', 'n', 'урбанизация', 'Urbanisation changes family life.'],
    ['ageing population', 'n', 'стареющее население', 'An ageing population puts pressure on pensions.'],
    ['community', 'n', 'сообщество', 'A strong community supports its members.'],
    ['generation gap', 'n', 'разрыв поколений', 'The generation gap can cause misunderstanding.'],
    ['poverty', 'n', 'бедность', 'Poverty affects children’s education.'],
    ['immigration', 'n', 'иммиграция', 'Immigration brings cultural diversity.'],
    ['tradition', 'n', 'традиция', 'Many traditions are disappearing.'],
    ['volunteer', 'n', 'волонтёр', 'Volunteers help at the shelter.'],
    ['welfare', 'n', 'социальное обеспечение', 'The state provides welfare for the unemployed.'],
  ]);
  T('econ', 'Economy and money', 'Экономика и деньги', [
    ['economic growth', 'n', 'экономический рост', 'Economic growth creates new jobs.'],
    ['inflation', 'n', 'инфляция', 'Inflation reduces the value of savings.'],
    ['budget', 'n', 'бюджет', 'The family has a limited budget.'],
    ['invest', 'v', 'инвестировать', 'They invest in renewable energy.'],
    ['consumer', 'n', 'потребитель', 'Consumers expect lower prices.'],
    ['afford', 'v', 'позволить себе', 'Many young people cannot afford a flat.'],
    ['debt', 'n', 'долг', 'Student debt is a heavy burden.'],
    ['profit', 'n', 'прибыль', 'The company made a large profit.'],
    ['exports', 'n', 'экспорт', 'Exports rose by ten per cent.'],
    ['cost of living', 'n', 'стоимость жизни', 'The cost of living is higher in the capital.'],
  ]);
  T('link', 'Linking words', 'Слова-связки', [
    ['moreover', 'adv', 'более того', 'Moreover, the plan is cheap.'],
    ['nevertheless', 'adv', 'тем не менее', 'It was difficult; nevertheless, she succeeded.'],
    ['whereas', 'conj', 'тогда как', 'Some prefer cities, whereas others choose villages.'],
    ['consequently', 'adv', 'следовательно', 'Prices rose; consequently, demand fell.'],
    ['in contrast', 'adv', 'в отличие', 'In contrast, exports declined.'],
    ['furthermore', 'adv', 'кроме того', 'Furthermore, it saves time.'],
    ['despite', 'prep', 'несмотря на', 'Despite the rain, we went out.'],
    ['as a result', 'adv', 'в результате', 'As a result, many shops closed.'],
    ['on the whole', 'adv', 'в целом', 'On the whole, the results were positive.'],
    ['to illustrate', 'phr', 'для иллюстрации', 'To illustrate, consider the case of Japan.'],
  ]);
})();
