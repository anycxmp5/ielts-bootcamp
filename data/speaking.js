/* Speaking: Part 1 (темы), Part 2 + Part 3 (карточки) */
(function () {
  'use strict';
  const IE = window.IE;
  const p1 = (id, title, ru, qs, sample) => IE.speakingTasks.push({ id: 'p1-' + id, part: 1, title, ru, qs, sample });
  const p2 = (id, title, ru, topic, bullets, part3, sample) => IE.speakingTasks.push({ id: 'p2-' + id, part: 2, title, ru, topic, bullets, part3, sample });

  p1('hometown', 'Hometown', 'Родной город', ['Where is your hometown?', 'What do you like most about it?', 'Has your hometown changed much in recent years?', 'Would you like to live there in the future?', 'What is the best time of year to visit?'],
    'I come from a medium-sized city on the coast. What I like most is the atmosphere: it is lively in summer, but never too crowded, and everything is within easy reach. Having said that, I would not mind living somewhere bigger for a while.');
  p1('work', 'Work and studies', 'Работа и учёба', ['Do you work or are you a student?', 'Why did you choose that job or subject?', 'What do you find most difficult about it?', 'Do you prefer working alone or in a team?', 'What would your ideal job be?'],
    'I am studying economics. I chose it because I have always been fascinated by how markets work, and I think it opens up many career options. The most demanding part is probably the maths, but I find it rewarding once I understand a concept.');
  p1('home', 'Home', 'Дом', ['Do you live in a house or a flat?', 'What is your favourite room?', 'How long have you lived there?', 'Would you like to change anything about your home?', 'What is the neighbourhood like?'],
    'I live in a flat on the fifth floor. My favourite room is the kitchen, because that is where the whole family gathers in the evening. If I could change one thing, I would add a balcony so that I could enjoy fresh air while studying.');
  p1('hobbies', 'Hobbies and free time', 'Хобби', ['What do you like to do in your free time?', 'Have your hobbies changed since you were a child?', 'Do you prefer to relax at home or go out?', 'Is there a new hobby you would like to try?', 'Do you think hobbies are important?'],
    'In my spare time I enjoy cycling and photography, and I often combine the two. When I was younger I mostly played computer games, but I have gradually become more interested in activities that get me outdoors.');
  p1('food', 'Food and cooking', 'Еда и готовка', ['What is your favourite food?', 'Do you often cook?', 'Do you prefer eating at home or in restaurants?', 'Are there any foods you dislike?', 'Has your diet changed over the years?'],
    'My favourite food is definitely pasta, since there are so many ways to prepare it. I cook a few times a week, mostly simple dishes, because I am not very patient in the kitchen, although I am trying to learn more recipes.');
  p1('weather', 'Weather', 'Погода', ['What is the weather like in your country?', 'What is your favourite season?', 'Does the weather affect your mood?', 'What do you do on rainy days?', 'Do you check the forecast every day?'],
    'We have four distinct seasons, with cold winters and warm summers. My favourite is autumn, when the temperature is mild and the trees change colour. I must admit that grey, rainy weather tends to make me a bit sleepy.');
  p1('technology', 'Technology', 'Технологии', ['How often do you use your phone?', 'Which apps do you use most?', 'Do you think people rely too much on technology?', 'What technology do you find most useful?', 'Do you prefer reading on paper or on a screen?'],
    'I use my phone constantly, mainly for messaging and for studying. I would say that people do rely on technology too heavily; for instance, many of us can no longer remember phone numbers, which would have been unthinkable twenty years ago.');
  p1('travel', 'Travel', 'Путешествия', ['Do you enjoy travelling?', 'Where did you go on your last trip?', 'Do you prefer travelling alone or with others?', 'What is the most beautiful place you have visited?', 'Where would you like to go next?'],
    'I love travelling because it exposes me to different cultures. On my last trip I visited a small mountain village, which was incredibly peaceful. I generally prefer to travel with friends, as sharing experiences makes them more memorable.');
  p1('music', 'Music', 'Музыка', ['What kind of music do you like?', 'Do you play any instrument?', 'When do you usually listen to music?', 'Has your taste in music changed?', 'Do you enjoy going to concerts?'],
    'I listen to a bit of everything, but mostly indie and electronic music. I used to play the guitar as a teenager, although I have not practised for years. Music helps me concentrate, so I usually put it on while I am studying.');
  p1('routine', 'Daily routine', 'Распорядок дня', ['What time do you usually get up?', 'Which part of the day do you like best?', 'Do you have a regular routine?', 'Do you ever change your routine?', 'Are you a morning person?'],
    'I normally get up at around seven and have a quick breakfast before heading out. I enjoy the evenings most, since that is when I have time for myself. I would not call myself a morning person; it takes me a while to wake up properly.');

  p2('person', 'A teacher who influenced you', 'Учитель, повлиявший на вас', 'Describe a teacher who has influenced you.',
    ['who the teacher was', 'what subject they taught', 'what they were like', 'and explain how they influenced you'],
    ['Why do some teachers inspire students more than others?', 'How has the role of teachers changed with technology?', 'Should teachers be paid more? Why?', 'Is it better to be taught by one teacher or several?'],
    'I would like to talk about my English teacher at secondary school, Mrs Brown. She taught us for three years, and she was the first person who made me enjoy learning a language. She was patient but demanding, and she always found a way to make lessons fun, for example by asking us to act out short scenes. What impressed me most was that she believed in every student. Thanks to her, I stopped being afraid of making mistakes, and that is largely why I am preparing for IELTS today.');
  p2('place', 'A place you would like to visit', 'Место, которое хотите посетить', 'Describe a place you would like to visit in the future.',
    ['where it is', 'how you learnt about it', 'what you would do there', 'and explain why you want to go there'],
    ['Why do people like to visit places far away from home?', 'Does tourism help or harm local communities?', 'How might travel change in the future?', 'Is it better to plan trips carefully or to be spontaneous?'],
    'I have always dreamed of visiting Iceland. I first learnt about it from a documentary on volcanoes and glaciers. If I went, I would hire a car and drive around the coast, stopping at waterfalls and hot springs. I would also try to see the northern lights. The main reason I want to go is that the landscapes look completely different from anything I have seen, and I think it would be a truly unforgettable experience.');
  p2('object', 'An important possession', 'Важная вещь', 'Describe an object that is important to you.',
    ['what it is', 'how long you have had it', 'how you use it', 'and explain why it is important to you'],
    ['Why do people keep objects with sentimental value?', 'Are people today more materialistic than in the past?', 'How do advertisements influence what people buy?', 'Do you think people should repair things instead of replacing them?'],
    'The object I want to describe is an old wristwatch that my grandfather gave me when I turned eighteen. I have had it for about six years, and I wear it on special occasions. It is not expensive, but it is important to me because it reminds me of him and of the stories he used to tell. Whenever I look at it, I feel a connection with my family.');
  p2('event', 'A memorable event', 'Запоминающееся событие', 'Describe a memorable event in your life.',
    ['what the event was', 'when and where it happened', 'who was with you', 'and explain why it was memorable'],
    ['Why do people celebrate important events?', 'Are traditional celebrations losing importance?', 'How do you think celebrations will change in the future?', 'Is it better to celebrate with family or with friends?']);
  p2('skill', 'A skill you learnt', 'Навык, которому вы научились', 'Describe a skill you learnt that you find useful.',
    ['what the skill is', 'how you learnt it', 'how long it took', 'and explain why it is useful'],
    ['Which skills are most important for young people today?', 'Should schools teach practical skills such as cooking?', 'Is it easier for children to learn new skills than adults?', 'How can technology help people learn?']);
  p2('book', 'A book or film', 'Книга или фильм', 'Describe a book or film that you enjoyed.',
    ['what it was about', 'when you read or watched it', 'who recommended it', 'and explain why you enjoyed it'],
    ['Why are some stories popular across different cultures?', 'Do people read less than before?', 'Is it better to read the book or watch the film?', 'How do books and films influence people’s opinions?']);
  p2('help', 'Someone who helped you', 'Человек, который вам помог', 'Describe a time when someone helped you.',
    ['who helped you', 'what the problem was', 'how they helped', 'and explain how you felt afterwards'],
    ['Why do people help strangers?', 'Should helping others be taught at school?', 'Do people help each other less in big cities?', 'What is the role of volunteers in society?']);
  p2('gadget', 'A useful gadget', 'Полезное устройство', 'Describe a piece of technology that you use often.',
    ['what it is', 'when you got it', 'what you use it for', 'and explain why it is useful to you'],
    ['How has technology changed daily life?', 'Do you think children spend too much time on screens?', 'What are the dangers of depending on technology?', 'Which invention will be most important in the future?']);

  IE.PHRASES = {
    start: ['Well, let me think…', 'That’s an interesting question.', 'To be honest, …'],
    extend: ['The main reason is that…', 'For example, …', 'What I mean is…', 'Another point is that…'],
    opinion: ['In my view, …', 'As far as I’m concerned, …', 'I tend to think that…'],
    time: ['Let me think about it for a moment.', 'How can I put it?', 'What I’m trying to say is…'],
  };
})();
