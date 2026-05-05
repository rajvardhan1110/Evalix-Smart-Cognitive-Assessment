import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function TestList() {
  const [tests, setTests] = useState([]);
  const { t, lang } = useLang();

  useEffect(() => {
    api.get('/tests/published').then(r => setTests(r.data)).catch(() => {});
  }, []);

  const typeColors = { MMSE: 'from-blue-500/20 to-blue-600/10', MoCA: 'from-purple-500/20 to-purple-600/10', 'ACE-III': 'from-emerald-500/20 to-emerald-600/10', CDR: 'from-amber-500/20 to-amber-600/10', Custom: 'from-pink-500/20 to-pink-600/10' };
  const typeIcons = { MMSE: '🧠', MoCA: '🔬', 'ACE-III': '📋', CDR: '💊', Custom: '📝' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold gradient-text mb-8">{t('dashboard.availableTests')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <Link key={test._id} to={`/test/${test._id}`} className={`card bg-gradient-to-br ${typeColors[test.type] || typeColors.Custom} group`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-lg">{typeIcons[test.type] || '📝'}</div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">{test.type}</span>
                <h3 className="font-semibold text-white text-sm leading-tight">{lang === 'mr' && test.titleMr ? test.titleMr : test.title}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{lang === 'mr' && test.descriptionMr ? test.descriptionMr : test.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{test.totalMarks} {t('test.marks')}</span>
              <span className="text-slate-400">{test.duration} {t('test.minutes')}</span>
              <span className="text-blue-400 group-hover:translate-x-1 transition-transform">{t('test.start')} →</span>
            </div>
          </Link>
        ))}
      </div>
      {tests.length === 0 && <p className="text-center text-slate-400 py-12">{t('dashboard.noTests')}</p>}
    </div>
  );
}
