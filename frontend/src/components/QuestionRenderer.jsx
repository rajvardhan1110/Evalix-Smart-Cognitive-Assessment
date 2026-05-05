import { useState, useRef, useEffect } from 'react';
import MediaPlayer from './MediaPlayer';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function QuestionRenderer({ question, response, onResponseChange, attemptId }) {
  const { lang, t } = useLang();
  const [uploading, setUploading] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const qText = lang === 'mr' && question.textMr ? question.textMr : question.text;

  // Canvas drawing setup
  useEffect(() => {
    if (!showCanvas || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, [showCanvas]);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(e);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const submitDrawing = async () => {
    if (!canvasRef.current) return;
    setUploading(true);
    try {
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
      const formData = new FormData();
      formData.append('file', blob, 'drawing.png');
      formData.append('attempt', attemptId);
      formData.append('question', question._id);
      const res = await api.post('/responses/upload', formData);
      onResponseChange({ ...response, fileUrl: res.data.fileUrl });
    } catch (err) { console.error('Drawing upload failed:', err); }
    setUploading(false);
  };

  const handleOptionToggle = (optId) => {
    if (question.type === 'SCMCQ') {
      onResponseChange({ ...response, selectedOptions: [optId] });
    } else {
      const current = response?.selectedOptions || [];
      const updated = current.includes(optId)
        ? current.filter(id => id !== optId)
        : [...current, optId];
      onResponseChange({ ...response, selectedOptions: updated });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attempt', attemptId);
      formData.append('question', question._id);
      const res = await api.post('/responses/upload', formData);
      onResponseChange({ ...response, fileUrl: res.data.fileUrl });
    } catch (err) { console.error('Upload failed:', err); }
    setUploading(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs px-3 py-1 rounded-full glass-light text-blue-300 font-medium">{question.type}</span>
        <span className="text-xs text-slate-400">{question.marks} {t('test.marks')}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-4 leading-relaxed">{qText}</h3>

      <MediaPlayer media={question.media} className="mb-4" />

      {(question.type === 'SCMCQ' || question.type === 'MCMCQ') && (
        <div className="space-y-2">
          {question.options?.map(opt => {
            const optText = lang === 'mr' && opt.textMr ? opt.textMr : opt.text;
            const isSelected = response?.selectedOptions?.includes(opt._id);
            return (
              <button key={opt._id} onClick={() => handleOptionToggle(opt._id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 text-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 flex-shrink-0 ${question.type === 'SCMCQ' ? 'rounded-full' : 'rounded-md'} border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-500'}`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span>{optText}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'Text' && (
        <textarea value={response?.textAnswer || ''} onChange={e => onResponseChange({ ...response, textAnswer: e.target.value })}
          placeholder={t('test.typeAnswer')} rows={4}
          className="input-field resize-none" />
      )}

      {question.type === 'Numerical' && (
        <input type="number" value={response?.numericalAnswer ?? ''} onChange={e => onResponseChange({ ...response, numericalAnswer: e.target.value })}
          placeholder={t('test.enterNumber')} className="input-field" />
      )}

      {question.type === 'FileUpload' && (
        <div className="space-y-3">
          {/* Toggle: Draw or Upload */}
          <div className="flex gap-2 mb-2">
            <button onClick={() => setShowCanvas(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!showCanvas ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass-light text-slate-400'}`}>
              📁 {t('test.uploadFile')}
            </button>
            <button onClick={() => setShowCanvas(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showCanvas ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass-light text-slate-400'}`}>
              ✏️ {lang === 'mr' ? 'चित्र काढा' : 'Draw'}
            </button>
          </div>

          {!showCanvas ? (
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors">
              <input type="file" id={`file-${question._id}`} accept="image/*,audio/*,video/*,.pdf" capture="environment" onChange={handleFileUpload} className="hidden" />
              <label htmlFor={`file-${question._id}`} className="cursor-pointer">
                <div className="text-4xl mb-2">📁</div>
                <span className="text-slate-400">{uploading ? t('common.loading') : t('test.uploadFile')}</span>
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-white">
                <canvas ref={canvasRef} width={500} height={350}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                  style={{ width: '100%', maxHeight: '350px', cursor: 'crosshair', touchAction: 'none' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={clearCanvas} className="px-4 py-2 rounded-lg glass-light text-slate-300 text-sm hover:text-white transition-all">🗑 {lang === 'mr' ? 'पुसा' : 'Clear'}</button>
                <button onClick={submitDrawing} disabled={uploading} className="px-4 py-2 rounded-lg gradient-btn text-white text-sm">
                  {uploading ? t('common.loading') : (lang === 'mr' ? '💾 जतन करा' : '💾 Save Drawing')}
                </button>
              </div>
            </div>
          )}

          {response?.fileUrl && (
            <div className="glass-light rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-slate-300">{lang === 'mr' ? 'फाइल अपलोड झाली' : 'File uploaded successfully'}</span>
                <a href={response.fileUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm ml-auto hover:underline">{lang === 'mr' ? 'पहा' : 'View'}</a>
              </div>
              {response.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <img src={response.fileUrl} alt="Uploaded" className="max-h-40 rounded-lg mt-1" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
