import axiosClient from '../api/axiosClient';

/**
 * Servicio encargado de gestionar las peticiones relacionadas con las categorías.
 * Centralizamos las llamadas a la API aquí para que los componentes no dependan directamente de Axios.
 */
const categoryService = {
  /**
   * Obtiene la lista de categorías del usuario.
   * @returns {Promise} Lista de categorías
   */
  getCategories: async () => {
    const response = await axiosClient.get('/categories');
    // La API devuelve { success: true, count: X, data: [...] }
    return response.data.data || [];
  },

  /**
   * Busca una categoría específica por su ID.
   * @param {number|string} id ID de la categoría
   * @returns {Promise} Datos de la categoría
   */
  getCategoryById: async (id) => {
    const response = await axiosClient.get(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Crea una nueva categoría.
   * @param {Object} categoryData Datos de la categoría (name, color)
   * @returns {Promise} Categoría creada
   */
  createCategory: async (categoryData) => {
    const response = await axiosClient.post('/categories', categoryData);
    return response.data.data;
  },

  /**
   * Actualiza una categoría existente.
   * @param {number|string} id ID de la categoría a editar
   * @param {Object} categoryData Nuevos datos de la categoría
   * @returns {Promise} Categoría actualizada
   */
  updateCategory: async (id, categoryData) => {
    const response = await axiosClient.put(`/categories/${id}`, categoryData);
    return response.data.data;
  },

  /**
   * Elimina una categoría del sistema.
   * @param {number|string} id ID de la categoría a borrar
   * @returns {Promise} Resultado de la operación
   */
  deleteCategory: async (id) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;