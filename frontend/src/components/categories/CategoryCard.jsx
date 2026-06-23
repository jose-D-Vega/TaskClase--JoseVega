import Badge from '../ui/Badge';

const CategoryCard = ({ category, onEdit, onDelete }) => {
  return (
    <div className="bg-[var(--bg-primary)]/40 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 p-4 rounded-lg transition-all group flex flex-col h-full shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 overflow-hidden">
          {category.name}
        </h3>
        <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0 ml-2">ID: #{category.id}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          className="border"
          style={{
            borderColor: `${category.color}80`,
            color: category.color,
            backgroundColor: `${category.color}1A`
          }}
        >
          {category.color}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-y-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-tighter mb-4 flex-grow">
        <div>
          <span className="block text-[var(--text-muted)] opacity-70">Tareas asociadas</span>
          <span className="text-[var(--text-secondary)]">{category.task_count ?? 0}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
        <button
          onClick={() => onEdit(category)}
          className="text-[10px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors uppercase tracking-widest px-2 py-1"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="text-[10px] font-bold text-[var(--accent-secondary)] hover:opacity-80 transition-colors uppercase tracking-widest px-2 py-1"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;