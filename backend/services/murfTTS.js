const axios = require('axios');
require('dotenv').config();

// Base configuration for Murf TTS
const VOICE_CONFIGS = {
  'en-US': { voiceId: 'en-US-alina' }, // Premium high-quality English female
  'hi-IN': { voiceId: 'hi-IN-arushi' }  // Natural Hindi female voice (Common)
};

const generateSpeech = async (text, language = 'en-US') => {
  const apiKey = process.env.MURF_API_KEY;
  if (!apiKey || apiKey.includes('***') || apiKey.startsWith('PASTE_')) {
    console.warn('[Murf TTS] No API Key found, returning mock audio.');
    return { audioFile: 'mock_base64_string', status: 'success' };
  }

  try {
    let config = VOICE_CONFIGS[language] || VOICE_CONFIGS['en-US'];
    let voiceId = config.voiceId;

    console.log(`[Murf TTS] Generating speech in ${language} using voice: ${voiceId}`);

    try {
      const response = await axios.post('https://api.murf.ai/v1/speech/generate', {
        voiceId: voiceId,
        text: text,
        modelVersion: 'GEN2', 
        format: 'MP3',
        sampleRate: 24000,
        encodeAsBase64: true
      }, {
        headers: {
          'api-key': apiKey.trim(),
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (apiError) {
      console.warn(`[Murf TTS] Voice ${voiceId} failed. Falling back to default English voice.`);
      const fallbackResponse = await axios.post('https://api.murf.ai/v1/speech/generate', {
        voiceId: 'en-US-alina',
        text: text,
        modelVersion: 'GEN2',
        format: 'MP3',
        encodeAsBase64: true
      }, {
        headers: { 'api-key': apiKey.trim(), 'Content-Type': 'application/json' }
      });
      return fallbackResponse.data;
    }
  } catch (error) {
    if (error.response?.data) {
      console.error('Murf API Error Response:', JSON.stringify(error.response.data, null, 2));
      throw new Error(`Murf API Error: ${error.response.data.message || 'Unknown error'}`);
    }
    console.error('Murf TTS Service Error:', error.message);
    throw error;
  }
};

const getAvailableVoices = async () => {
  const apiKey = process.env.MURF_API_KEY;
  if (!apiKey || apiKey.includes('***') || apiKey.startsWith('PASTE_')) {
    return [
      { voiceId: 'en-US-alina', name: 'Alina (Standard)', gender: 'FEMALE', language: 'en-US' },
      { voiceId: 'hi-IN-madhav', name: 'Madhav (Standard)', gender: 'MALE', language: 'hi-IN' }
    ];
  }
  try {
    const response = await axios.get('https://api.murf.ai/v1/speech/voices', {
      headers: { 'api-key': apiKey }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Murf voices:', error.message);
    throw new Error('Failed to fetch voices.');
  }
};

module.exports = {
  getAvailableVoices,
  generateSpeech
};
