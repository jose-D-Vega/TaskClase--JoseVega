import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const CategoryForm = ({ onSubmit, loading }) => {
  const initialState = {
    name: '',
    color: '#00f0ff'
  };

  const [formData, setFormData] = useState(initialState);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validación básica en frontend
    if (!formData.name.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }

    const success = await onSubmit(formData);

    if (success) {
      setFormData(initialState);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nombre de la categoría"
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

      {formError && (
        <p className="text-xs text-[var(--accent-secondary)] font-bold uppercase">{formError}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full mt-4"
      >
        {loading ? 'Procesando...' : 'Crear Categoría'}
      </Button>
    </form>
  );
};

export default CategoryForm;