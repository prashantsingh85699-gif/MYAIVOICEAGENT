require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const ttsRoutes = require('./routes/tts');
const coachRoutes = require('./routes/coach');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: [
    'http://127.0.0.1:3333',
    'http://localhost:3333',
    'http://127.0.0.1:5179', 
    'http://localhost:5179',
    'https://myaivoiceagent-1.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use('/api/tts', ttsRoutes);
app.use('/api/coach', coachRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('VitalVoice API is Live and Healthy! 🩺🚀');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VitalVoice backend running on port ${PORT}`);
});
