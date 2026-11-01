import { NavLink } from 'react-router-dom';
import { Activity, Atom, Boxes, BrainCircuit, ChartNoAxesCombined, Database, FileBarChart, Gauge, GraduationCap, Layers3, ShieldCheck } from 'lucide-react';

const items = [
  { to: '/', label: 'Inicio', icon: Gauge },
  { to: '/projects', label: 'Proyectos', icon: Boxes },
  { to: '/fundamentals', label: 'Fundamentos', icon: GraduationCap },
  { to: '/architectures', label: 'Arquitecturas', icon: BrainCircuit },
  { to: '/datasets', label: 'Datasets', icon: Database },
  { to: '/training', label: 'Entrenamientos', icon: Activity },
  { to: '/evaluation', label: 'Evaluación', icon: ChartNoAxesCombined },
  { to: '/models', label: 'Modelos', icon: Layers3 },
  { to: '/reports', label: 'Reportes', icon: FileBarChart },
  { to: '/administration', label: 'Administración', icon: ShieldCheck }
];

export default function Sidebar() {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><Atom size={23} /></div><div className="brand-text"><b>NeuroLab</b><span>ENTERPRISE</span></div></div>
    <div className="workspace-label">MENÚ PRINCIPAL</div>
    <nav className="side-nav">{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} title={label} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="workspace-note">Espacio de trabajo vacío<br/>Agrega tu propia información.</div></div>
  </aside>;
}
