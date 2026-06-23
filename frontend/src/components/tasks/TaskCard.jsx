import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { translateStatus, translatePriority, getStatusStyles, getPriorityStyles, formatDate } from '../../utils/formatters';

const TaskCard = ({ task, onEdit, onDelete, onDetails }) => {
  const { user } = useAuth();

  return (
    <div className="bg-[var(--bg-primary)]/40 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 p-4 rounded-lg transition-all group flex flex-col h-full shadow-sm hover:shadow-cyber-cyan/10">

      {/* ── Cabecera: título + ID ── */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 overflow-hidden leading-snug">
          {task.title}
        </h3>
        <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0 ml-2 mt-1">
          ID: #{task.id}
        </span>
      </div>

      {/* ── Descripción expandible con scroll si es muy larga ── */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 overflow-y-auto max-h-24 leading-relaxed pr-1 flex-shrink-0 cyber-scroll">
        {task.description || 'Sin descripción'}
      </p>

      {/* ── Estado y Prioridad ── */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={getStatusStyles(task.status)}>
          {translateStatus(task.status)}
        </Badge>
        <Badge className={getPriorityStyles(task.priority)}>
          {translatePriority(task.priority)}
        </Badge>
      </div>

      {/* ── Categorías (sección separada, con label) ── */}
      {task.categories && task.categories.length > 0 && (
        <div className="mb-4">
          <span className="block text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-70">
            Categorías
          </span>
          {/* Lista de categorías */}
          <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto pr-1 cyber-scroll mt-3">
            {task.categories.map((category) => (
              <Badge
                key={category.id}
                className="border"
                style={{
                  borderColor: `${category.color}80`,
                  color: category.color,
                  backgroundColor: `${category.color}1A`
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ── Spacer para empujar el footer hacia abajo ── */}
      <div className="flex-grow" />

      {/* ── Metadatos ── */}
      <div className="grid grid-cols-2 gap-y-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-tighter mb-4 pt-3 border-t border-[var(--border-color)]/50">
        <div>
          <span className="block opacity-70">Usuario</span>
          <span className="text-[var(--text-secondary)] truncate block">
            {user?.name || `USR_${task.user_id?.toString().padStart(3, '0')}`}
          </span>
        </div>
        <div>
          <span className="block opacity-70">Vencimiento</span>
          <span className="text-[var(--text-secondary)]">{formatDate(task.due_date)}</span>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
        <button
          onClick={() => onDetails(task)}
          className="text-[10px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors uppercase tracking-widest px-2 py-1"
        >
          Ver Detalles
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-[10px] font-bold text-[var(--accent-secondary)] hover:opacity-80 transition-colors uppercase tracking-widest px-2 py-1"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;