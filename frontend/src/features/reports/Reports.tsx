import { useEffect, useState } from 'react';
import { FileBarChart, Printer, RefreshCw, Download } from 'lucide-react';
import { Button, PageIntro, Panel } from '../../components/ui/Elements';

type ReportSummary = {
  dashboard: {
    projects: number;
    datasets: number;
    architectures: number;
    trainings: number;
    active_trainings: number;
    models: number;
    completed_trainings: number;
  };
  recent_trainings: any[];
  recent_projects: any[];
};

// URL dinámica basada en las variables de entorno de Vite (Render / Local)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function Reports() {
  const [counts, setCounts] = useState({ projects: 0, trainings: 0, models: 0, datasets: 0, architectures: 0 });
  const [title, setTitle] = useState('Informe de experimentación PostgreSQL');
  const [scope, setScope] = useState('Todo el espacio');
  const [generated, setGenerated] = useState(false);
  const [reportData, setReportData] = useState<ReportSummary | null>(null);

  useEffect(() => {
    fetchReportSummary();
  }, []);

  const fetchReportSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/summary`);
      if (res.ok) {
        const data: ReportSummary = await res.json();
        setReportData(data);
        setCounts({
          projects: data.dashboard.projects,
          datasets: data.dashboard.datasets,
          trainings: data.dashboard.trainings,
          models: data.dashboard.models,
          architectures: data.dashboard.architectures
        });
      }
    } catch (error) {
      console.error('Error al cargar resumen del reporte desde la base de datos', error);
    }
  };

  const total = counts.projects + counts.trainings + counts.models + counts.datasets + counts.architectures;

  const exportReport = () => {
    const report = {
      titulo: title,
      alcance: scope,
      fecha: new Date().toLocaleString('es-PE'),
      resumen: counts,
      detalles: reportData,
      nota: 'Reporte oficial sincronizado con FastAPI y PostgreSQL.'
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neurolab-informe-postgresql.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-stack">
      <PageIntro 
        eyebrow="REPORTING & GOVERNANCE" 
        title="Reportes" 
        description="Genera una vista imprimible o exporta un resumen completo de los registros almacenados en PostgreSQL." 
        action={
          <>
            <Button variant="secondary" onClick={fetchReportSummary}><RefreshCw size={15}/> Actualizar</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer size={15}/> Imprimir vista</Button>
          </>
        }
      />
      
      <Panel title="Configurar informe" subtitle="Personaliza el informe con los datos del servidor">
        <div className="properties-form">
          <div className="form-row">
            <label>
              Título del informe
              <input value={title} onChange={e => { setTitle(e.target.value); setGenerated(false); }}/>
            </label>
            <label>
              Alcance
              <select value={scope} onChange={e => { setScope(e.target.value); setGenerated(false); }}>
                <option>Todo el espacio</option>
                <option>Proyectos y datasets</option>
                <option>Entrenamientos y modelos</option>
              </select>
            </label>
          </div>
          <div className="detail-actions">
            <Button onClick={() => { fetchReportSummary(); setGenerated(true); }}><FileBarChart size={15}/> Generar informe</Button>
            <Button variant="secondary" onClick={exportReport}><Download size={15}/> Exportar JSON</Button>
          </div>
          {generated && <p className="saved-message">Informe generado y sincronizado con PostgreSQL.</p>}
        </div>
      </Panel>

      <div className="report-paper">
        <div className="report-paper-head">
          <div className="brand-mark"><FileBarChart size={22}/></div>
          <div>
            <span>NEUROLAB ENTERPRISE</span>
            <h2>{title || 'Informe de experimentación'}</h2>
            <p>Generado: {new Date().toLocaleString('es-PE')} · {scope} · PostgreSQL / FastAPI</p>
          </div>
        </div>
        
        <div className="report-rule"/>
        
        <div className="report-overview">
          <div><span>Proyectos</span><b>{counts.projects}</b></div>
          <div><span>Entrenamientos</span><b>{counts.trainings}</b></div>
          <div><span>Modelos</span><b>{counts.models}</b></div>
          <div><span>Datasets</span><b>{counts.datasets}</b></div>
        </div>

        {total === 0 ? (
          <div className="empty-state">No hay registros en la base de datos. Agrega proyectos, datasets, entrenamientos o modelos para verlos aquí.</div>
        ) : (
          <div className="report-summary">
            <h3>Resumen del espacio (Base de datos)</h3>
            <p>Actualmente hay {counts.projects} proyectos, {counts.datasets} datasets, {counts.trainings} entrenamientos, {counts.models} modelos y {counts.architectures} arquitecturas registradas de forma persistente.</p>
            <p>Este informe refleja de manera estricta los registros consolidados en el motor relacional de PostgreSQL a través de la API.</p>
          </div>
        )}

        <div className="report-paper-foot">
          <span>NeuroLab Enterprise · Servidor Enterprise v1.0</span>
          <span>{total} registros contabilizados en BD</span>
        </div>
      </div>
    </div>
  );
}