// Birthday Wishes and Motivation Tips Data for Age Calculator

export interface BirthdayWishes {
  present: { en: string[]; te: string[] };
  advance: { en: string[]; te: string[] };
  belated: { en: string[]; te: string[] };
}

export interface MotivationTips {
  child: { en: string[]; te: string[] };
  young: { en: string[]; te: string[] };
  adult: { en: string[]; te: string[] };
  senior: { en: string[]; te: string[] };
}

export const birthdayWishes: BirthdayWishes = {
  present: {
    en: [
      "🎂 Happy Birthday! May your life be full of success, happiness, and endless blessings!",
      "🎉 Wishing you health, wealth, joy, and all the happiness in the world on your special day!",
      "🌟 Happy Birthday! May this year bring you closer to all your dreams and goals!",
      "🎈 On this wonderful day, may you be blessed with love, laughter, and beautiful memories!",
      "✨ Happy Birthday! May your path be filled with sunshine and your heart with happiness!",
      "🎁 Today is your day! Celebrate it with joy and make unforgettable memories!",
      "💖 Happy Birthday! May you be surrounded by love and warmth today and always!",
      "🌈 Wishing you a birthday as wonderful and unique as you are!",
    ],
    te: [
      "🎂 పుట్టినరోజు శుభాకాంక్షలు! మీ జీవితంలో విజయం, సంతోషం మరియు అనంతమైన ఆశీర్వాదాలు నిండాలి!",
      "🎉 ఆరోగ్యం, సంపద, ఆనందం మీకు ఎల్లప్పుడూ ఉండాలని శుభాకాంక్షలు!",
      "🌟 పుట్టినరోజు శుభాకాంక్షలు! ఈ సంవత్సరం మీ అన్ని కలలు మరియు లక్ష్యాలను సాధించాలి!",
      "🎈 ఈ అద్భుతమైన రోజున, మీరు ప్రేమ, నవ్వు మరియు అందమైన జ్ఞాపకాలతో ఆశీర్వదించబడాలి!",
      "✨ పుట్టినరోజు శుభాకాంక్షలు! మీ మార్గం సూర్యకాంతితో నిండి, మీ హృదయం ఆనందంతో నిండాలి!",
      "🎁 ఈ రోజు మీ రోజు! దీన్ని ఆనందంతో జరుపుకుని, మరచిపోలేని జ్ఞాపకాలు సృష్టించుకోండి!",
      "💖 పుట్టినరోజు శుభాకాంక్షలు! మీరు ఈ రోజు మరియు ఎల్లప్పుడూ ప్రేమ మరియు వెచ్చదనంతో చుట్టుముట్టబడాలి!",
      "🌈 మీలాగే అద్భుతమైన మరియు ప్రత్యేకమైన పుట్టినరోజు శుభాకాంక్షలు!",
    ],
  },
  advance: {
    en: [
      "🎊 Advance Happy Birthday! Your special day is coming soon, get ready to celebrate!",
      "🌟 Wishing you an early Happy Birthday! May your upcoming birthday be fantastic!",
      "🎈 Advance Birthday Wishes! Just a few more days until your celebration!",
      "✨ Sending advance birthday wishes your way! May your day be amazing!",
      "🎁 Your birthday is approaching! Advance Happy Birthday with lots of love!",
      "💫 Counting down to your special day! Advance Happy Birthday!",
      "🎂 Get ready for an amazing birthday! Sending advance wishes your way!",
      "🌈 Advance Happy Birthday! May your upcoming year be filled with joy!",
    ],
    te: [
      "🎊 ముందస్తు పుట్టినరోజు శుభాకాంక్షలు! మీ ప్రత్యేక రోజు త్వరలో రాబోతోంది, వేడుకలకు సిద్ధంగా ఉండండి!",
      "🌟 ముందస్తు పుట్టినరోజు శుభాకాంక్షలు! మీ రాబోయే పుట్టినరోజు అద్భుతంగా ఉండాలి!",
      "🎈 ముందస్తు పుట్టినరోజు శుభాకాంక్షలు! మీ వేడుకకు ఇంకా కొన్ని రోజులు మాత్రమే!",
      "✨ మీకు ముందస్తు పుట్టినరోజు శుభాకాంక్షలు పంపుతున్నాను! మీ రోజు అద్భుతంగా ఉండాలి!",
      "🎁 మీ పుట్టినరోజు దగ్గరపడుతోంది! ప్రేమతో ముందస్తు పుట్టినరోజు శుభాకాంక్షలు!",
      "💫 మీ ప్రత్యేక రోజుకు కౌంట్‌డౌన్! ముందస్తు పుట్టినరోజు శుభాకాంక్షలు!",
      "🎂 అద్భుతమైన పుట్టినరోజుకు సిద్ధంగా ఉండండి! ముందస్తు శుభాకాంక్షలు పంపుతున్నాను!",
      "🌈 ముందస్తు పుట్టినరోజు శుభాకాంక్షలు! మీ రాబోయే సంవత్సరం ఆనందంతో నిండాలి!",
    ],
  },
  belated: {
    en: [
      "🎂 Belated Happy Birthday! Sorry I'm late, but my wishes are just as heartfelt!",
      "💖 Late but heartfelt birthday wishes! May your year be wonderful!",
      "🌟 Belated Happy Birthday! Hope your day was as special as you are!",
      "🎈 Better late than never! Belated Happy Birthday with lots of love!",
      "✨ Oops, I missed your day! Belated Happy Birthday! Have a great year ahead!",
      "🎁 Sending belated birthday wishes! May happiness follow you always!",
      "💫 Belated Birthday Greetings! Hope you had an amazing celebration!",
      "🌈 A little late, but here's wishing you a fantastic year ahead!",
    ],
    te: [
      "🎂 ఆలస్యమైన పుట్టినరోజు శుభాకాంక్షలు! నేను ఆలస్యం అయినందుకు క్షమించండి, కానీ నా శుభాకాంక్షలు హృదయపూర్వకమైనవే!",
      "💖 ఆలస్యమైనా హృదయపూర్వక పుట్టినరోజు శుభాకాంక్షలు! మీ సంవత్సరం అద్భుతంగా ఉండాలి!",
      "🌟 ఆలస్యమైన పుట్టినరోజు శుభాకాంక్షలు! మీ రోజు మీలాగే ప్రత్యేకంగా ఉండి ఉంటుందని ఆశిస్తున్నాను!",
      "🎈 ఆలస్యమైనా మంచిదే! ప్రేమతో ఆలస్యమైన పుట్టినరోజు శుభాకాంక్షలు!",
      "✨ అయ్యో, నేను మీ రోజును మిస్ అయ్యాను! ఆలస్యమైన పుట్టినరోజు శుభాకాంక్షలు! మంచి సంవత్సరం కావాలి!",
      "🎁 ఆలస్యమైన పుట్టినరోజు శుభాకాంక్షలు పంపుతున్నాను! మీకు ఎల్లప్పుడూ ఆనందం ఉండాలి!",
      "💫 ఆలస్యమైన పుట్టినరోజు అభినందనలు! మీ వేడుక అద్భుతంగా జరిగి ఉంటుందని ఆశిస్తున్నాను!",
      "🌈 కొంచెం ఆలస్యం, కానీ మీకు అద్భుతమైన సంవత్సరం కావాలని కోరుతున్నాను!",
    ],
  },
};

export const motivationTips: MotivationTips = {
  child: {
    en: [
      "🌟 Dream big and learn new skills every day! The world is full of amazing things to discover!",
      "📚 Study hard, play harder! Your childhood is the foundation of your future success!",
      "🎨 Be creative and curious! Ask questions and never stop exploring!",
      "🦸 You can be anything you want! Believe in yourself and your abilities!",
      "🌈 Make good friends, be kind to everyone, and enjoy every moment of growing up!",
      "🎯 Set small goals and achieve them! Every step counts towards your big dreams!",
      "💪 Stay active, eat healthy, and keep your mind sharp! A healthy body means a healthy mind!",
    ],
    te: [
      "🌟 పెద్దగా కలలు కండి మరియు ప్రతిరోజూ కొత్త నైపుణ్యాలు నేర్చుకోండి! ప్రపంచం కనుగొనడానికి అద్భుతమైన విషయాలతో నిండి ఉంది!",
      "📚 కష్టపడి చదువుకోండి, ఎక్కువగా ఆడుకోండి! మీ బాల్యం మీ భవిష్యత్తు విజయానికి పునాది!",
      "🎨 సృజనాత్మకంగా మరియు ఉత్సుకతతో ఉండండి! ప్రశ్నలు అడగండి మరియు అన్వేషించడం ఆపకండి!",
      "🦸 మీరు కావాలనుకున్నదేదైనా కావచ్చు! మీపై మరియు మీ సామర్థ్యాలపై నమ్మకం ఉంచండి!",
      "🌈 మంచి స్నేహితులను సంపాదించుకోండి, అందరిపట్ల దయగా ఉండండి, మరియు పెరగడంలో ప్రతి క్షణాన్ని ఆనందించండి!",
      "🎯 చిన్న లక్ష్యాలను నిర్దేశించుకుని వాటిని సాధించండి! మీ పెద్ద కలల వైపు ప్రతి అడుగు ముఖ్యమైనది!",
      "💪 చురుకుగా ఉండండి, ఆరోగ్యంగా తినండి, మరియు మీ మనసును పదునుగా ఉంచండి!",
    ],
  },
  young: {
    en: [
      "💼 Build your career with passion and dedication! This is your time to shine!",
      "💰 Start saving and investing early! Financial wisdom now means freedom later!",
      "🎓 Never stop learning! Acquire new skills and stay ahead in your field!",
      "❤️ Nurture meaningful relationships! True connections matter more than numbers!",
      "🏃 Take care of your health! Good habits now will benefit you for life!",
      "🌍 Travel, explore, and experience different cultures! Broaden your horizons!",
      "💡 Take calculated risks! Your 20s and 30s are perfect for bold moves!",
      "🧘 Balance work and life! Mental health is just as important as career success!",
    ],
    te: [
      "💼 మీ కెరీర్‌ను అభిరుచి మరియు అంకితభావంతో నిర్మించుకోండి! ఇది మీరు ప్రకాశించే సమయం!",
      "💰 ముందుగానే పొదుపు చేయడం మరియు పెట్టుబడి పెట్టడం ప్రారంభించండి! ఇప్పుడు ఆర్థిక జ్ఞానం అంటే తరువాత స్వాతంత్ర్యం!",
      "🎓 నేర్చుకోవడం ఎప్పుడూ ఆపకండి! కొత్త నైపుణ్యాలు సంపాదించి మీ రంగంలో ముందుండండి!",
      "❤️ అర్థవంతమైన సంబంధాలను పెంపొందించుకోండి! నిజమైన కనెక్షన్లు సంఖ్యల కంటే ముఖ్యమైనవి!",
      "🏃 మీ ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి! ఇప్పుడు మంచి అలవాట్లు జీవితకాలం మీకు ప్రయోజనం చేకూరుస్తాయి!",
      "🌍 ప్రయాణించండి, అన్వేషించండి, మరియు విభిన్న సంస్కృతులను అనుభవించండి! మీ దృష్టికోణాలను విస్తరించండి!",
      "💡 లెక్కించిన రిస్క్‌లు తీసుకోండి! మీ 20లు మరియు 30లు సాహసోపేతమైన చర్యలకు అనువైనవి!",
      "🧘 పని మరియు జీవితాన్ని సమతుల్యం చేయండి! మానసిక ఆరోగ్యం కెరీర్ విజయం అంత ముఖ్యమైనది!",
    ],
  },
  adult: {
    en: [
      "👨‍👩‍👧 Focus on family and build lasting memories! Time with loved ones is priceless!",
      "📈 Make smart investments for your future and your children's future!",
      "🏠 Secure your assets and plan for retirement! It's never too early to prepare!",
      "🤝 Mentor the younger generation! Your experience is valuable!",
      "⚖️ Find work-life balance! Your health and happiness matter most!",
      "🎯 Set new goals! Life doesn't stop exciting at any age!",
      "💪 Stay physically active! Regular exercise keeps you young at heart!",
      "📖 Continue growing! Read, learn, and embrace new challenges!",
    ],
    te: [
      "👨‍👩‍👧 కుటుంబంపై దృష్టి పెట్టి శాశ్వత జ్ఞాపకాలను నిర్మించుకోండి! ప్రియమైన వారితో గడిపే సమయం అమూల్యమైనది!",
      "📈 మీ భవిష్యత్తు మరియు మీ పిల్లల భవిష్యత్తు కోసం తెలివైన పెట్టుబడులు చేయండి!",
      "🏠 మీ ఆస్తులను భద్రపరచండి మరియు పదవీ విరమణ కోసం ప్లాన్ చేయండి! సిద్ధం కావడానికి ఎప్పుడూ ముందే మంచిది!",
      "🤝 యువతరానికి మార్గదర్శకత్వం వహించండి! మీ అనుభవం విలువైనది!",
      "⚖️ పని-జీవిత సమతుల్యతను కనుగొనండి! మీ ఆరోగ్యం మరియు ఆనందం అత్యంత ముఖ్యమైనవి!",
      "🎯 కొత్త లక్ష్యాలను నిర్దేశించుకోండి! జీవితం ఏ వయస్సులోనూ ఉత్తేజకరంగా ఆగదు!",
      "💪 శారీరకంగా చురుకుగా ఉండండి! క్రమం తప్పకుండా వ్యాయామం మిమ్మల్ని యువకంగా ఉంచుతుంది!",
      "📖 పెరుగుతూ ఉండండి! చదవండి, నేర్చుకోండి, మరియు కొత్త సవాళ్లను స్వీకరించండి!",
    ],
  },
  senior: {
    en: [
      "🌟 Enjoy life and share your wisdom! You've earned this beautiful phase of life!",
      "👨‍👩‍👧‍👦 Spend quality time with grandchildren! Your stories and love are treasures!",
      "🎨 Pursue hobbies you've always wanted! Now is the perfect time!",
      "🧘 Practice mindfulness and stay spiritually connected! Inner peace brings joy!",
      "🏥 Prioritize your health! Regular checkups and a healthy lifestyle are key!",
      "✈️ Travel and explore! Age is just a number for adventurous souls!",
      "📝 Write your memoirs! Your life story can inspire future generations!",
      "💝 Stay socially active! Connections with friends and community enrich life!",
    ],
    te: [
      "🌟 జీవితాన్ని ఆస్వాదించండి మరియు మీ జ్ఞానాన్ని పంచుకోండి! జీవితంలోని ఈ అందమైన దశను మీరు సంపాదించారు!",
      "👨‍👩‍👧‍👦 మనవలు మనవరాళ్ళతో నాణ్యమైన సమయాన్ని గడపండి! మీ కథలు మరియు ప్రేమ నిధులు!",
      "🎨 మీరు ఎల్లప్పుడూ కోరుకున్న హాబీలను అనుసరించండి! ఇప్పుడు సరైన సమయం!",
      "🧘 మైండ్‌ఫుల్‌నెస్ అభ్యసించండి మరియు ఆధ్యాత్మికంగా అనుసంధానమై ఉండండి! అంతర్గత శాంతి ఆనందాన్ని తెస్తుంది!",
      "🏥 మీ ఆరోగ్యానికి ప్రాధాన్యత ఇవ్వండి! క్రమమైన చెకప్‌లు మరియు ఆరోగ్యకరమైన జీవనశైలి కీలకం!",
      "✈️ ప్రయాణించండి మరియు అన్వేషించండి! సాహసికుల ఆత్మలకు వయస్సు కేవలం ఒక సంఖ్య!",
      "📝 మీ జ్ఞాపకాలను రాయండి! మీ జీవిత కథ భవిష్యత్తు తరాలకు స్ఫూర్తినిస్తుంది!",
      "💝 సామాజికంగా చురుకుగా ఉండండి! స్నేహితులు మరియు సమాజంతో కనెక్షన్లు జీవితాన్ని సుసంపన్నం చేస్తాయి!",
    ],
  },
};

// Helper function to get random item from array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get birthday type based on days until birthday
export function getBirthdayType(daysUntilBirthday: number): "present" | "advance" | "belated" | null {
  if (daysUntilBirthday === 0) {
    return "present";
  } else if (daysUntilBirthday > 0 && daysUntilBirthday <= 7) {
    return "advance";
  } else if (daysUntilBirthday >= 358) {
    // Birthday was within the last 7 days
    return "belated";
  }
  return null;
}

// Get age group for motivation tips
export function getAgeGroup(years: number): "child" | "young" | "adult" | "senior" {
  if (years < 18) {
    return "child";
  } else if (years >= 18 && years < 30) {
    return "young";
  } else if (years >= 30 && years < 50) {
    return "adult";
  } else {
    return "senior";
  }
}

// Get birthday wish for display
export function getBirthdayWish(
  daysUntilBirthday: number,
  language: "en" | "te"
): { type: "present" | "advance" | "belated"; wish: string } | null {
  const type = getBirthdayType(daysUntilBirthday);
  if (!type) return null;
  
  const wishes = birthdayWishes[type][language];
  return {
    type,
    wish: getRandomItem(wishes),
  };
}

// Get motivation tip for display
export function getMotivationTip(years: number, language: "en" | "te"): string {
  const ageGroup = getAgeGroup(years);
  const tips = motivationTips[ageGroup][language];
  return getRandomItem(tips);
}
