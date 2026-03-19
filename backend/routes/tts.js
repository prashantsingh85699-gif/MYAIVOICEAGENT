const express = require('express');
const router = express.Router();
const murfTTS = require('../services/murfTTS');

router.get('/voices', async (req, res) => {
  try {
    const voices = await murfTTS.getAvailableVoices();
    res.json(voices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Text and voiceId are required' });
    }
    const audioData = await murfTTS.generateSpeech(text, voiceId);
    res.json(audioData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
