import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => { loadUsers(); }, []);
  const loadUsers = () => api.get('/users').then(r => setUsers(r.data)).catch(() => {});

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}/role`, { role });
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  const roleColors = { admin: 'bg-red-500/20 text-red-400', tester: 'bg-purple-500/20 text-purple-400', participant: 'bg-blue-500/20 text-blue-400' };

  return (
    <div className="p-8 animate-fadeIn">
      <h1 className="text-3xl font-bold gradient-text mb-8">User Management</h1>
      <div className="space-y-3">
        {users.map(u => (
          <div key={u._id} className="card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">{u.name?.[0]}</div>
              <div>
                <h3 className="font-medium text-white">{u.name}</h3>
                <p className="text-sm text-slate-400">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} className="input-field !py-1 !text-sm !w-32">
                <option value="participant">Participant</option>
                <option value="tester">Tester</option>
                <option value="admin">Admin</option>
              </select>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{u.role}</span>
              <button onClick={() => deleteUser(u._id)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
