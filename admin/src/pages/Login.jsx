import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLang();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try { await login(email, password); } catch { setError('Access denied. Admin/Tester only.'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">E</div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Evalix Admin</h1>
          <p className="text-slate-400">Admin & Tester Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="admin@evalix.com" />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">{t('auth.password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl gradient-btn text-white font-semibold">{t('auth.loginBtn')}</button>
        </form>
        <div className="flex justify-center mt-4"><LanguageToggle /></div>
      </div>
    </div>
  );
}
