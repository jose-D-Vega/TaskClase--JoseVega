import { useState, useEffect, useCallback } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TaskCard from './TaskCard';

const TaskSearchById = ({ onSearch, onDetails, onDelete, refreshTrigger, onSearchedIdChange }) => {
  const [searchId, setSearchId]     = useState('');
  const [foundTask, setFoundTask]   = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const executeSearch = useCallback(async (id) => {
    if (!id) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const task = await onSearch(id);
      if (task) {
        setFoundTask(task);
        if (onSearchedIdChange) onSearchedIdChange(task.id);
      } else {
        setFoundTask(null);
        setSearchError('No se encontró ninguna tarea con ese ID.');
      }
    } catch {
      setFoundTask(null);
      setSearchError('Error al buscar la tarea.');
    } finally {
      setIsSearching(false);
    }
  }, [onSearch, onSearchedIdChange]);

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(searchId);
  };

  // ── Limpiar búsqueda ──
  const handleClear = () => {
    setSearchId('');
    setFoundTask(null);
    setSearchError(null);
    if (onSearchedIdChange) onSearchedIdChange(null);
  };

  // ── Refrescar la tarea mostrada cuando se cierra el modal de detalle ──
  // refreshTrigger cambia cada vez que updateTask se llama con éxito en el padre
  useEffect(() => {
    if (refreshTrigger && foundTask) {
      const triggerId = refreshTrigger.toString().split('_')[0];
      if (triggerId === foundTask.id.toString()) {
        executeSearch(triggerId);
      }
    }
  }, [refreshTrigger]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-3 mb-4">
        <Input
          label="Buscar por ID"
          name="searchId"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="ID numérico..."
          type="number"
          className="flex-1"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button type="submit" disabled={isSearching || !searchId} className="flex-1 sm:flex-none">
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
          {(foundTask || searchError || searchId) && (
            <Button type="button" onClick={handleClear} className="flex-1 sm:flex-none">
              Limpiar
            </Button>
          )}
        </div>
      </form>

      {searchError && (
        <p className="text-xs text-[var(--accent-secondary)] font-bold uppercase mb-4">{searchError}</p>
      )}

      {foundTask && (
        <div className="border-2 border-[var(--accent-secondary)]/30 rounded-lg p-1 bg-[var(--accent-secondary)]/5">
          <div className="text-[10px] font-bold text-[var(--accent-secondary)] uppercase px-3 py-1">
            Resultado de búsqueda:
          </div>
          <TaskCard
            task={foundTask}
            onDetails={onDetails}
            onDelete={() => {
              onDelete(foundTask.id);
              setFoundTask(null);
              setSearchId('');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TaskSearchById;