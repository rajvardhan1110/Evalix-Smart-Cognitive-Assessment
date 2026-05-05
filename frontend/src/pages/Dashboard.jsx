import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    api.get('/attempts/my').then(r => setAttempts(r.data)).catch(() => {});
    api.get('/tests/published').then(r => setTests(r.data)).catch(() => {});
  }, []);

  const statusLabel = (s) => {
    if (s === 'graded') return { text: lang === 'mr' ? 'मूल्यांकन पूर्ण' : 'Graded', cls: 'bg-green-500/20 text-green-400' };
    if (s === 'submitted') return { text: lang === 'mr' ? 'सबमिट केले' : 'Submitted', cls: 'bg-yellow-500/20 text-yellow-400' };
    return { text: lang === 'mr' ? 'चालू' : 'In Progress', cls: 'bg-blue-500/20 text-blue-400' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t('dashboard.welcome')}, <span className="gradient-text">{user?.name}</span></h1>
        <p className="text-slate-400 mt-1">Clinical Cognitive Screening Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="text-3xl font-bold text-blue-400">{tests.length}</div>
          <div className="text-slate-400 text-sm">{t('dashboard.availableTests')}</div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="text-3xl font-bold text-purple-400">{attempts.length}</div>
          <div className="text-slate-400 text-sm">{t('dashboard.recentAttempts')}</div>
        </div>
        <div className="card bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="text-3xl font-bold text-green-400">{attempts.filter(a => a.status === 'graded').length}</div>
          <div className="text-slate-400 text-sm">{t('result.graded')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.availableTests')}</h2>
          {tests.length === 0 ? <p className="text-slate-400">{t('dashboard.noTests')}</p> : (
            <div className="space-y-3">
              {tests.map(test => (
                <Link key={test._id} to={`/test/${test._id}`} className="block glass-light rounded-xl p-4 hover:bg-slate-700/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{lang === 'mr' && test.titleMr ? test.titleMr : test.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{test.type} • {test.totalMarks} {t('test.marks')} • {test.duration} {t('test.minutes')}</p>
                    </div>
                    <span className="text-blue-400 text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.recentAttempts')}</h2>
          {attempts.length === 0 ? <p className="text-slate-400">{t('dashboard.noAttempts')}</p> : (
            <div className="space-y-3">
              {attempts.slice(0, 5).map(a => {
                const st = statusLabel(a.status);
                return (
                  <Link key={a._id} to={a.status !== 'in_progress' ? `/result/${a._id}` : `/test/${a.test?._id}`} className="block glass-light rounded-xl p-4 hover:bg-slate-700/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{lang === 'mr' && a.test?.titleMr ? a.test.titleMr : a.test?.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{t('dashboard.score')}: {a.totalScore}/{a.maxScore}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${st.cls}`}>{st.text}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
