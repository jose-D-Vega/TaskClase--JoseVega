import TaskCard from './TaskCard';
import Loading from '../common/Loading';

const TaskList = ({ tasks = [], loading, onDetails, onDelete }) => {
  if (loading && (!tasks || tasks.length === 0)) return <Loading />;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
          {Array.isArray(tasks) ? 'No se encontraron tareas en el sector' : 'Error al cargar el listado de tareas'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDetails={onDetails}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;