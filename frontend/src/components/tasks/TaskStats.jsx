const TaskStats = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    { label: 'Total',      value: stats.total ?? 0,                    color: 'text-[var(--accent-primary)]' },
    { label: 'Pendientes', value: stats.by_status?.pending ?? 0,       color: 'text-yellow-500' },
    { label: 'Progreso',   value: stats.by_status?.in_progress ?? 0,   color: 'text-[var(--accent-tertiary)]' },
    { label: 'Completas',  value: stats.by_status?.completed ?? 0,     color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className="cyber-card py-3 px-2 flex flex-col items-center justify-center min-w-0">
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 text-center leading-tight">
            {item.label}
          </span>
          <span className={`text-xl font-black ${item.color} font-mono`}>
            {item.value.toString().padStart(2, '0')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;