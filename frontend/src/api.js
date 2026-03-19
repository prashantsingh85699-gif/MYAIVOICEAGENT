import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const getVoices = async () => {
  const response = await api.get('/tts/voices');
  return response.data;
};

export const checkinWithCoach = async (text, category = '') => {
  const response = await api.post('/coach/checkin', { text, category });
  return response.data;
};

export default api;
