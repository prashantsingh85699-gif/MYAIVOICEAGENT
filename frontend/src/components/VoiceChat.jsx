import React, { useState, useRef, useEffect } from 'react';
import { checkinWithCoach } from '../api';
import useAudioPlayer from '../hooks/useAudioPlayer';
import './VoiceChat.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceChat({ preselectedCategory }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const { playBase64, isPlaying } = useAudioPlayer();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (e) => {
        setIsRecording(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript); // auto send upon speech success
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        alert("Speech Recognition is not supported by your browser. Please type.");
      }
    }
  };

  const handleSend = async (forcedText = null) => {
    const textToSend = typeof forcedText === 'string' ? forcedText : inputText;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInputText('');
    setIsLoading(true);

    try {
      const data = await checkinWithCoach(textToSend, preselectedCategory);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.text,
        audioBase64: data.audioBase64 
      }]);
      
      if (data.audioBase64) {
        playBase64(data.audioBase64);
      }
    } catch (error) {
      const errTxt = error.response ? JSON.stringify(error.response.data) : 'Network error';
      setMessages(prev => [...prev, { role: 'system', content: `Checkin failed: ${errTxt}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Allow clicking the speaker icon to replay the message manually
  const replayAudio = (audioBase64) => {
    if (audioBase64) {
      playBase64(audioBase64);
    }
  };

  return (
    <div className="voice-chat-container">
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Hi, I'm VitalsVoice!</h2>
            <p>Your Specialized Medical Audio Assistant. How are you feeling today?</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className={`message-bubble ${isPlaying && idx === messages.length - 1 && msg.role === 'assistant' ? 'speaking' : ''}`}>
              {msg.role === 'assistant' && (
                <span 
                  className="voice-icon" 
                  title="Play Audio" 
                  onClick={() => replayAudio(msg.audioBase64)}
                >
                  🔊
                </span>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-bubble typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="controls">
        <button 
          className={`mic-button ${isRecording ? 'recording' : ''}`} 
          onClick={handleMicClick}
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type your symptoms..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="send-button" onClick={() => handleSend()} disabled={isLoading || !inputText.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
