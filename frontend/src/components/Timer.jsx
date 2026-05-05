import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';

export default function Timer({ duration, onTimeUp }) {
  const [seconds, setSeconds] = useState(duration * 60);
  const { t } = useLang();

  useEffect(() => {
    if (seconds <= 0) { onTimeUp?.(); return; }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 120;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${isLow ? 'bg-red-500/20 text-red-400 pulse-glow' : 'glass-light text-blue-400'}`}>
      <span>⏱</span>
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
      <span className="text-xs font-normal text-slate-400 ml-1">{t('test.timeLeft')}</span>
    </div>
  );
}
