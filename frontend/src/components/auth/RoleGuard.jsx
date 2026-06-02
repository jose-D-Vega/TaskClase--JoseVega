import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

/**
 * Componente para proteger rutas basadas en roles de usuario.
 * Funciona como una envoltura (wrapper) que decide si renderizar 
 * el contenido protegido o redirigir al usuario.
 * 
 * @param {Array} allowedRoles - Lista de roles permitidos (ej: ['admin'])
 */
const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // 1. Estado de carga: Evita parpadeos mientras verificamos la sesión
  if (loading) return <Loading />;

  // 2. Autenticación básica: Si no hay usuario, fuera.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Validación de Rol: Comprobamos si el rol del usuario está permitido
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`[SEGURIDAD] Intento de acceso no autorizado. Rol: ${user.role}`);
    return <Navigate to="/" replace />;
  }

  // 4. Acceso concedido: Renderizamos las rutas anidadas
  return <Outlet />;
};

export default RoleGuard;
