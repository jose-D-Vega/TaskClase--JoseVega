import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="cyber-card !p-0 !rounded-none border-t-0 border-x-0 mb-8 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex flex-col group">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-fuchsia uppercase tracking-tighter italic group-hover:from-cyber-fuchsia group-hover:to-cyber-cyan transition-all duration-500">
            TaskFlow
          </h1>
          <p className="text-[var(--text-muted)] text-[9px] font-mono uppercase tracking-[0.3em]">
            Digital Task Manager
          </p>
        </Link>

        <nav className="flex items-center gap-6">
          {user && (
            <div className="hidden md:flex items-center gap-4 mr-4 border-r border-[var(--border-color)] pr-6">
              <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-cyber-cyan transition-colors">
                Tareas
              </Link>
              <Link to="/projects" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-cyber-cyan transition-colors">
                Proyectos
              </Link>
              <Link to="/categories" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-cyber-cyan transition-colors">
                Categorías
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-cyber-cyan transition-colors">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-cyber-cyan transition-colors">
                Perfil
              </Link>
            </div>
          )}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors text-[var(--accent-primary)]"
            title="Cambiar tema"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-3 border-l border-[var(--border-color)] pl-4 hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[var(--text-primary)]">{user.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{user.email}</p>
                </div>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-cyber-cyan/30 shadow-cyber-cyan/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <Button 
                variant="ghost" 
                className="text-[10px] !py-1 !px-2 text-cyber-fuchsia hover:bg-cyber-fuchsia/10 border-cyber-fuchsia/20"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-cyber-cyan transition-colors">
                Login
              </Link>
              <Link to="/register">
                <Button variant="primary" className="!py-1.5 !px-4 text-[10px]">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
