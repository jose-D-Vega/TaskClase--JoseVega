import { useState, useEffect } from 'react';
import SectionCard from '../components/layout/SectionCard';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la gestión de sesiones
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.get('/users');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('No se pudieron cargar los usuarios. Verifica tus permisos.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await axiosClient.put(`/users/${userId}`, { role: newRole });
      if (res.data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert('Error al actualizar el rol');
    }
  };

  const handleViewSessions = async (u) => {
    setSelectedUser(u);
    setShowModal(true);
    setLoadingSessions(true);
    try {
      const res = await axiosClient.get(`/users/${u.id}/sessions`);
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      alert('Error al cargar las sesiones');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!confirm('¿Estás seguro de que deseas cerrar esta sesión de forma remota?')) return;
    
    try {
      const res = await axiosClient.delete(`/users/sessions/${sessionId}`);
      if (res.data.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
      }
    } catch (err) {
      alert('Error al cerrar la sesión');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-fuchsia uppercase italic tracking-tighter">
          Panel de Administración
        </h1>
        <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest mt-2">
          Gestión de infraestructura de usuarios y permisos
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SectionCard title="Total Usuarios" className="!p-4">
          <div className="text-4xl font-black text-cyber-cyan italic">{users.length}</div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase mt-2">Nodos registrados en la red</div>
        </SectionCard>
        <SectionCard title="Administradores" className="!p-4">
          <div className="text-4xl font-black text-cyber-fuchsia italic">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase mt-2">Privilegios de root nivel 1</div>
        </SectionCard>
        <SectionCard title="Estado del Sistema" className="!p-4">
          <div className="text-4xl font-black text-green-400 italic">ÓPTIMO</div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase mt-2">Todos los servicios operativos</div>
        </SectionCard>
      </div>

      <SectionCard title="Base de Datos de Usuarios">
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">Usuario</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">Email</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">Rol Actual</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-cyber-cyan">Fecha Registro</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-cyber-cyan text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-cyber-cyan/5 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-cyber-cyan/30" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm">{u.name}</div>
                        <div className="text-[9px] font-mono text-[var(--text-muted)]">UID: {u.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className={`text-[9px] px-2 py-0.5 rounded border ${
                      u.role === 'admin' ? 'border-cyber-fuchsia text-cyber-fuchsia' : 'border-cyber-cyan text-cyber-cyan'
                    } uppercase font-bold`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[10px] font-mono">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <button 
                        onClick={() => handleViewSessions(u)}
                        className="text-[10px] font-bold text-cyber-cyan hover:underline uppercase tracking-tighter"
                      >
                        Sesiones
                      </button>
                      {u.id !== user.id && (
                        <button 
                          onClick={() => handleUpdateRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                          className="text-[10px] font-bold text-cyber-fuchsia hover:underline uppercase tracking-tighter"
                        >
                          {u.role === 'admin' ? 'Degradar' : 'Promover'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* MODAL DE SESIONES */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyber-cyan/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] rounded-lg overflow-hidden">
            <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-cyber-cyan uppercase italic">Sesiones Activas</h2>
                <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-tighter">
                  Usuario: {selectedUser?.name} // ID: {selectedUser?.id}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingSessions ? (
                <div className="py-10 text-center text-cyber-cyan font-mono animate-pulse">
                  ESCANEANDO SESIONES...
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-10 text-center text-[var(--text-muted)] font-mono uppercase text-xs">
                  No hay sesiones activas registradas para este usuario.
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="bg-slate-800/30 border border-slate-700 p-4 rounded-md flex justify-between items-center group hover:border-cyber-cyan/50 transition-all">
                      <div className="flex gap-4">
                        <div className="text-cyber-cyan opacity-50">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                            Sesión #{s.id.toString().padStart(4, '0')}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                              Iniciada: {new Date(s.created_at).toLocaleString()}
                            </span>
                            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                              Expira: {new Date(s.expires_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRevokeSession(s.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-bold px-3 py-1.5 rounded border border-red-500/30 uppercase tracking-tighter transition-all opacity-0 group-hover:opacity-100"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 p-4 border-t border-slate-700 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="text-xs font-bold uppercase tracking-widest px-6 py-2 border border-slate-600 hover:border-cyber-cyan hover:text-cyber-cyan transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 text-center text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-[0.3em]">
        © 2026 TaskFlow Admin Panel // Operador: {user?.name} [ROL: {user?.role}]
      </footer>
    </div>
  );
};

export default AdminDashboard;
