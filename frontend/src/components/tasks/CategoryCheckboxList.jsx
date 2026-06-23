import { useCategories } from '../../hooks/useCategories';

/**
 * Lista de checkboxes para seleccionar múltiples categorías.
 * @param {Array} value Array de IDs de categorías seleccionadas
 * @param {Function} onChange Callback que recibe el nuevo array de IDs
 */
const CategoryCheckboxList = ({ value = [], onChange }) => {
  const { categories } = useCategories();

  const toggleCategory = (categoryId) => {
    const exists = value.includes(categoryId);
    const newValue = exists
      ? value.filter(id => id !== categoryId)
      : [...value, categoryId];
    onChange(newValue);
  };

  if (categories.length === 0) {
    return (
      <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">
        No hay categorías creadas
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1 mb-1">
        Categorías
      </label>
      <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto p-2 border border-[var(--border-color)] rounded-md">
        {categories.map((category) => (
          <label
            key={category.id}
            className="flex items-center gap-2 cursor-pointer text-xs"
          >
            <input
              type="checkbox"
              checked={value.includes(category.id)}
              onChange={() => toggleCategory(category.id)}
              className="accent-[var(--accent-primary)] w-4 h-4 cursor-pointer"
            />
            <span
              className="px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase"
              style={{
                borderColor: `${category.color}80`,
                color: category.color,
                backgroundColor: `${category.color}1A`
              }}
            >
              {category.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoryCheckboxList;