import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tests: 0, users: 0, attempts: 0, pendingGrading: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/tests'),
      api.get('/users'),
      api.get('/attempts/all')
    ]).then(([tests, users, attempts]) => {
      setStats({
        tests: tests.data.length,
        users: users.data.length,
        attempts: attempts.data.length,
        pendingGrading: attempts.data.filter(a => a.status === 'submitted').length
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Tests', value: stats.tests, color: 'from-blue-500/20 to-blue-600/10', icon: '🧪', textColor: 'text-blue-400' },
    { label: 'Total Users', value: stats.users, color: 'from-purple-500/20 to-purple-600/10', icon: '👥', textColor: 'text-purple-400' },
    { label: 'Total Attempts', value: stats.attempts, color: 'from-green-500/20 to-green-600/10', icon: '📝', textColor: 'text-green-400' },
    { label: 'Pending Grading', value: stats.pendingGrading, color: 'from-amber-500/20 to-amber-600/10', icon: '⏳', textColor: 'text-amber-400' }
  ];

  return (
    <div className="p-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome, <span className="gradient-text">{user?.name}</span></h1>
      <p className="text-slate-400 mb-8">Admin Dashboard Overview</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(c => (
          <div key={c.label} className={`card bg-gradient-to-br ${c.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
            </div>
            <div className={`text-3xl font-bold ${c.textColor} mb-1`}>{c.value}</div>
            <div className="text-sm text-slate-400">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
