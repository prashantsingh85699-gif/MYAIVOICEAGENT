const axios = require('axios');

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const generateCoachingResponse = async (userMessage, chatHistory = [], language = 'en-US') => {
  try {
    // Check if Mistral key is present
    if (!MISTRAL_API_KEY || MISTRAL_API_KEY.includes('***') || MISTRAL_API_KEY.startsWith('PASTE_')) {
      console.warn('MISTRAL_API_KEY not found. Please provide a key for real AI intelligence.');
      return "I'm currently in demo mode. Please provide a Mistral API key for full AI coaching capabilities!";
    }

    const targetLang = (language === 'hi-IN') ? 'Hindi' : 'English';

    const messages = [
      { 
        role: "system", 
        content: `You are Misty, a warm, cheerful, and empathetic medical friend.
        1. Tone: Extremely friendly and optimistic. Use a cheerful, 'laughing' style.
        2. Emojis: Use friendly emojis (😊, ✨, ✨, 🩺).
        3. Compliance: ALWAYS respond ONLY IN ${targetLang.toUpperCase()}. 
           - If Hindi (HI), use ONLY Devanagari script (e.g. नमस्ते, not Namaste).
        4. Simplicity: Translate jargon into simple terms.
        5. Structure: Start with a warm greeting in the target script (e.g. 'Hey there!' for EN, 'नमस्ते दोस्त!' for HI).` 
      },
      ...chatHistory,
      { role: "user", content: userMessage }
    ];

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: "mistral-tiny", // Or mistral-small/medium based on user plan
        messages,
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Mistral API Error:', error.response?.data || error.message);
    return "I'm having trouble connecting to my medical brain right now. Please check your API key.";
  }
};

module.exports = {
  generateCoachingResponse
};

module.exports = {
  generateCoachingResponse
};
