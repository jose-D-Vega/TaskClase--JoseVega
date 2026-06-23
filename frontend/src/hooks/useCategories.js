import { useState, useEffect, useCallback } from 'react';
import categoryService from '../services/categoryService';

/**
 * Hook personalizado para gestionar el estado de las categorías y las operaciones CRUD.
 * Centraliza la lógica para que los componentes sean más limpios y se centren en la UI.
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga la lista de categorías del usuario.
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Efecto para cargar datos iniciales.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Crea una nueva categoría y recarga la lista.
   */
  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    try {
      await categoryService.createCategory(categoryData);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Actualiza una categoría y recarga la lista.
   */
  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    try {
      await categoryService.updateCategory(id, categoryData);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Elimina una categoría y recarga la lista.
   */
  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    try {
      await categoryService.deleteCategory(id);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setError
  };
};