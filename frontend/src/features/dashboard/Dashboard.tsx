import { useEffect, useState } from 'react';
import { ArrowRight, Boxes, Database, FileBarChart, Layers3, Activity, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro, Panel } from '../../components/ui/Elements';

const shortcuts = [
  { to: '/projects', title: 'Proyectos', description: 'Agrega y organiza tus proyectos.', icon: Boxes },
  { to: '/datasets', title: 'Datasets', description: 'Selecciona los archivos que utilizarás.', icon: Database },
  { to: '/models', title: 'Modelos', description: 'Registra la información de tus modelos.', icon: Layers3 },
  { to: '/reports', title: 'Reportes', description: 'Consulta informes cuando tengas registros.', icon: FileBarChart }
];

// URL dinámica basada en las variables de entorno de Vite (Render / Local)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

type DashboardCounts = {
  projects: number;
  datasets: number;
  architectures: number;
  trainings: number;
  active_trainings: number;
  models: number;
  completed_trainings: number;
};

export default function Dashboard() {
  const [counts, setCounts] = useState<DashboardCounts>({
    projects: 0,
    datasets: 0,
    architectures: 0,
    trainings: 0,
    active_trainings: 0,
    models: 0,
    completed_trainings: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard', error);
    }
  };

  const total = counts.projects + counts.datasets + counts.trainings + counts.models + counts.architectures;

  return (
    <div className="page-stack simple-dashboard">
      <PageIntro 
        eyebrow="ESPACIO DE TRABAJO" 
        title="Bienvenido a NeuroLab Enterprise" 
        description="Resumen de tu espacio de trabajo sincronizado con FastAPI y la base de datos." 
      />
      
      <div className="simple-shortcuts">
        {shortcuts.map(({ to, title, description, icon: Icon }) => (
          <Link className="simple-shortcut" to={to} key={to}>
            <div className="simple-shortcut-icon"><Icon size={20}/></div>
            <div>
              <b>{title}</b>
              <p>{description}</p>
            </div>
            <ArrowRight className="simple-shortcut-arrow" size={17}/>
          </Link>
        ))}
      </div>

      <div className="stats-grid">
        {[
          { label: 'Proyectos', value: counts.projects, icon: Boxes },
          { label: 'Datasets', value: counts.datasets, icon: Database },
          { label: 'Entrenamientos', value: counts.trainings, icon: Activity },
          { label: 'Modelos', value: counts.models, icon: BrainCircuit }
        ].map(item => (
          <div className="stat-card" key={item.label}>
            <div className="stat-top">
              <span>{item.label}</span>
              <div className="stat-icon"><item.icon size={17}/></div>
            </div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-change">{item.value ? 'Registrado en DB' : 'A la espera de registros'}</div>
          </div>
        ))}
      </div>

      <Panel title="Estado del sistema" subtitle="Resumen de los registros guardados en PostgreSQL">
        <div className="simple-empty">
          <div className="simple-empty-mark"><CheckCircle2 size={22}/></div>
          <h3>{total ? 'Espacio de trabajo sincronizado' : 'Tu espacio está listo'}</h3>
          <p>
            {total 
              ? `Se detectaron ${total} registros en total en la base de datos entre proyectos, datasets, entrenamientos, modelos y arquitecturas.`
              : 'Empieza por crear un proyecto, cargar un dataset o diseñar tu primera arquitectura neuronal.'
            }
          </p>
          <Link to="/projects" className="text-action">Ir a proyectos <ArrowRight size={15}/></Link>
        </div>
      </Panel>
    </div>
  );
}