import { useState, useRef, useEffect } from 'react';

export default function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Initialize Audio object once on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playBase64 = (base64String) => {
    if (!base64String) return;
    
    // Stop current tracking
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    // Convert to src format
    let srcStr = base64String;
    if (!srcStr.startsWith('data:audio')) {
      srcStr = `data:audio/mp3;base64,${base64String}`;
    }

    try {
      audioRef.current.src = srcStr;
      audioRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio playback failed: ", e);
    }
  };

  const stop = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return { isPlaying, playBase64, stop };
}
