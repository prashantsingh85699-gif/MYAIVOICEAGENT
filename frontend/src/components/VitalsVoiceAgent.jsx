import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- STABLE PRO REFINED COMPONENTS (V3.6) ---

const HighlightText = ({ text, color }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span style={{ wordBreak: 'break-word' }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return (
            <span key={i} style={{ color: color, fontWeight: 800, textShadow: `0 0 10px ${color}44` }}>
              {content}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

const InsightPanel = ({ color, label, value, icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    whileHover={{ x: 5, background: 'rgba(255,255,255,0.05)' }}
    style={{ 
      padding: '16px 20px', borderRadius: '20px', background: 'rgba(10, 15, 30, 0.45)', 
      borderLeft: `4px solid ${color}`, borderRight: `1px solid rgba(255,255,255,0.05)`,
      borderTop: `1px solid rgba(255,255,255,0.05)`, borderBottom: `1px solid rgba(255,255,255,0.05)`,
      backdropFilter: 'blur(40px)', width: '100%',
      display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: `0 10px 30px rgba(0,0,0,0.5)`
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, lineHeight: '1.4' }}>{value}</div>
  </motion.div>
);

const TalkingAvatar = ({ state, theme }) => (
  <motion.div 
    animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 4, repeat: Infinity }}
    className="avatar-box"
    style={{ 
        position: 'relative', borderRadius: '50%', overflow: 'hidden', 
        border: `3px solid ${theme[state]}`, boxShadow: `0 0 40px ${theme[state]}33` 
    }}>
    <img src="/ai_avatar.png" alt="AI Agent" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
    
    <AnimatePresence>
      {state === 'speaking' && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', bottom: '22%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
          {[1,2,3,4].map(i => (
            <motion.div key={i} 
              animate={{ height: [6, 25, 6], opacity: [0.4, 1, 0.4] }} 
              transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
              style={{ width: '3px', background: '#00ccff', borderRadius: '4px', boxShadow: '0 0 8px #00ccff' }} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div 
        animate={{ top: ['-10%', '110%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#00ccff88', boxShadow: '0 0 10px #00ccff' }} />
  </motion.div>
);

export default function VitalsVoiceAgent() {
  const [appState, setAppState] = useState('idle'); // idle | listening | thinking | speaking
  const [history, setHistory] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [language, setLanguage] = useState('en-US'); 
  const [textInput, setTextInput] = useState('');

  const transcriptRef = useRef('');
  const recognitionRef = useRef(null);
  const audioRef = useRef(new Audio());
  const historyRef = useRef(null);

  const theme = {
    idle: '#00ccff', 
    listening: '#ff0055', 
    thinking: '#00ff9f', 
    speaking: '#9d00ff' 
  };

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history, liveTranscript]);

  const processMessage = async (input) => {
    if (!input.trim()) return;
    setAppState('thinking');
    setHistory(prev => [...prev, { role: 'user', text: input }]);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://myaivoiceagent-wds9.onrender.com';
      const response = await fetch(`${API_URL}/api/coach/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: input, 
          language: language,
          history: history.slice(-5).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
        })
      });
      const data = await response.json();
      setHistory(prev => [...prev, { role: 'ai', text: data.text }]);
      
      if (data.audioBase64) {
        audioRef.current.src = `data:audio/mp3;base64,${data.audioBase64}`;
        audioRef.current.onplay = () => setAppState('speaking');
        audioRef.current.onended = () => setAppState('idle');
        audioRef.current.play();
      } else setAppState('idle');
    } catch (e) {
      console.error(e);
      setAppState('idle');
    }
  };

  const handleOrbClick = () => {
    if (appState === 'speaking') { audioRef.current.pause(); setAppState('idle'); }
    else if (appState === 'listening') { recognitionRef.current?.stop(); }
    else {
      const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Speech) return alert("Browser not supported");
      const rec = new Speech();
      rec.lang = language;
      rec.interimResults = true;
      rec.onstart = () => { setAppState('listening'); transcriptRef.current = ''; };
      rec.onresult = (e) => {
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
        setLiveTranscript(t);
        transcriptRef.current = t;
      };
      rec.onend = () => {
        const final = transcriptRef.current;
        setLiveTranscript('');
        if (final) processMessage(final);
        else setAppState('idle');
      };
      recognitionRef.current = rec;
      rec.start();
    }
  };

  return (
    <div className="app-main">
      <div className="neural-overlay" />

      <main className="dashboard-layout">
        
        {/* LEFT COLUMN: HUD */}
        <section className="hud-panel">
          
          <header className="brand-header">
            <div className="brand">
              <h1 className="brand-title">VitalVoice</h1>
              <p className="brand-version">SUPREME CLINICAL INTERFACE v3.7</p>
            </div>
            
            <div className="language-selector">
              {['en-US', 'hi-IN'].map(l => (
                <button key={l} onClick={() => setLanguage(l)} className={language === l ? 'active' : ''}>
                  {l === 'en-US' ? 'EN' : 'HI'}
                </button>
              ))}
            </div>
          </header>

          <div className="vertical-stack">
            <InsightPanel label="System Intelligence" value="Misty-AI v3 Active" icon="🧠" color="#00ff9f" delay={0.1} />
            <InsightPanel label="Daily Health Note" value={language === 'hi-IN' ? "Har din 30 minute vyayam karein!" : "Exercise 30 mins daily!"} icon="✨" color="#00ccff" delay={0.2} />
          </div>

          <div className="avatar-core">
            <TalkingAvatar state={appState} theme={theme} />
            <div className="interactive-orb" onClick={handleOrbClick}>
               <motion.div className="orb-ring" animate={{ boxShadow: `0 0 60px ${theme[appState]}44`, borderColor: theme[appState] }}>
                  <span className="orb-status">{appState}</span>
               </motion.div>
            </div>
          </div>

          <footer className="input-footer">
            <div className="input-glass">
              <input 
                value={textInput} onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (processMessage(textInput), setTextInput(''))}
                placeholder={language === 'hi-IN' ? 'Kripya apna sawal yahan likhein...' : 'Initiate clinical query...'}
              />
              <button onClick={() => { processMessage(textInput); setTextInput(''); }}>SEND</button>
            </div>
          </footer>
        </section>

        {/* RIGHT COLUMN: CHAT FEED */}
        <aside className="feed-panel">
          <div className="feed-title">
            <h3>Intelligence Narrative Feed</h3>
          </div>
          <div className="chat-scroller" ref={historyRef}>
            {history.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className={`text-bubble ${m.role}`}>
                <HighlightText text={m.text} color={theme.idle} />
              </motion.div>
            ))}
            {liveTranscript && (
               <div className="live-caption">Analysis in progress: "{liveTranscript}"</div>
            )}
          </div>
        </aside>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; background: #020617; color: #fff; font-family: 'Inter', sans-serif; overflow: hidden; height: 100vh; }

        .app-main { height: 100vh; width: 100vw; position: relative; display: flex; overflow: hidden; }
        .neural-overlay { position: fixed; inset: 0; z-index: 0; opacity: 0.15; background: radial-gradient(circle at center, #1e293b 0%, #020617 100%); }

        .dashboard-layout { flex: 1; z-index: 1; display: grid; grid-template-columns: 1fr 420px; gap: 0; height: 100vh; }
        
        .hud-panel { display: flex; flex-direction: column; padding: 30px; gap: 20px; height: 100vh; overflow: hidden; }
        .brand-header { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .brand-title { font-size: 1.6rem; font-weight: 900; letter-spacing: 5px; color: #00ccff; margin: 0; text-transform: uppercase; }
        .brand-title span { color: #fff; }
        .brand-version { font-size: 0.6rem; color: rgba(255,255,255,0.4); letter-spacing: 3px; font-weight: 800; margin: 3px 0 0 0; }
        
        .language-selector { display: flex; gap: 5px; background: rgba(255,255,255,0.03); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
        .language-selector button { border: none; padding: 8px 18px; border-radius: 8px; cursor: pointer; background: transparent; color: #fff; font-weight: 800; font-size: 0.7rem; transition: 0.3s; }
        .language-selector button.active { background: #00ccff; color: #000; }

        .vertical-stack { display: flex; flex-direction: column; gap: 12px; max-width: 380px; flex-shrink: 0; }
        
        .avatar-core { flex: 1; display: flex; align-items: center; justify-content: center; gap: 40px; min-height: 0; }
        .avatar-box { width: 240px; height: 240px; flex-shrink: 0; }
        .orb-ring { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); flex-shrink: 0; }
        .orb-status { font-size: 0.65rem; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }

        .input-footer { margin-top: auto; padding-bottom: 20px; flex-shrink: 0; }
        .input-glass { display: flex; gap: 12px; padding: 10px 22px; background: rgba(255,255,255,0.04); border-radius: 25px; border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(40px); }
        .input-glass input { flex: 1; background: transparent; border: none; color: #fff; font-size: 1.1rem; outline: none; }
        .input-glass button { background: #00ccff; color: #000; border: none; padding: 0 28px; border-radius: 15px; font-weight: 900; cursor: pointer; font-size: 0.8rem; }

        .feed-panel { background: rgba(0,0,0,0.4); backdrop-filter: blur(60px); border-left: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; overflow: hidden; height: 100vh; }
        .feed-title { padding: 25px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .feed-title h3 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 3px; color: #00ccff; margin: 0; font-weight: 900; }
        
        .chat-scroller { flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 18px; }
        .text-bubble { max-width: 95%; padding: 18px 24px; border-radius: 24px; font-size: 0.95rem; line-height: 1.6; }
        .text-bubble.user { align-self: flex-end; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border-bottom-right-radius: 4px; }
        .text-bubble.ai { align-self: flex-start; background: rgba(0, 204, 255, 0.04); border: 1px solid rgba(0, 204, 255, 0.1); color: #fff; border-bottom-left-radius: 4px; }
        
        .live-caption { font-size: 0.8rem; color: rgba(0, 204, 255, 0.35); font-style: italic; text-align: center; margin-top: 5px; }

        /* ADVANCED RESPONSIVE GRID */
        @media (max-width: 1200px) {
          .dashboard-layout { display: flex; flex-direction: column; overflow-y: auto; height: 100vh; }
          .hud-panel { height: auto; padding: 20px; flex-shrink: 0; min-height: 600px; }
          .feed-panel { height: auto; min-height: 400px; border-left: none; border-top: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
          .avatar-core { padding: 40px 0; min-height: 300px; flex: 0 0 auto; }
          .avatar-box { width: 180px; height: 180px; }
          .orb-ring { width: 80px; height: 80px; }
        }

        @media (max-width: 600px) {
          .hud-panel { padding: 15px; gap: 15px; }
          .brand-title { font-size: 1.3rem; letter-spacing: 3px; }
          .vertical-stack { gap: 10px; width: 100%; }
          .avatar-core { flex-direction: column; gap: 20px; padding: 20px 0; }
          .input-glass { padding: 8px 18px; }
          .input-glass input { font-size: 1rem; }
          .input-footer { padding-bottom: 30px; }
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
