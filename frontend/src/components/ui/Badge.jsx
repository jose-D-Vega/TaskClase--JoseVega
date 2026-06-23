
/**
 * Etiqueta pequeña (badge) para mostrar estados o prioridades con colores dinámicos.
 */
const Badge = ({ children, className = '', style }) => {
  return (
    <span className={`cyber-badge ${className}`} style={style}>
      {children}
    </span>
  );
};

export default Badge;
