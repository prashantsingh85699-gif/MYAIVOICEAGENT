const express = require('express');
const router = express.Router();
const aiCoach = require('../services/aiCoach');
const murfTTS = require('../services/murfTTS');

router.get('/categories', (req, res) => {
  res.json({ categories: ['sleep', 'hydration', 'activity', 'nutrition', 'mindfulness', 'recovery', 'focus', 'mood'] });
});

router.get('/programme', (req, res) => {
  res.json({ message: "Welcome to the VitalVoice Programme. Select a category to begin." });
});

router.post('/checkin', async (req, res) => {
  try {
    const { category, text, language, history } = req.body;
    
    const userMessage = text || `I want to focus on my ${category} today.`;
    console.log('[DEBUG] Received User Message:', userMessage);
    console.log('[DEBUG] Target Language:', language);

    // 1. Get coach text from LLM
    const aiText = await aiCoach.generateCoachingResponse(userMessage, history || [], language || 'en-US');
    console.log('[DEBUG] AI Generated Text:', aiText);

    // 2. Transcribe to base64 audio
    const ttsData = await murfTTS.generateSpeech(aiText, language || 'en-US');
    
    // Log full Murf response so we can see the actual field names
    console.log('[Murf TTS Response Keys]:', Object.keys(ttsData));
    console.log('[Murf TTS audioFile length]:', ttsData.audioFile ? ttsData.audioFile.length : 'NOT FOUND');

    // Try all known field names from different Murf API versions
    const audioBase64 = ttsData.audioFile || ttsData.encodedAudio || ttsData.audio || ttsData.data || null;

    if (!audioBase64) {
      console.warn('[WARN] No audio data returned from Murf TTS. Check API key and Murf response body.');
    }

    res.json({ 
      text: aiText,
      audioBase64 
    });

  } catch (error) {
    console.error('Checkin Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
