import { useEffect, useMemo, useState } from 'react';
import { GitBranch, Layers3, MoreHorizontal, Search, Plus, Trash2 } from 'lucide-react';
import { Button, PageIntro, Panel, SearchInput, Status } from '../../components/ui/Elements';

type ModelRecord = {
  id: number;
  name: string;
  family: string;
  version: string;
  training_job_id: number | null;
  accuracy: number | null;
  status: string;
  metadata_json: {
    project?: string;
    owner?: string;
  };
  created_at: string;
};

type TrainingJob = {
  id: number;
  name: string;
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function ModelRegistry() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [trainings, setTrainings] = useState<TrainingJob[]>([]);
  const [detail, setDetail] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState('');
  const [project, setProject] = useState('');
  const [family, setFamily] = useState('CNN');
  const [trainingJobId, setTrainingJobId] = useState<number | null>(null);
  const [owner, setOwner] = useState('Administrador');
  const [accuracy, setAccuracy] = useState<number>(92.5);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchModels();
    fetchTrainings();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch(`${API_BASE}/models`);
      if (res.ok) {
        const data = await res.json();
        setModels(data);
      }
    } catch (error) {
      console.error('Error al cargar modelos', error);
    }
  };

  const fetchTrainings = async () => {
    try {
      const res = await fetch(`${API_BASE}/trainings`);
      if (res.ok) {
        const data = await res.json();
        setTrainings(data);
        if (data.length > 0) setTrainingJobId(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar entrenamientos', error);
    }
  };

  const visible = useMemo(() => models.filter(m => 
    (m.name.toLowerCase().includes(search.toLowerCase()) || (m.metadata_json?.project || '').toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'Todos' || m.status === filter)
  ), [models, search, filter]);

  const selected = models.find(m => m.id === detail);

  const cycleStatus = async (model: ModelRecord) => {
    const nextStatus = model.status === 'Borrador' ? 'Revisado' :
                       model.status === 'Revisado' ? 'Aprobado' :
                       model.status === 'Aprobado' ? 'Retirado' : 'Borrador';
    try {
      const payload = {
        name: model.name,
        family: model.family,
        version: model.version,
        training_job_id: model.training_job_id,
        accuracy: model.accuracy,
        status: nextStatus,
        metadata_json: model.metadata_json
      };
      
      await fetch(`${API_BASE}/models/${model.id}`, { method: 'DELETE' });
      const res = await fetch(`${API_BASE}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchModels();
      }
    } catch (error) {
      console.error('Error al cambiar estado', error);
    }
  };

  const addModel = async () => {
    if (!name.trim() || !project.trim()) {
      setMessage('Completa el nombre del modelo y el proyecto.');
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        family,
        version: 'v1.0.0',
        training_job_id: trainingJobId,
        accuracy: Number(accuracy) / 100,
        status: 'Borrador',
        metadata_json: {
          project: project.trim(),
          owner: owner.trim() || 'Administrador'
        }
      };

      const res = await fetch(`${API_BASE}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage('Modelo registrado correctamente en la base de datos.');
        setName('');
        setProject('');
        setShowForm(false);
        fetchModels();
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Error al registrar el modelo.');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor.');
    }
  };

  const remove = async (id: number) => {
    if (window.confirm('¿Eliminar este modelo del registro de PostgreSQL?')) {
      try {
        const res = await fetch(`${API_BASE}/models/${id}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
          fetchModels();
          if (detail === id) setDetail(null);
        }
      } catch (error) {
        console.error('Error al eliminar modelo', error);
      }
    }
  };

  const approvedCount = models.filter(m => m.status === 'Aprobado').length;
  const reviewCount = models.filter(m => m.status === 'Revisado' || m.status === 'En revisión').length;
  const familiesCount = new Set(models.map(m => m.family)).size;

  return (
    <div className="page-stack">
      <PageIntro 
        eyebrow="MODEL LIFECYCLE" 
        title="Registro de modelos" 
        description="Registra versiones, consulta metadatos en PostgreSQL y administra el ciclo de revisión." 
        action={<Button onClick={() => { setShowForm(v => !v); setMessage(''); }}><Plus size={15}/> Registrar modelo</Button>}
      />

      <div className="stats-strip">
        <div><span>Modelos registrados</span><b>{String(models.length).padStart(2, '0')}</b></div>
        <div><span>Aprobados</span><b>{String(approvedCount).padStart(2, '0')}</b></div>
        <div><span>En revisión</span><b>{String(reviewCount).padStart(2, '0')}</b></div>
        <div><span>Familias de red</span><b>{familiesCount}</b></div>
      </div>

      {showForm && (
        <Panel title="Registrar nuevo modelo" subtitle="Ingresa los metadatos del modelo para la base de datos">
          <div className="properties-form">
            <div className="form-row">
              <label>
                Nombre del modelo
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Clasificador de imágenes"/>
              </label>
              <label>
                Proyecto asociado
                <input value={project} onChange={e => setProject(e.target.value)} placeholder="Nombre del proyecto"/>
              </label>
            </div>
            <div className="form-row">
              <label>
                Familia de red
                <select value={family} onChange={e => setFamily(e.target.value)}>
                  {['Feedforward / MLP', 'CNN', 'RNN', 'LSTM / GRU', 'Transformer', 'Autoencoder', 'GAN', 'GNN', 'SOM'].map(x => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label>
                Entrenamiento de origen
                <select value={trainingJobId || ''} onChange={e => setTrainingJobId(Number(e.target.value) || null)}>
                  <option value="">Sin entrenamiento vinculado</option>
                  {trainings.map(t => <option key={t.id} value={t.id}>ID {t.id}: {t.name}</option>)}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Responsable
                <input value={owner} onChange={e => setOwner(e.target.value)}/>
              </label>
              <label>
                Accuracy estimado (%)
                <input type="number" step="0.1" min="0" max="100" value={accuracy} onChange={e => setAccuracy(Number(e.target.value))}/>
              </label>
            </div>
            <div className="detail-actions">
              <Button onClick={addModel}>Guardar modelo en BD</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
            {message && <p className="saved-message">{message}</p>}
          </div>
        </Panel>
      )}

      {message && !showForm && <p className="saved-message">{message}</p>}

      <Panel title="Modelos y versiones" subtitle={`${visible.length} registros disponibles en PostgreSQL`}>
        <div className="table-toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar modelo o proyecto..."/>
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            {['Todos', 'Borrador', 'Revisado', 'Aprobado', 'Retirado'].map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MODELO</th>
                <th>FAMILIA</th>
                <th>VERSIÓN</th>
                <th>ACCURACY</th>
                <th>ENTRENAMIENTO ID</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="table-project">
                      <div className="project-icon"><Layers3 size={17}/></div>
                      <div>
                        <b>{m.name}</b>
                        <small>{m.metadata_json?.project || 'Sin proyecto'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{m.family}</td>
                  <td><span className="version-chip">{m.version}</span></td>
                  <td>{m.accuracy !== null && m.accuracy !== undefined ? `${(m.accuracy * 100).toFixed(1)}%` : '—'}</td>
                  <td>{m.training_job_id ? `Job #${m.training_job_id}` : '—'}</td>
                  <td><Status>{m.status}</Status></td>
                  <td>
                    <div className="row-actions">
                      <button title="Ver detalles" onClick={() => setDetail(m.id)}><Search size={15}/></button>
                      <button title="Cambiar estado" onClick={() => cycleStatus(m)}><MoreHorizontal size={16}/></button>
                      <button title="Eliminar modelo" onClick={() => remove(m.id)}><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty-state">No hay modelos que coincidan. Usa “Registrar modelo” para agregar el primero.</div>}
        </div>
      </Panel>

      {selected && (
        <Panel title={`Detalle · ${selected.name}`} subtitle="Metadatos de la versión seleccionada desde la base de datos">
          <div className="model-detail-grid">
            <div><span>Proyecto</span><b>{selected.metadata_json?.project || '—'}</b></div>
            <div><span>Versión</span><b>{selected.version}</b></div>
            <div><span>Familia</span><b>{selected.family}</b></div>
            <div><span>Entrenamiento origen</span><b>{selected.training_job_id ? `Job #${selected.training_job_id}` : '—'}</b></div>
            <div><span>Responsable</span><b>{selected.metadata_json?.owner || 'Administrador'}</b></div>
            <div><span>Fecha de creación</span><b>{new Date(selected.created_at).toLocaleString('es-PE')}</b></div>
          </div>
          <div className="detail-actions">
            <Status>{selected.status}</Status>
            <Button variant="secondary" onClick={() => setDetail(null)}>Cerrar detalle</Button>
            <Button onClick={() => cycleStatus(selected)}>Avanzar estado</Button>
          </div>
          <p className="form-caption"><GitBranch size={14}/> El estado y los registros se almacenan de forma persistente en PostgreSQL.</p>
        </Panel>
      )}
    </div>
  );
}