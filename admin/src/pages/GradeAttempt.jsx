import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function GradeAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState([]);
  const [grading, setGrading] = useState({});

  useEffect(() => {
    api.get(`/attempts/${id}`).then(r => setAttempt(r.data)).catch(() => {});
    api.get(`/responses/attempt/${id}`).then(r => setResponses(r.data)).catch(() => {});
  }, [id]);

  const handleAutoGrade = async () => {
    await api.post(`/grading/auto/${id}`);
    api.get(`/attempts/${id}`).then(r => setAttempt(r.data));
    api.get(`/responses/attempt/${id}`).then(r => setResponses(r.data));
  };

  const handleManualGrade = async (responseId) => {
    const g = grading[responseId];
    if (!g) return;
    await api.post('/grading/manual', { responseId, marksAwarded: parseFloat(g.marks) || 0, feedback: g.feedback || '' });
    api.get(`/attempts/${id}`).then(r => setAttempt(r.data));
    api.get(`/responses/attempt/${id}`).then(r => setResponses(r.data));
  };

  if (!attempt) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Grade Attempt</h1>
          <p className="text-slate-400">{attempt.test?.title} - {attempt.user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAutoGrade} className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-medium text-sm border border-green-500/30 hover:bg-green-500/30 transition-all">⚡ Auto Grade</button>
          <button onClick={() => navigate('/attempts')} className="px-4 py-2 rounded-xl glass-light text-slate-300 text-sm">← Back</button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-white">{attempt.totalScore}</div><div className="text-xs text-slate-400">Total</div></div>
          <div><div className="text-2xl font-bold text-blue-400">{attempt.autoScore}</div><div className="text-xs text-slate-400">Auto</div></div>
          <div><div className="text-2xl font-bold text-purple-400">{attempt.manualScore}</div><div className="text-xs text-slate-400">Manual</div></div>
          <div><div className="text-2xl font-bold text-slate-400">{attempt.maxScore}</div><div className="text-xs text-slate-400">Max</div></div>
        </div>
      </div>

      <div className="space-y-4">
        {responses.map((r, i) => (
          <div key={r._id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-white">Q{i + 1}: {r.question?.text}</span>
                <span className="text-xs ml-2 px-2 py-0.5 rounded bg-slate-700 text-slate-300">{r.question?.type}</span>
              </div>
              <span className={`text-sm font-bold ${r.isAutoGraded || r.isManuallyGraded ? 'text-green-400' : 'text-yellow-400'}`}>
                {r.marksAwarded}/{r.question?.marks}
              </span>
            </div>

            {r.selectedOptions?.length > 0 && (
              <p className="text-sm text-slate-300 mb-2">Selected: {r.question?.options?.filter(o => r.selectedOptions.includes(o._id)).map(o => o.text).join(', ')}</p>
            )}
            {r.textAnswer && <p className="text-sm text-slate-300 mb-2">Answer: <span className="text-white">{r.textAnswer}</span></p>}
            {r.numericalAnswer !== undefined && r.numericalAnswer !== null && <p className="text-sm text-slate-300 mb-2">Answer: <span className="text-white">{r.numericalAnswer}</span></p>}
            {r.fileUrl && (
              <div className="mb-2">
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">📎 View uploaded file</a>
                {r.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && <img src={r.fileUrl} alt="response" className="mt-2 max-h-48 rounded-lg" />}
              </div>
            )}
            {r.feedback && <p className="text-sm text-yellow-300 mb-2">Feedback: {r.feedback}</p>}

            {(r.question?.type === 'Text' || r.question?.type === 'FileUpload') && !r.isManuallyGraded && (
              <div className="flex gap-2 items-end mt-3 pt-3 border-t border-slate-700/50">
                <div className="w-24">
                  <label className="text-xs text-slate-400">Marks</label>
                  <input type="number" max={r.question?.marks} min={0} className="input-field !py-1 !text-sm"
                    value={grading[r._id]?.marks || ''} onChange={e => setGrading({ ...grading, [r._id]: { ...grading[r._id], marks: e.target.value } })} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Feedback</label>
                  <input className="input-field !py-1 !text-sm" placeholder="Optional feedback"
                    value={grading[r._id]?.feedback || ''} onChange={e => setGrading({ ...grading, [r._id]: { ...grading[r._id], feedback: e.target.value } })} />
                </div>
                <button onClick={() => handleManualGrade(r._id)} className="px-3 py-1.5 rounded-lg gradient-btn text-white text-xs">Grade</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
