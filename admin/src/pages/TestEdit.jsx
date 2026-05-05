import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function TestEdit() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionForm, setSectionForm] = useState({ title: '', titleMr: '', order: 0 });
  const [questionForm, setQuestionForm] = useState({ text: '', textMr: '', type: 'SCMCQ', marks: 1, correctAnswer: '' });
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [optionForm, setOptionForm] = useState({ text: '', textMr: '', isCorrect: false });
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');

  useEffect(() => { loadTest(); }, [id]);
  const loadTest = async () => {
    const r = await api.get(`/tests/${id}`);
    setTest(r.data);
    setSections(r.data.sections || []);
  };

  const addSection = async (e) => {
    e.preventDefault();
    await api.post('/sections', { ...sectionForm, test: id });
    setSectionForm({ title: '', titleMr: '', order: sections.length });
    loadTest();
  };

  const deleteSection = async (sid) => {
    if (!window.confirm('Delete section?')) return;
    await api.delete(`/sections/${sid}`);
    loadTest();
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    await api.post('/questions', { ...questionForm, section: activeSectionId });
    setQuestionForm({ text: '', textMr: '', type: 'SCMCQ', marks: 1, correctAnswer: '' });
    loadTest();
  };

  const deleteQuestion = async (qid) => {
    if (!window.confirm('Delete question?')) return;
    await api.delete(`/questions/${qid}`);
    loadTest();
  };

  const addOption = async (e) => {
    e.preventDefault();
    await api.post('/options', { ...optionForm, question: activeQuestionId });
    setOptionForm({ text: '', textMr: '', isCorrect: false });
    loadTest();
  };

  const deleteOption = async (oid) => {
    await api.delete(`/options/${oid}`);
    loadTest();
  };

  const uploadMedia = async (qid) => {
    if (!mediaFile) return;
    const fd = new FormData();
    fd.append('file', mediaFile);
    fd.append('type', mediaType);
    fd.append('questionId', qid);
    await api.post('/media/upload', fd);
    setMediaFile(null);
    loadTest();
  };

  if (!test) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 animate-fadeIn">
      <h1 className="text-2xl font-bold text-white mb-2">{test.title}</h1>
      <p className="text-slate-400 mb-6">{test.type} • {test.totalMarks} marks</p>

      <form onSubmit={addSection} className="card mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Section Title (EN)</label>
          <input value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} required className="input-field" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Section Title (MR)</label>
          <input value={sectionForm.titleMr} onChange={e => setSectionForm({ ...sectionForm, titleMr: e.target.value })} className="input-field" />
        </div>
        <button type="submit" className="px-4 py-3 rounded-xl gradient-btn text-white text-sm whitespace-nowrap">+ Section</button>
      </form>

      {sections.map(section => (
        <div key={section._id} className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">📁 {section.title}</h2>
            <div className="flex gap-2">
              <button onClick={() => setActiveSectionId(activeSectionId === section._id ? null : section._id)} className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">+ Question</button>
              <button onClick={() => deleteSection(section._id)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs">Delete</button>
            </div>
          </div>

          {activeSectionId === section._id && (
            <form onSubmit={addQuestion} className="glass-light rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Question (EN)" value={questionForm.text} onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })} required className="input-field" />
                <input placeholder="Question (MR)" value={questionForm.textMr} onChange={e => setQuestionForm({ ...questionForm, textMr: e.target.value })} className="input-field" />
                <select value={questionForm.type} onChange={e => setQuestionForm({ ...questionForm, type: e.target.value })} className="input-field">
                  <option value="SCMCQ">Single MCQ</option><option value="MCMCQ">Multi MCQ</option><option value="Numerical">Numerical</option><option value="Text">Text</option><option value="FileUpload">File Upload</option>
                </select>
                <input type="number" placeholder="Marks" value={questionForm.marks} onChange={e => setQuestionForm({ ...questionForm, marks: e.target.value })} className="input-field" />
                {questionForm.type === 'Numerical' && <input placeholder="Correct Answer" value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} className="input-field" />}
              </div>
              <button type="submit" className="px-4 py-2 rounded-xl gradient-btn text-white text-sm">Add Question</button>
            </form>
          )}

          {section.questions?.map((q, qi) => (
            <div key={q._id} className="glass-light rounded-xl p-4 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white"><strong>Q{qi + 1}</strong> [{q.type}] {q.text} <span className="text-slate-400">({q.marks}pts)</span></span>
                <div className="flex gap-1">
                  <button onClick={() => setActiveQuestionId(activeQuestionId === q._id ? null : q._id)} className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">Options</button>
                  <button onClick={() => deleteQuestion(q._id)} className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Del</button>
                </div>
              </div>
              {q.media?.length > 0 && <div className="flex gap-2 mb-2">{q.media.map(m => <span key={m._id} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">📎 {m.type}</span>)}</div>}

              <div className="flex items-center gap-2 mb-2">
                <input type="file" onChange={e => setMediaFile(e.target.files[0])} className="text-xs text-slate-400" />
                <select value={mediaType} onChange={e => setMediaType(e.target.value)} className="input-field !py-1 !text-xs !w-24">
                  <option value="image">Image</option><option value="audio">Audio</option><option value="video">Video</option>
                </select>
                <button onClick={() => uploadMedia(q._id)} className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Upload</button>
              </div>

              {activeQuestionId === q._id && (q.type === 'SCMCQ' || q.type === 'MCMCQ') && (
                <div className="mt-2 space-y-2 pl-4 border-l-2 border-slate-700">
                  {q.options?.map(opt => (
                    <div key={opt._id} className="flex items-center gap-2 text-sm">
                      <span className={opt.isCorrect ? 'text-green-400' : 'text-slate-400'}>{opt.isCorrect ? '✓' : '○'}</span>
                      <span className="text-slate-300">{opt.text}</span>
                      <button onClick={() => deleteOption(opt._id)} className="text-red-400 text-xs ml-auto">×</button>
                    </div>
                  ))}
                  <form onSubmit={addOption} className="flex gap-2 items-center">
                    <input placeholder="Option (EN)" value={optionForm.text} onChange={e => setOptionForm({ ...optionForm, text: e.target.value })} required className="input-field !py-1 !text-xs flex-1" />
                    <input placeholder="(MR)" value={optionForm.textMr} onChange={e => setOptionForm({ ...optionForm, textMr: e.target.value })} className="input-field !py-1 !text-xs w-32" />
                    <label className="flex items-center gap-1 text-xs text-slate-400"><input type="checkbox" checked={optionForm.isCorrect} onChange={e => setOptionForm({ ...optionForm, isCorrect: e.target.checked })} />Correct</label>
                    <button type="submit" className="px-2 py-1 rounded text-xs gradient-btn text-white">Add</button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
