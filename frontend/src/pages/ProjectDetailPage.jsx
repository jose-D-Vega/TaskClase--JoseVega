import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SectionCard from '../components/layout/SectionCard';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import TaskFilters from '../components/tasks/TaskFilters';
import ConfirmModal from '../components/common/ConfirmModal';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import Button from '../components/ui/Button';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import subtaskService from '../services/subtaskService';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [error, setError]             = useState(null);
  const [filters, setFilters]         = useState({ status: '', priority: '' });

  const [detailTask, setDetailTask]       = useState(null);
  const [taskToDelete, setTaskToDelete]   = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(null);

  // ── Cargar proyecto ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await projectService.getProjectById(id);
        setProject(data);
      } catch {
        setError('No se pudo cargar el proyecto.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Cargar tareas del proyecto ──
  const fetchTasks = useCallback(async () => {
    setTaskLoading(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const data = await projectService.getProjectTasks(id, activeFilters);
      setTasks(data);
    } catch {
      setError('No se pudieron cargar las tareas.');
    } finally {
      setTaskLoading(false);
    }
  }, [id, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Crear tarea dentro del proyecto ──
  const handleCreateTask = useCallback(async (formData) => {
    setTaskLoading(true);
    try {
      const { subtasks, ...taskFields } = formData;
      // Forzamos el project_id al proyecto actual
      const created = await taskService.createTask({ ...taskFields, project_id: parseInt(id) });
      if (subtasks && subtasks.length > 0) {
        await subtaskService.bulkCreateSubtasks(created.id, subtasks);
      }
      await fetchTasks();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setTaskLoading(false);
    }
  }, [id, fetchTasks]);

  // ── Actualizar tarea ──
  const handleUpdateTask = useCallback(async (taskId, data) => {
    setTaskLoading(true);
    try {
      await taskService.updateTask(taskId, data);
      await fetchTasks();
      setRefreshTrigger(taskId + '_' + Date.now());
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setTaskLoading(false);
    }
  }, [fetchTasks]);

  // ── Eliminar tarea ──
  const confirmDelete = useCallback(async () => {
    if (!taskToDelete) return;
    setTaskLoading(true);
    try {
      await taskService.deleteTask(taskToDelete);
      await fetchTasks();
      setTaskToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setTaskLoading(false);
    }
  }, [taskToDelete, fetchTasks]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="container mx-auto px-4 py-8"><Loading /></div>;
  if (!project) return <div className="container mx-auto px-4 py-8"><ErrorMessage message={error || 'Proyecto no encontrado'} /></div>;

  const total     = parseInt(project.task_count)     || 0;
  const completed = parseInt(project.completed_count) || 0;
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">

      {/* ── Cabecera del proyecto ── */}
      <div className="cyber-card mb-8 border-[var(--accent-primary)]/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projects')}
              className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent-primary)] uppercase tracking-widest transition-colors">
              ← Proyectos
            </button>
            <div className="w-px h-5 bg-[var(--border-color)]" />
            <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
            <div>
              <h1 className="text-2xl font-black text-[var(--accent-primary)] uppercase tracking-widest italic">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">{project.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: 'Total',    value: total,                                    color: 'text-[var(--accent-primary)]' },
              { label: 'Progreso', value: parseInt(project.in_progress_count) || 0, color: 'text-[var(--accent-tertiary)]' },
              { label: 'Listas',   value: completed,                                color: 'text-emerald-500' },
            ].map((s, i) => (
              <div key={i} className="cyber-card !py-2 !px-3 flex flex-col items-center min-w-[60px]">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">{s.label}</span>
                <span className={`text-xl font-black font-mono ${s.color}`}>{s.value.toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de progreso global */}
        {total > 0 && (
          <div className="mt-4">
            <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1 block">{progress}% completado</span>
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Panel izquierdo: nueva tarea */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
          <SectionCard title="Nueva Tarea">
            <TaskForm onSubmit={handleCreateTask} loading={taskLoading} />
          </SectionCard>
        </div>

        {/* Panel derecho: tareas */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {error && <ErrorMessage message={error} />}

          <SectionCard title="Filtros">
            <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
          </SectionCard>

          <SectionCard title={`Tareas del Proyecto (${tasks.length})`}>
            <TaskList
              tasks={tasks}
              loading={taskLoading}
              onDetails={setDetailTask}
              onDelete={setTaskToDelete}
            />
          </SectionCard>
        </div>
      </div>

      {/* Modales */}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onSave={handleUpdateTask}
          onClose={() => setDetailTask(null)}
          loading={taskLoading}
        />
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        title="¿Confirmas la eliminación de esta tarea?"
        message="Esta acción purgará los datos de forma permanente."
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
        loading={taskLoading}
      />

      <footer className="mt-16 text-center text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-[0.3em]">
        © 2026 TaskFlow System // Universidad Tecnológica de Datos
      </footer>
    </div>
  );
};

export default ProjectDetailPage;