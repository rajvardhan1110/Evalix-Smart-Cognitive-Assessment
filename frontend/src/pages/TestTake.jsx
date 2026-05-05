import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../utils/api';
import Timer from '../components/Timer';
import QuestionRenderer from '../components/QuestionRenderer';

export default function TestTake() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const testRes = await api.get(`/tests/${testId}`);
        setTest(testRes.data);
        const attemptRes = await api.post('/attempts/start', { testId });
        setAttempt(attemptRes.data);
        const respRes = await api.get(`/responses/attempt/${attemptRes.data._id}`);
        const respMap = {};
        respRes.data.forEach(r => { respMap[r.question?._id || r.question] = r; });
        setResponses(respMap);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    init();
  }, [testId]);

  if (loading || !test) return <div className="flex items-center justify-center h-screen text-white">{t('common.loading')}</div>;

  const sections = test.sections || [];
  const section = sections[currentSection];
  const questions = section?.questions || [];
  const question = questions[currentQuestion];
  const allQuestions = sections.flatMap(s => s.questions || []);
  const currentGlobalIdx = sections.slice(0, currentSection).reduce((sum, s) => sum + (s.questions?.length || 0), 0) + currentQuestion;

  const handleResponseChange = async (data) => {
    const qId = question._id;
    setResponses(prev => ({ ...prev, [qId]: { ...prev[qId], ...data } }));
    try {
      await api.post('/responses', { attempt: attempt._id, question: qId, ...data });
    } catch (err) { console.error(err); }
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(q => q + 1);
    else if (currentSection < sections.length - 1) { setCurrentSection(s => s + 1); setCurrentQuestion(0); }
  };

  const goPrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(q => q - 1);
    else if (currentSection > 0) {
      const prevSection = sections[currentSection - 1];
      setCurrentSection(s => s - 1);
      setCurrentQuestion((prevSection.questions?.length || 1) - 1);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm(t('test.confirmSubmit'))) return;
    try {
      await api.put(`/attempts/${attempt._id}/submit`);
      navigate(`/result/${attempt._id}`);
    } catch (err) { console.error(err); }
  };

  const isLast = currentSection === sections.length - 1 && currentQuestion === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{lang === 'mr' && test.titleMr ? test.titleMr : test.title}</h1>
          <p className="text-sm text-slate-400">{lang === 'mr' && section?.titleMr ? section.titleMr : section?.title}</p>
        </div>
        {test.duration > 0 && <Timer duration={test.duration} onTimeUp={handleSubmit} />}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {sections.map((s, si) => (
          <button key={s._id} onClick={() => { setCurrentSection(si); setCurrentQuestion(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${si === currentSection ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass-light text-slate-400 hover:text-white'}`}>
            {lang === 'mr' && s.titleMr ? s.titleMr : s.title}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 mb-6 flex-wrap">
        {allQuestions.map((_, i) => (
          <div key={i} className={`stepper-dot cursor-pointer ${i === currentGlobalIdx ? 'stepper-dot-active' : i < currentGlobalIdx ? 'stepper-dot-done' : 'stepper-dot-pending'}`}
            onClick={() => {
              let count = 0;
              for (let si = 0; si < sections.length; si++) {
                const qs = sections[si].questions || [];
                if (count + qs.length > i) { setCurrentSection(si); setCurrentQuestion(i - count); return; }
                count += qs.length;
              }
            }} />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
        <span>{t('test.question')} {currentGlobalIdx + 1} {t('test.of')} {allQuestions.length}</span>
        <span>{t('test.section')} {currentSection + 1} {t('test.of')} {sections.length}</span>
      </div>

      {question && (
        <div className="card mb-6">
          <QuestionRenderer question={question} response={responses[question._id]} onResponseChange={handleResponseChange} attemptId={attempt._id} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={goPrev} disabled={currentSection === 0 && currentQuestion === 0}
          className="px-6 py-2 rounded-xl glass-light text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          ← {t('test.prev')}
        </button>
        {isLast ? (
          <button onClick={handleSubmit} className="px-8 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all shadow-lg shadow-green-500/20">
            {t('test.submit')} ✓
          </button>
        ) : (
          <button onClick={goNext} className="px-6 py-2 rounded-xl gradient-btn text-white font-medium">
            {t('test.next')} →
          </button>
        )}
      </div>
    </div>
  );
}
