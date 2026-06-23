import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const CategoryEditForm = ({ category, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#00f0ff'
  });

  useEffect(() => {
    if (category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: category.name || '',
        color: category.color || '#00f0ff'
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(category.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="cyber-card w-full max-w-lg border-[var(--accent-secondary)]/50 shadow-cyber-fuchsia">
        <h2 className="text-xl font-black text-[var(--accent-secondary)] uppercase tracking-widest mb-6 italic">
          Modificar Categoría_ID #{category.id}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">
              Color
            </label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="h-10 w-full bg-transparent border border-[var(--border-color)] rounded-md cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="fuchsia"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditForm;