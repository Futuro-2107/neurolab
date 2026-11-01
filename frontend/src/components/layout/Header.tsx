import { useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const titles: Record<string, string> = {
  '/': 'Inicio', '/projects': 'Proyectos', '/fundamentals': 'Fundamentos neuronales',
  '/architectures': 'Arquitecturas', '/datasets': 'Datasets', '/training': 'Entrenamientos',
  '/evaluation': 'Evaluación', '/models': 'Modelos', '/reports': 'Reportes',
  '/administration': 'Administración'
};

export default function Header() {
  const location = useLocation();
  const title = titles[location.pathname] || 'NeuroLab Enterprise';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/'; // Redirige y limpia el estado para mostrar el login
  };

  return (
    <header className="topbar simple-topbar">
      <div className="topbar-title">
        <div className="breadcrumbs">NeuroLab Enterprise <span>/</span> <b>{title}</b></div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="topbar-status">
          <span className="status-dot"/> Listo para agregar información
        </div>
        <button 
          onClick={handleLogout}
          title="Cerrar sesión"
          className="icon-button"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '0 12px', fontSize: '11px', color: '#ff7c88', borderColor: '#482632', background: '#221419' }}
        >
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}