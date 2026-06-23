import { useState, useEffect, useCallback } from 'react';
import projectService from '../services/projectService';

export const useProjects = () => {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = useCallback(async (data) => {
    setLoading(true);
    try {
      await projectService.createProject(data);
      await fetchProjects();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProjects]);

  const updateProject = useCallback(async (id, data) => {
    setLoading(true);
    try {
      await projectService.updateProject(id, data);
      await fetchProjects();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id) => {
    setLoading(true);
    try {
      await projectService.deleteProject(id);
      await fetchProjects();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProjects]);

  return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject, setError };
};