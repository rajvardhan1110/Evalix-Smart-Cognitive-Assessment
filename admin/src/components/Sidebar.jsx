import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import LanguageToggle from './LanguageToggle';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/tests', label: 'Test Builder', icon: '🧪' },
  { to: '/attempts', label: 'Attempt Review', icon: '📝' },
  { to: '/users', label: 'Users', icon: '👥' }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-slate-700/50 flex flex-col z-50">
      <div className="p-6 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-lg font-bold text-white">E</div>
          <div>
            <h1 className="text-lg font-bold gradient-text">Evalix Admin</h1>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === l.to ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <span>{l.icon}</span><span>{l.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700/30 space-y-3">
        <LanguageToggle />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">{user?.name?.[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-400 text-xs">Logout</button>
        </div>
      </div>
    </div>
  );
}
