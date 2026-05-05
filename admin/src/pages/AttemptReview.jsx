import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function AttemptReview() {
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/attempts/all${params}`).then(r => setAttempts(r.data)).catch(() => {});
  }, [filter]);

  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Attempt Review</h1>
        <div className="flex gap-2">
          {['', 'in_progress', 'submitted', 'graded'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass-light text-slate-400'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {attempts.map(a => (
          <div key={a._id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">{a.test?.title || 'Unknown Test'}</h3>
              <p className="text-sm text-slate-400">{a.user?.name} ({a.user?.email})</p>
              <p className="text-xs text-slate-500 mt-1">Score: {a.totalScore}/{a.maxScore} • {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === 'graded' ? 'bg-green-500/20 text-green-400' : a.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {a.status}
              </span>
              {a.status === 'submitted' && (
                <Link to={`/attempts/${a._id}/grade`} className="px-3 py-1 rounded-lg gradient-btn text-white text-xs font-medium">Grade</Link>
              )}
              {a.status === 'graded' && (
                <Link to={`/attempts/${a._id}/grade`} className="px-3 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-xs">View</Link>
              )}
            </div>
          </div>
        ))}
        {attempts.length === 0 && <p className="text-slate-400 text-center py-8">No attempts found</p>}
      </div>
    </div>
  );
}
