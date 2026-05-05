import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center font-bold text-white">E</div>
            <span className="text-xl font-bold gradient-text">Evalix</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">{t('nav.dashboard')}</Link>
            <Link to="/tests" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">{t('nav.tests')}</Link>
            <LanguageToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">{user?.name?.[0]}</div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 text-sm transition-colors">{t('nav.logout')}</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
