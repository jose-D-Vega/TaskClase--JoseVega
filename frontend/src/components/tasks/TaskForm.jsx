import { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useCategories } from '../../hooks/useCategories';

// ── Modal picker de categorías ──
const CategoryPickerModal = ({ allCategories, currentIds, onToggle, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
      <div className="cyber-card w-full max-w-sm border-[var(--accent-primary)]/50 shadow-cyber-cyan">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-[var(--accent-primary)] uppercase tracking-widest">
            Seleccionar Categorías
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--accent-secondary)] text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {allCategories.length === 0 ? (
          <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase text-center py-4">
            No hay categorías creadas
          </p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto cyber-scroll">
            {allCategories.map(c => {
              const selected = currentIds.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left border ${
                      selected
                        ? 'border-[var(--accent-primary)]/60 bg-[var(--accent-primary)]/10'
                        : 'border-transparent hover:bg-[var(--bg-secondary)]/60'
                    }`}
                  >
                    {/* Indicador de color */}
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    {/* Nombre */}
                    <span className="text-sm text-[var(--text-primary)] flex-1">{c.name}</span>
                    {/* Check si está seleccionada */}
                    {selected && (
                      <span className="text-[var(--accent-primary)] text-xs font-black">✓</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <Button onClick={onClose} variant="primary" className="w-full">
            Confirmar selección
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Formulario principal ──
const TaskForm = ({ onSubmit, loading }) => {
  const { categories } = useCategories();

  const initialState = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    category_ids: [],
    subtasks: []
  };

  const [formData, setFormData] = useState(initialState);
  const [formError, setFormError] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Toggle de categoría desde el picker ──
  const handleToggleCategory = (category) => {
    setFormData(prev => {
      const alreadySelected = prev.category_ids.includes(category.id);
      return {
        ...prev,
        category_ids: alreadySelected
          ? prev.category_ids.filter(id => id !== category.id)
          : [...prev.category_ids, category.id]
      };
    });
  };

  // ── Quitar categoría desde el badge ──
  const handleRemoveCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.filter(id => id !== categoryId)
    }));
  };

  // ── Subtareas ──
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtaskTitle.trim() }]
    }));
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('El título es obligatorio.');
      return;
    }

    const success = await onSubmit(formData);

    if (success) {
      setFormData(initialState);
      setNewSubtaskTitle('');
    }
  };

  // Categorías seleccionadas como objetos completos (para los badges)
  const selectedCategories = categories.filter(c => formData.category_ids.includes(c.id));

  const priorityOptions = [
    { value: 'low',    label: 'Baja'   },
    { value: 'medium', label: 'Media'  },
    { value: 'high',   label: 'Alta'   },
  ];

  const statusOptions = [
    { value: 'pending',     label: 'Pendiente'   },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'completed',   label: 'Completada'  },
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Nombre de la tarea"
          required
        />
        <Input
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detalles adicionales..."
        />
        <Input
          label="Vencimiento"
          name="due_date"
          type="date"
          value={formData.due_date}
          onChange={handleChange}
        />
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

        {/* ── Categorías ── */}
        <div>
          <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 block mb-2">
            Categorías
          </label>
          <div className="flex flex-wrap gap-2 items-center mb-2">
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
                  type="button"
                  onClick={() => handleRemoveCategory(c.id)}
                  className="opacity-60 hover:opacity-100 transition-opacity font-black text-[10px] leading-none"
                >
                  ✕
                </button>
              </span>
            ))}
            {selectedCategories.length === 0 && (
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Sin categorías seleccionadas
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowCategoryPicker(true)}
            className="text-[10px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] border border-dashed border-[var(--accent-primary)]/40 hover:border-[var(--accent-secondary)]/60 px-3 py-1 rounded-md transition-colors uppercase tracking-widest w-full"
          >
            + Seleccionar categorías
          </button>
        </div>

        {/* ── Sub-Tareas ── */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-1 block">
            Sub-Tareas
          </label>

          {formData.subtasks.length > 0 && (
            <ul className="space-y-1.5 mb-2">
              {formData.subtasks.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 text-sm text-[var(--text-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[var(--accent-primary)] text-[10px]">○</span>
                    {s.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(i)}
                    className="text-[10px] font-bold text-[var(--accent-secondary)] hover:opacity-80 uppercase"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
              placeholder="Nueva sub-tarea... (Enter para agregar)"
              className="cyber-input text-sm flex-1"
            />
            <Button type="button" onClick={handleAddSubtask} variant="primary">
              +
            </Button>
          </div>
        </div>

        {formError && (
          <p className="text-xs text-[var(--accent-secondary)] font-bold uppercase">{formError}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full mt-4"
        >
          {loading ? 'Procesando...' : 'Crear Tarea'}
        </Button>
      </form>

      {/* ── Modal picker de categorías ── */}
      {showCategoryPicker && (
        <CategoryPickerModal
          allCategories={categories}
          currentIds={formData.category_ids}
          onToggle={handleToggleCategory}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}
    </>
  );
};

export default TaskForm;