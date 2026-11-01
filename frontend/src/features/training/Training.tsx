import { useEffect, useState } from 'react';
import { Activity, CircleStop, Play } from 'lucide-react';
import { Button, PageIntro, Panel, Status } from '../../components/ui/Elements';

type DatasetRecord = {
  id: number;
  name: string;
  record_count: number;
  columns: string[];
  size_bytes: number;
};

type ArchitectureRecord = {
  id: number;
  name: string;
  family: string;
};

type ProjectRecord = {
  id: number;
  name: string;
};

type TrainingJob = {
  id: number;
  public_id: string;
  name: string;
  architecture: string;
  dataset_id: number | null;
  project_id: number | null;
  epochs: number;
  batch_size: number;
  optimizer: string;
  status: string;
  progress: number;
  created_at: string;
};

const API_BASE = 'http://localhost:8000/api/v1';

export default function Training() {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [architectures, setArchitectures] = useState<ArchitectureRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  
  const [name, setName] = useState('');
  const [architecture, setArchitecture] = useState('');
  const [datasetId, setDatasetId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [epochs, setEpochs] = useState(30);
  const [batch, setBatch] = useState(32);
  const [optimizer, setOptimizer] = useState('Adam');
  const [message, setMessage] = useState('');

  // Cargar datos iniciales y configurar Polling en tiempo real
  useEffect(() => {
    fetchDatasets();
    fetchArchitectures();
    fetchProjects();
    fetchJobs();

    const interval = setInterval(() => {
      fetchJobs();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${API_BASE}/datasets`);
      if (res.ok) setDatasets(await res.json());
    } catch (error) {
      console.error('Error al cargar datasets', error);
    }
  };

  const fetchArchitectures = async () => {
    try {
      const res = await fetch(`${API_BASE}/architectures`);
      if (res.ok) setArchitectures(await res.json());
    } catch (error) {
      console.error('Error al cargar arquitecturas', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) setProjects(await res.json());
    } catch (error) {
      console.error('Error al cargar proyectos', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/trainings`);
      if (res.ok) setJobs(await res.json());
    } catch (error) {
      console.error('Error al cargar entrenamientos', error);
    }
  }

  const start = async () => {
    if (!name.trim() || !architecture || !datasetId) {
      setMessage('Completa el nombre, selecciona una arquitectura y un dataset registrado.');
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        architecture,
        dataset_id: Number(datasetId),
        project_id: projectId ? Number(projectId) : null, // <-- Enviamos el project_id a FastAPI
        epochs: Number(epochs),
        batch_size: Number(batch),
        optimizer
      };

      const res = await fetch(`${API_BASE}/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage('Entrenamiento registrado y enviado a cola en PostgreSQL.');
        setName('');
        setProjectId(null);
        fetchJobs();
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Error al registrar el entrenamiento.');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor.');
    }
  };

  const updateJobStatus = async (id: number, status: string, progress: number) => {
    try {
      const res = await fetch(`${API_BASE}/trainings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, progress, metrics: { accuracy: 0.94 } })
      });
      if (res.ok) fetchJobs();
    } catch (error) {
      console.error('Error al actualizar estado', error);
    }
  };

  const activeCount = jobs.filter(j => j.status === 'Ejecutando' || j.status === 'En cola').length;
  const queuedCount = jobs.filter(j => j.status === 'Pendiente' || j.status === 'En cola').length;
  const completedCount = jobs.filter(j => j.status === 'Completado').length;
  const failedCount = jobs.filter(j => j.status === 'Fallido').length;

  return (
    <div className="page-stack">
      <PageIntro 
        eyebrow="EXPERIMENT TRACKING" 
        title="Entrenamientos" 
        description="Configura ejecuciones y observa su estado persistido en PostgreSQL mediante FastAPI." 
        action={<span className="demo-pill large"><span/> BACKEND ACTIVO</span>}
      />
      
      <div className="stats-strip">
        <div><span>En ejecución / cola</span><b>{String(activeCount).padStart(2, '0')}</b></div>
        <div><span>Pendientes</span><b>{String(queuedCount).padStart(2, '0')}</b></div>
        <div><span>Completados</span><b>{String(completedCount).padStart(2, '0')}</b></div>
        <div><span>Fallidos</span><b>{String(failedCount).padStart(2, '0')}</b></div>
      </div>

      <div className="two-column training-columns">
        <Panel title="Configurar entrenamiento" subtitle="Define los parámetros de tu experimento para la BD">
          <div className="properties-form">
            <label>
              Nombre del experimento
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Prueba de clasificación"/>
            </label>

<label>
  Proyecto Asociado
  <select value={projectId || ''} onChange={e => setProjectId(Number(e.target.value) || null)}>
    <option value="">Seleccionar proyecto</option>
    {projects.map(proj => (
      <option key={proj.id} value={proj.id}>
        {proj.name}
      </option>
    ))}
  </select>
</label>
            
            <label>
              Arquitectura
              <select value={architecture} onChange={e => setArchitecture(e.target.value)}>
                <option value="">Seleccionar arquitectura guardada</option>
                {architectures.map(arch => (
                  <option key={arch.id} value={arch.name}>
                    {arch.name} ({arch.family})
                  </option>
                ))}
              </select>
            </label>
            
            <label>
              Dataset
              <select value={datasetId || ''} onChange={e => { setDatasetId(Number(e.target.value) || null); setMessage(''); }}>
                <option value="">Seleccionar dataset</option>
                {datasets.map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name} — {dataset.record_count} registros
                  </option>
                ))}
              </select>
            </label>
            
            <div className="form-row">
              <label>Épocas<input type="number" min="1" max="500" value={epochs} onChange={e => setEpochs(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}/></label>
              <label>Batch size<select value={batch} onChange={e => setBatch(Number(e.target.value))}>{[16, 32, 64, 128].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
            </div>
            
            <label>
              Optimizador
              <select value={optimizer} onChange={e => setOptimizer(e.target.value)}>
                {['Adam', 'SGD', 'RMSprop', 'Adagrad'].map(x => <option key={x}>{x}</option>)}
              </select>
            </label>
            
            {message && <div className={message.startsWith('Error') || message.startsWith('Completa') ? 'dataset-error' : 'dataset-success'} role="status">{message}</div>}
            
            <Button onClick={start} disabled={!name.trim() || !architecture || !datasetId || epochs < 1}>
              <Play size={15}/> Enviar a cola (Backend)
            </Button>
            
            <p className="form-caption">Los trabajos se registran de forma persistente en PostgreSQL y son procesados por la API.</p>
          </div>
        </Panel>

        <Panel title="Ejecuciones recientes" subtitle="Estado y progreso almacenado en el servidor">
          <div className="training-list">
            {jobs.length === 0 && <div className="empty-state">No hay entrenamientos registrados en la base de datos.</div>}
            {jobs.map(j => (
              <article className="training-item" key={j.id}>
                <div className="training-item-top">
                  <div className="training-symbol"><Activity size={17}/></div>
                  <div className="training-title">
                    <b>{j.public_id || `#${j.id}`} <span>{j.name}</span></b>
                    <small>{j.architecture} · Optimizer: {j.optimizer} · Batch: {j.batch_size}</small>
                  </div>
                  <Status>{j.status}</Status>
                </div>
                
                <div className="training-progress-head">
                  <span>Progreso en BD</span>
                  <b>{j.progress}%</b>
                </div>
                
                <div className="progress-track">
                  <i style={{ width: `${j.progress}%` }}/>
                </div>
                
                <div className="training-meta">
                  <span>Épocas: {j.epochs}</span>
                  <span>Creado: {j.created_at ? new Date(j.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                
                <div className="training-item-actions">
                  {j.status === 'Ejecutando' || j.status === 'Pendiente' ? (
                    <Button variant="secondary" onClick={() => updateJobStatus(j.id, 'Cancelado', j.progress)}>
                      <CircleStop size={14}/> Cancelar trabajo
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => updateJobStatus(j.id, 'Completado', 100)}>
                      Marcar completado
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <div className="info-callout">
        <Activity size={17}/>
        <div>
          <b>Ejecución sincronizada con FastAPI y PostgreSQL</b>
          <p>Los ciclos de vida, estados y parámetros de entrenamiento se gestionan directamente a través de las tablas relacionales del backend.</p>
        </div>
      </div>
    </div>
  );
}