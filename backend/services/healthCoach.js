// 8 Wellness Categories with 3 short scripts each
const scripts = {
  sleep: [
    "Rest is crucial. Let's aim for 8 hours tonight. Unplug from screens an hour before bed.",
    "Quality sleep repairs your body. Try a relaxing tea before sleeping tonight.",
    "If you're waking up tired, we might need to adjust your circadian rhythm. Let's try some morning sunlight."
  ],
  hydration: [
    "Water is the essence of life! Are you hitting your 8 glasses today?",
    "Staying hydrated keeps your energy levels stable. Go grab a glass of water right now!",
    "Remember to drink water before you feel thirsty. It helps with focus and metabolism."
  ],
  activity: [
    "A 30-minute walk can completely change your mood. Let's get moving today!",
    "Consistency beats intensity. Just 15 minutes of stretching is a great win.",
    "Your body is designed to move. What kind of physical activity sounds fun today?"
  ],
  nutrition: [
    "Fuel your body with whole foods today. Lots of colors on your plate!",
    "Protein is key for recovery. Make sure you're getting enough in your meals.",
    "Listen to your hunger cues. Eat when you're hungry, stop when you're comfortably full."
  ],
  mindfulness: [
    "Take three deep breaths with me. Inhale... and exhale. Great job.",
    "Stress happens, but you control your reaction. Let's practice gratitude today.",
    "A five-minute meditation can reset your entire nervous system."
  ],
  recovery: [
    "Rest days are just as important as workout days. Your muscles need time to heal.",
    "Have you tried foam rolling? It can really help with that muscle soreness.",
    "Active recovery like light yoga keeps the blood flowing without overtaxing your system."
  ],
  focus: [
    "Break your work into 25-minute sprints. You'll be amazed at your productivity.",
    "Minimize distractions. Put the phone in another room while you tackle your biggest task.",
    "Clear space, clear mind. Let's tidy up your workspace before diving in."
  ],
  mood: [
    "It's okay to have off days. Be gentle with yourself today.",
    "Joy is a practice. Let's try to find one small thing that makes you smile today.",
    "Connecting with others boosts our mood. Consider calling a friend or family member."
  ]
};

const getCategories = () => Object.keys(scripts);

const generateResponse = (category) => {
  const defaultResp = "I'm here to support your health journey! Keep pushing forward.";
  if (!scripts[category]) return defaultResp;
  
  const options = scripts[category];
  return options[Math.floor(Math.random() * options.length)];
};

module.exports = {
  getCategories,
  generateResponse
};
