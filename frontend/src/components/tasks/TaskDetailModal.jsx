import { useState, useEffect, useRef, useCallback } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import subtaskService from '../../services/subtaskService';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import {
  translateStatus,
  translatePriority,
  getStatusStyles,
  getPriorityStyles,
  formatDate
} from '../../utils/formatters';

// ── Modal para seleccionar categorías faltantes ──
const CategoryPickerModal = ({ allCategories, currentIds, onAdd, onClose }) => {
  const available = allCategories.filter(c => !currentIds.includes(c.id));

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
      <div className="cyber-card w-full max-w-sm border-[var(--accent-primary)]/50 shadow-cyber-cyan">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-[var(--accent-primary)] uppercase tracking-widest">
            Agregar Categoría
          </h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--accent-secondary)] text-lg font-bold">✕</button>
        </div>

        {available.length === 0 ? (
          <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase text-center py-4">
            Todas las categorías ya están asignadas
          </p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto cyber-scroll">
            {available.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => { onAdd(c); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-secondary)]/60 transition-colors text-left"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{c.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ── Sub-componente: fila de subtarea con edición inline ──
const SubtaskItem = ({ subtask, onToggle, onDelete, onUpdateTitle, disabled }) => {
  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(subtask.title);

  const handleBlur = () => {
    setEditing(false);
    onUpdateTitle(subtask, titleInput);
  };

  return (
    <li className="flex items-center gap-3 group p-2 rounded-md hover:bg-[var(--bg-secondary)]/40 transition-colors">
      <button
        onClick={() => onToggle(subtask)}
        disabled={disabled}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
          subtask.completed
            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
            : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]'
        }`}
      >
        {subtask.completed && (
          <span className="text-[var(--bg-primary)] text-[10px] font-black leading-none">✓</span>
        )}
      </button>

      {editing ? (
        <input
          type="text"
          value={titleInput}
          onChange={e => setTitleInput(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => e.key === 'Enter' && handleBlur()}
          className="cyber-input text-sm flex-1 py-0.5"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={`text-sm flex-1 cursor-pointer transition-colors ${
            subtask.completed
              ? 'line-through text-[var(--text-muted)]'
              : 'text-[var(--text-primary)]'
          }`}
          title="Doble clic para editar"
        >
          {subtask.title}
        </span>
      )}

      <button
        onClick={() => onDelete(subtask.id)}
        disabled={disabled}
        className="text-[10px] font-bold text-[var(--accent-secondary)] opacity-0 group-hover:opacity-100 transition-opacity uppercase px-1"
      >
        ✕
      </button>
    </li>
  );
};

// ── Modal principal ──
const TaskDetailModal = ({ task, onSave, onClose, loading }) => {
  const { user } = useAuth();

  // Estado local de la tarea (lo que se muestra y edita en el modal)
  const [localTask, setLocalTask] = useState(null);

  // Estado del formulario editable
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    category_ids: []
  });

  // Categorías seleccionadas como objetos completos (para mostrar badges)
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Todas las categorías del usuario (para el picker)
  const [allCategories, setAllCategories] = useState([]);

  // Subtareas
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtaskLoading, setSubtaskLoading] = useState(false);

  // Control de cambios
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const originalData = useRef(null);
  const initialized = useRef(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Solo inicializamos una vez al montar el modal.
    // Ignoramos re-renders del padre que pasen una nueva prop task
    // (ocurre cuando fetchTasks recarga la lista tras guardar).
    if (!task || initialized.current) return;
    initialized.current = true;

    const cats = task.categories || [];
    const initial = {
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      category_ids: cats.map(c => c.id)
    };
    setLocalTask(task);
    setFormData(initial);
    setSelectedCategories(cats);
    originalData.current = JSON.stringify(initial);
    setIsDirty(false);
  }, [task]);

  // ── Cargar subtareas y todas las categorías ──
  useEffect(() => {
    if (task?.id) {
      subtaskService.getSubtasks(task.id).then(setSubtasks).catch(console.error);
      categoryService.getCategories().then(setAllCategories).catch(console.error);
    }
  }, [task?.id]);

  // ── Detectar cambios ──
  const markDirty = (updated) => {
    setIsDirty(JSON.stringify(updated) !== originalData.current);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      markDirty(updated);
      return updated;
    });
  };

  // ── Agregar categoría desde el picker ──
  const handleAddCategory = (category) => {
    setSelectedCategories(prev => [...prev, category]);
    setFormData(prev => {
      const updated = { ...prev, category_ids: [...prev.category_ids, category.id] };
      markDirty(updated);
      return updated;
    });
  };

  // ── Quitar categoría ──
  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== categoryId));
    setFormData(prev => {
      const updated = { ...prev, category_ids: prev.category_ids.filter(id => id !== categoryId) };
      markDirty(updated);
      return updated;
    });
  };

  // ── Guardar cambios y actualizar el estado local del modal ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await onSave(localTask.id, formData);
      if (success) {
        setLocalTask(prev => ({
          ...prev,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          due_date: formData.due_date || null,
          categories: selectedCategories
        }));
        originalData.current = JSON.stringify(formData);
        setIsDirty(false);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Cerrar con detección de cambios ──
  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  const handleDiscardAndClose = () => {
    setShowUnsavedModal(false);
    onClose();
  };

  const handleSaveAndClose = async () => {
    setShowUnsavedModal(false);
    setSaving(true);
    try {
      const success = await onSave(localTask.id, formData);
      if (success) onClose();
    } finally {
      setSaving(false);
    }
  };

  // ── Subtareas ──
  const handleToggleSubtask = useCallback(async (subtask) => {
    setSubtaskLoading(true);
    try {
      const updated = await subtaskService.updateSubtask(localTask.id, subtask.id, { completed: !subtask.completed });
      setSubtasks(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err) { console.error(err); }
    finally { setSubtaskLoading(false); }
  }, [localTask?.id]);

  const handleAddSubtask = useCallback(async () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtaskLoading(true);
    try {
      const created = await subtaskService.createSubtask(localTask.id, newSubtaskTitle.trim());
      setSubtasks(prev => [...prev, created]);
      setNewSubtaskTitle('');
    } catch (err) { console.error(err); }
    finally { setSubtaskLoading(false); }
  }, [localTask?.id, newSubtaskTitle]);

  const handleDeleteSubtask = useCallback(async (subtaskId) => {
    setSubtaskLoading(true);
    try {
      await subtaskService.deleteSubtask(localTask.id, subtaskId);
      setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
    } catch (err) { console.error(err); }
    finally { setSubtaskLoading(false); }
  }, [localTask?.id]);

  const handleUpdateSubtaskTitle = useCallback(async (subtask, newTitle) => {
    if (!newTitle.trim() || newTitle.trim() === subtask.title) return;
    setSubtaskLoading(true);
    try {
      const updated = await subtaskService.updateSubtask(localTask.id, subtask.id, { title: newTitle.trim() });
      setSubtasks(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err) { console.error(err); }
    finally { setSubtaskLoading(false); }
  }, [localTask?.id]);

  // ── Progreso subtareas ──
  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'completed', label: 'Completada' },
  ];

  if (!localTask) return null;

  return (
    <>
      <div className="fixed inset-0 bg-[var(--bg-primary)]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="cyber-card w-full max-w-2xl max-h-[90vh] flex flex-col border-[var(--accent-primary)]/50 shadow-cyber-cyan overflow-hidden">

          {/* ── Cabecera ── */}
          <div className="flex items-start justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-[var(--accent-primary)]" />
              <div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                  Tarea #{localTask.id} // {user?.name}
                </p>
                <h2 className="text-xl font-black text-[var(--accent-primary)] uppercase tracking-widest italic leading-tight">
                  Detalle de Registro
                </h2>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors text-xl font-bold mt-1"
            >
              ✕
            </button>
          </div>

          {/* ── Cuerpo scrollable ── */}
          <div className="overflow-y-auto flex-1 pr-1 cyber-scroll space-y-6">

            {/* ── Campos editables directamente ── */}
            <section className="space-y-4">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                ▸ Información de la Tarea
              </span>

              {/* Título */}
              <div>
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 block mb-1">
                  Título
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="cyber-input w-full text-base font-bold"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 block mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Sin descripción..."
                  className="cyber-input w-full text-sm resize-none"
                />
              </div>

              {/* Vencimiento */}
              <Input
                label="Vencimiento"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
              />

              {/* Prioridad y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Prioridad"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={priorityOptions}
                />
                <Select
                  label="Estado"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                />
              </div>

              {/* Categorías */}
              <div>
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 block mb-2">
                  Categorías
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedCategories.map(c => (
                    <span
                      key={c.id}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase"
                      style={{
                        borderColor: `${c.color}80`,
                        color: c.color,
                        backgroundColor: `${c.color}1A`
                      }}
                    >
                      {c.name}
                      <button
                        onClick={() => handleRemoveCategory(c.id)}
                        className="opacity-60 hover:opacity-100 transition-opacity font-black text-[10px] leading-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setShowCategoryPicker(true)}
                    className="text-[10px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] border border-dashed border-[var(--accent-primary)]/40 hover:border-[var(--accent-secondary)]/60 px-2 py-0.5 rounded-md transition-colors uppercase tracking-widest"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </section>

            <div className="border-t border-[var(--border-color)]" />

            {/* ── Subtareas ── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  ▸ Sub-Tareas
                </span>
                {totalCount > 0 && (
                  <span className="text-[10px] font-mono text-[var(--accent-primary)]">
                    {completedCount}/{totalCount} completadas
                  </span>
                )}
              </div>

              {totalCount > 0 && (
                <div className="mb-4">
                  <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1 block">
                    {progressPercent}% completado
                  </span>
                </div>
              )}

              <ul className="space-y-2 mb-4">
                {subtasks.length === 0 && (
                  <li className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-widest text-center py-4 border border-dashed border-[var(--border-color)] rounded-md">
                    Sin sub-tareas registradas
                  </li>
                )}
                {subtasks.map(subtask => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={handleToggleSubtask}
                    onDelete={handleDeleteSubtask}
                    onUpdateTitle={handleUpdateSubtaskTitle}
                    disabled={subtaskLoading}
                  />
                ))}
              </ul>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Nueva sub-tarea... (Enter para agregar)"
                  className="cyber-input text-sm flex-1"
                  disabled={subtaskLoading}
                />
                <Button
                  onClick={handleAddSubtask}
                  variant="primary"
                  disabled={subtaskLoading || !newSubtaskTitle.trim()}
                >
                  +
                </Button>
              </div>
            </section>
          </div>

          {/* ── Footer: botón confirmar siempre visible ── */}
          <div className="shrink-0 pt-4 mt-2 border-t border-[var(--border-color)] flex gap-3">
            <Button onClick={handleClose} disabled={saving} className="flex-1">
              {isDirty ? 'Cancelar' : 'Cerrar'}
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={!isDirty || saving}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Confirmar Cambios'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modal: cambios sin guardar ── */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="cyber-card w-full max-w-md border-[var(--accent-secondary)] shadow-cyber-fuchsia">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-[var(--accent-secondary)]" />
              <h2 className="text-xl font-black text-[var(--accent-secondary)] uppercase tracking-widest italic">
                Cambios sin guardar
              </h2>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-mono mb-8">
              Tienes modificaciones pendientes. ¿Qué deseas hacer?
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleSaveAndClose} variant="primary" disabled={saving} className="w-full">
                {saving ? 'Guardando...' : 'Guardar y cerrar'}
              </Button>
              <Button onClick={handleDiscardAndClose} variant="fuchsia" className="w-full">
                Descartar cambios
              </Button>
              <Button onClick={() => setShowUnsavedModal(false)} className="w-full">
                Volver al modal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: picker de categorías ── */}
      {showCategoryPicker && (
        <CategoryPickerModal
          allCategories={allCategories}
          currentIds={formData.category_ids}
          onAdd={handleAddCategory}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}
    </>
  );
};

export default TaskDetailModal;