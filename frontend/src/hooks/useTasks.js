import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';
import subtaskService from '../services/subtaskService';

/**
 * Hook personalizado para gestionar el estado de las tareas y las operaciones CRUD.
 * Centraliza la lógica para que los componentes sean más limpios y se centren en la UI.
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    user_id: ''
  });

  /**
   * Carga las tareas aplicando los filtros actuales.
   */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Limpiamos filtros vacíos antes de enviar
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const data = await taskService.getTasks(activeFilters);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Carga las estadísticas globales.
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await taskService.getTaskStats();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

  /**
   * Efecto para cargar datos iniciales y reaccionar a cambios en filtros.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  /**
   * Busca una tarea por ID.
   */
  const findTaskById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const task = await taskService.getTaskById(id);
      return task;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nueva tarea y recarga la lista.
   */
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    try {
      // Separamos las subtareas del resto de datos de la tarea
      const { subtasks, ...taskFields } = taskData;

      const createdTask = await taskService.createTask(taskFields);

      // Si hay subtareas, las creamos en bulk justo después
      if (subtasks && subtasks.length > 0) {
        await subtaskService.bulkCreateSubtasks(createdTask.id, subtasks);
      }

      await fetchTasks();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTasks, fetchStats]);

  /**
   * Actualiza una tarea y recarga la lista.
   */
  const updateTask = useCallback(async (id, taskData) => {
    setLoading(true);
    try {
      await taskService.updateTask(id, taskData);
      await fetchTasks();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTasks, fetchStats]);

  /**
   * Elimina una tarea y recarga la lista.
   */
  const deleteTask = useCallback(async (id) => {
    setLoading(true);
    try {
      await taskService.deleteTask(id);
      await fetchTasks();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTasks, fetchStats]);

  /**
   * Actualiza el estado de los filtros.
   */
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return {
    tasks,
    stats,
    loading,
    error,
    filters,
    fetchTasks,
    findTaskById,
    createTask,
    updateTask,
    deleteTask,
    handleFilterChange,
    setError
  };
};
