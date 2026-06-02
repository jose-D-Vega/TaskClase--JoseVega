import { useState } from 'react';
import SectionCard from '../components/layout/SectionCard';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import axiosClient from '../api/axiosClient';

const ProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.put(`/users/${user.id}`, formData);
      if (res.data.success) {
        // En un mundo ideal, actualizaríamos el AuthContext
        // Por ahora, forzamos recarga o simplemente mostramos éxito
        alert('Perfil actualizado. Inicia sesión de nuevo para ver los cambios en todo el sistema.');
        setEditing(false);
      }
    } catch (err) {
      alert('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-cyber-cyan shadow-cyber-cyan/50 mb-4 object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-cyber-cyan/10 border-4 border-cyber-cyan flex items-center justify-center text-cyber-cyan font-black text-4xl mb-4 shadow-cyber-cyan/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute bottom-6 right-0 w-8 h-8 bg-cyber-fuchsia rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">
          {user.name}
        </h1>
        <div className="flex justify-center items-center gap-2 mt-2">
          <p className="text-cyber-cyan font-mono text-sm uppercase tracking-widest">
            {user.email}
          </p>
          <span className={`text-[10px] px-2 py-0.5 rounded border border-cyber-fuchsia text-cyber-fuchsia uppercase font-bold`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SectionCard title="Información Personal">
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.2em] mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 bg-slate-900/50 border border-slate-800 rounded text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.2em] mb-1">URL Avatar</label>
                <input 
                  type="text" 
                  value={formData.avatar}
                  onChange={e => setFormData({...formData, avatar: e.target.value})}
                  className="w-full p-2 bg-slate-900/50 border border-slate-800 rounded text-sm text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" className="flex-1 !text-[10px]" disabled={loading}>Guardar</Button>
                <Button type="button" onClick={() => setEditing(false)} variant="ghost" className="flex-1 !text-[10px]">Cancelar</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.2em] mb-1">Nombre Completo</label>
                <div className="p-2 bg-slate-900/50 border border-slate-800 rounded text-sm font-medium">{user.name}</div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.2em] mb-1">Email de Acceso</label>
                <div className="p-2 bg-slate-900/50 border border-slate-800 rounded text-sm font-mono">{user.email}</div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.2em] mb-1">Miembro desde</label>
                <div className="p-2 bg-slate-900/50 border border-slate-800 rounded text-sm">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Mayo 2026'}
                </div>
              </div>
              <Button onClick={() => setEditing(true)} variant="primary" className="w-full mt-4 !text-[10px] uppercase tracking-widest">Editar Perfil</Button>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Seguridad & Sistema">
          <div className="space-y-4 mt-2">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded group hover:border-cyber-cyan/50 transition-colors">
              <div>
                <div className="text-xs font-bold uppercase tracking-tight">Nivel de Acceso</div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase">Clasificación: {user.role === 'admin' ? 'Root' : 'Standard User'}</div>
              </div>
              <div className="w-10 h-5 bg-cyber-cyan/20 border border-cyber-cyan rounded-full relative">
                <div className={`absolute ${user.role === 'admin' ? 'right-1' : 'left-1'} top-1 w-3 h-3 bg-cyber-cyan rounded-full`}></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded group hover:border-cyber-fuchsia/50 transition-colors">
              <div>
                <div className="text-xs font-bold uppercase tracking-tight">Protocolo de Cifrado</div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase">AES-256-GCM Activo</div>
              </div>
              <div className="text-cyber-fuchsia animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded mt-8">
              <div className="text-xs font-bold text-red-500 uppercase tracking-tight">Zona de Peligro</div>
              <p className="text-[9px] text-[var(--text-muted)] mt-1 mb-3">La eliminación de la cuenta es irreversible y purgará todos tus datos.</p>
              <button className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-tighter">Eliminar Cuenta</button>
            </div>
          </div>
        </SectionCard>
      </div>

      <footer className="mt-16 text-center text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-[0.3em]">
        TaskFlow Identity Service // Secure Connection Protocol v2.4
      </footer>
    </div>
  );
};

export default ProfilePage;
