import axios from 'axios';

/**
 * Axios es una librería cliente HTTP basada en promesas para el navegador y node.js.
 * Nos permite realizar peticiones a servicios REST de forma sencilla.
 */
/**
 * Determina la URL base de la API de forma dinámica.
 * Prioriza la variable de entorno, pero si no existe, intenta usar el hostname actual.
 * Esto permite que la app funcione tanto en localhost como en red local sin cambiar el .env.
 */
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Fallback dinámico para desarrollo en red local
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:4000/api`;
  }
  
  return 'http://localhost:4000/api';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  withCredentials: true // Importante para enviar cookies (Refresh Token)
});

/**
 * Variable para guardar una referencia a la función de cierre de sesión
 * Esto nos permite cerrar la sesión desde fuera de los componentes de React
 */
let logoutCallback = () => {
  sessionStorage.removeItem('accessToken');
  // No usamos window.location.href para evitar recargas bruscas, 
  // pero dejamos este fallback por si no se ha registrado el callback
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

/**
 * Permite registrar la función de logout desde AuthContext para que Axios pueda usarla
 */
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Interceptor de peticiones: Adjuntar el token si existe
axiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables para gestionar la cola de peticiones durante el refresh
let isRefreshing = false;
let failedQueue = [];

/**
 * Procesa la cola de peticiones fallidas una vez obtenido el nuevo token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Interceptor de respuestas: Manejar renovación automática de token (Silent Refresh)
 * 
 * Este interceptor captura las respuestas de error. Si el error es 401 (Unauthorized),
 * intenta renovar el access token usando el refresh token almacenado en las cookies.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Verificar si es un error de autenticación (401 o 403)
    // - 401: Unauthorized (Token expirado)
    // - 403: Forbidden (Token inválido o falta de permisos)
    // El error 403 se incluye aquí porque algunos backends lo devuelven 
    // cuando el token es malformado o ha sido manipulado.
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isLoginPage = originalRequest.url.includes('/auth/login');
    const isRefreshPage = originalRequest.url.includes('/auth/refresh');

    if (isAuthError && !originalRequest._retry && !isLoginPage && !isRefreshPage) {
      
      if (isRefreshing) {
        // MECANISMO DE COLA: Si ya estamos renovando el token, no disparamos 
        // otra petición de refresh. En su lugar, guardamos la promesa y la
        // resolveremos cuando el refresh en curso termine exitosamente.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          // Cuando el token se renueva, actualizamos el header y reintentamos
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      // Marcamos que hemos reintentado y que estamos en proceso de refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 2. Intentar obtener un nuevo access token (SILENT REFRESH)
        // Se envía el refresh token automáticamente a través de cookies (withCredentials: true)
        const baseURL = axiosClient.defaults.baseURL.endsWith('/') 
          ? axiosClient.defaults.baseURL.slice(0, -1) 
          : axiosClient.defaults.baseURL;
          
        const res = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.data.success) {
          const newToken = res.data.accessToken;
          
          // 3. Actualizamos el token en el almacenamiento local
          sessionStorage.setItem('accessToken', newToken);
          
          // 4. Liberamos todas las peticiones encoladas con el nuevo token
          processQueue(null, newToken);
          
          // 5. Reintentamos la petición original que disparó el error
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // 6. Si el refresh falla (ej: refresh token expirado), vaciamos la cola
        // y ejecutamos el cierre de sesión para limpiar el estado de la app.
        processQueue(refreshError, null);
        console.error('La sesión ha caducado completamente. Redirigiendo...');
        logoutCallback();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Manejo de otros errores
    const customError = {
      message: error.response?.data?.message || 'Ocurrió un error inesperado',
      status: error.response?.status || 500,
      data: error.response?.data || null
    };

    return Promise.reject(customError);
  }
);

export default axiosClient;
