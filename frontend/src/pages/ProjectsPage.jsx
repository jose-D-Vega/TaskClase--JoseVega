import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCard from '../components/layout/SectionCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmModal from '../components/common/ConfirmModal';
import Loading from '../components/common/Loading';
import { useProjects } from '../hooks/useProjects';

// ── Formulario de proyecto (crear / editar) ──
const ProjectForm = ({ initial = {}, onSubmit, onCancel, loading, submitLabel = 'Crear Proyecto' }) => {
  const [formData, setFormData] = useState({
    name:        initial.name        || '',
    description: initial.description || '',
    color:       initial.color       || '#00f0ff'
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del proyecto" required />
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Descripción del proyecto..."
          className="cyber-input w-full text-sm resize-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Color</label>
        <input type="color" name="color" value={formData.color} onChange={handleChange}
          className="h-10 w-full bg-transparent border border-[var(--border-color)] rounded-md cursor-pointer" />
      </div>
      {formError && <p className="text-xs text-[var(--accent-secondary)] font-bold uppercase">{formError}</p>}
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" onClick={onCancel} className="flex-1">Cancelar</Button>}
        <Button type="submit" variant="primary" disabled={loading} className="flex-1">
          {loading ? 'Procesando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

// ── Card de proyecto ──
const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const total     = parseInt(project.task_count)     || 0;
  const completed = parseInt(project.completed_count) || 0;
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="bg-[var(--bg-primary)]/40 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 p-5 rounded-lg transition-all group flex flex-col gap-4 cursor-pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: project.color }} />
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
              {project.name}
            </h3>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">ID: #{project.id}</span>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {project.description && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{project.description}</p>
      )}

      {/* Stats de tareas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Total',     value: total,                                        color: 'text-[var(--accent-primary)]' },
          { label: 'Progreso',  value: parseInt(project.in_progress_count) || 0,     color: 'text-[var(--accent-tertiary)]' },
          { label: 'Completas', value: completed,                                     color: 'text-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="cyber-card !py-2 !px-1 flex flex-col items-center">
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">{s.label}</span>
            <span className={`text-lg font-black font-mono ${s.color}`}>{s.value.toString().padStart(2, '0')}</span>
          </div>
        ))}
      </div>

      {/* Barra de progreso */}
      {total > 0 && (
        <div>
          <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1 block">{progress}% completado</span>
        </div>
      )}

      {/* Acciones — detener propagación para no navegar */}
      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]" onClick={e => e.stopPropagation()}>
        <button onClick={() => onEdit(project)}
          className="text-[10px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors uppercase tracking-widest px-2 py-1">
          Editar
        </button>
        <button onClick={() => onDelete(project.id)}
          className="text-[10px] font-bold text-[var(--accent-secondary)] hover:opacity-80 transition-colors uppercase tracking-widest px-2 py-1">
          Eliminar
        </button>
      </div>
    </div>
  );
};

// ── Página principal ──
const ProjectsPage = () => {
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();
  const [editingProject, setEditingProject]   = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleUpdate = useCallback(async (data) => {
    const success = await updateProject(editingProject.id, data);
    if (success) setEditingProject(null);
  }, [updateProject, editingProject]);

  const confirmDelete = useCallback(async () => {
    if (projectToDelete) {
      const success = await deleteProject(projectToDelete);
      if (success) setProjectToDelete(null);
    }
  }, [deleteProject, projectToDelete]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Panel izquierdo: crear proyecto */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
          <SectionCard title="Nuevo Proyecto">
            <ProjectForm onSubmit={createProject} loading={loading} />
          </SectionCard>
        </div>

        {/* Panel derecho: lista */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {error && <ErrorMessage message={error} />}
          <SectionCard title="Mis Proyectos">
            {loading && projects.length === 0 ? (
              <Loading />
            ) : projects.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">No hay proyectos registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onEdit={setEditingProject}
                    onDelete={setProjectToDelete}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Modal edición */}
      {editingProject && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="cyber-card w-full max-w-lg border-[var(--accent-secondary)]/50 shadow-cyber-fuchsia">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-[var(--accent-secondary)]" />
              <h2 className="text-xl font-black text-[var(--accent-secondary)] uppercase tracking-widest italic">
                Editar Proyecto #{editingProject.id}
              </h2>
            </div>
            <ProjectForm
              initial={editingProject}
              onSubmit={handleUpdate}
              onCancel={() => setEditingProject(null)}
              loading={loading}
              submitLabel="Guardar Cambios"
            />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!projectToDelete}
        title="¿Confirmas la eliminación del proyecto?"
        message="Las tareas asociadas quedarán sin proyecto. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setProjectToDelete(null)}
        loading={loading}
      />

      <footer className="mt-16 text-center text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-[0.3em]">
        © 2026 TaskFlow System // Universidad Tecnológica de Datos
      </footer>
    </div>
  );
};

export default ProjectsPage;