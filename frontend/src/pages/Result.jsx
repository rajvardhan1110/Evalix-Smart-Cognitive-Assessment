import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function Result() {
  const { attemptId } = useParams();
  const { t, lang } = useLang();
  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    api.get(`/attempts/${attemptId}`).then(r => setAttempt(r.data)).catch(() => {});
    api.get(`/responses/attempt/${attemptId}`).then(r => setResponses(r.data)).catch(() => {});
  }, [attemptId]);

  if (!attempt) return <div className="flex items-center justify-center h-screen text-white">{t('common.loading')}</div>;

  const pct = attempt.maxScore > 0 ? Math.round((attempt.totalScore / attempt.maxScore) * 100) : 0;

  const statusInfo = () => {
    if (attempt.status === 'graded') return { text: t('result.graded'), cls: 'bg-green-500/20 text-green-400' };
    if (attempt.status === 'submitted') return { text: t('result.pending'), cls: 'bg-yellow-500/20 text-yellow-400' };
    return { text: t('result.submitted'), cls: 'bg-blue-500/20 text-blue-400' };
  };
  const si = statusInfo();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('result.title')}</h1>
        <p className="text-slate-400">{lang === 'mr' && attempt.test?.titleMr ? attempt.test.titleMr : attempt.test?.title}</p>
      </div>

      <div className="card mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-1">{attempt.totalScore}<span className="text-lg text-slate-400">/{attempt.maxScore}</span></div>
            <div className="text-sm text-slate-400">{t('result.totalScore')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-1">{pct}%</div>
            <div className="text-sm text-slate-400">{lang === 'mr' ? 'टक्केवारी' : 'Percentage'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">{attempt.autoScore || 0}</div>
            <div className="text-sm text-slate-400">{t('result.autoScore')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400 mb-1">{attempt.manualScore || 0}</div>
            <div className="text-sm text-slate-400">{t('result.manualScore')}</div>
          </div>
        </div>
        <div className="mt-6 h-3 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full gradient-bg transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 text-center">
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${si.cls}`}>{si.text}</span>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">{lang === 'mr' ? 'प्रतिसाद तपशील' : 'Response Details'} ({responses.length} {lang === 'mr' ? 'प्रश्न' : 'questions'})</h2>
        <div className="space-y-4">
          {responses.map((r, i) => {
            const qText = lang === 'mr' && r.question?.textMr ? r.question.textMr : r.question?.text;
            return (
              <div key={r._id} className="glass-light rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Q{i + 1}: {qText}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${r.isAutoGraded || r.isManuallyGraded ? (r.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') : 'bg-slate-600/50 text-slate-400'}`}>
                    {r.marksAwarded || 0}/{r.question?.marks || 0}
                  </span>
                </div>
                {r.textAnswer && <p className="text-sm text-slate-300">{lang === 'mr' ? 'उत्तर' : 'Answer'}: {r.textAnswer}</p>}
                {r.numericalAnswer !== undefined && r.numericalAnswer !== null && <p className="text-sm text-slate-300">{lang === 'mr' ? 'उत्तर' : 'Answer'}: {r.numericalAnswer}</p>}
                {r.fileUrl && (
                  <div className="mt-1">
                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">📎 {lang === 'mr' ? 'अपलोड केलेली फाइल पहा' : 'View uploaded file'}</a>
                    {r.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && <img src={r.fileUrl} alt="response" className="mt-2 max-h-40 rounded-lg" />}
                  </div>
                )}
                {r.feedback && <p className="text-sm text-yellow-300 mt-1">{lang === 'mr' ? 'अभिप्राय' : 'Feedback'}: {r.feedback}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <Link to="/" className="px-6 py-3 rounded-xl gradient-btn text-white font-semibold inline-block">{t('result.backToDashboard')}</Link>
      </div>
    </div>
  );
}
