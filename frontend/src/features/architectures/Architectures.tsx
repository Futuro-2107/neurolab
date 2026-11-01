import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, CircleAlert, Layers, Plus, RotateCcw, Save, Trash2, Box, Cuboid } from 'lucide-react';
import type { NeuralLayer } from '../../types';
import { Button, PageIntro, Panel } from '../../components/ui/Elements';

const families = [
  {name:'Feedforward',short:'FFN',desc:'La información fluye desde la entrada hacia la salida sin ciclos.',use:'Predicción tabular, regresión y clasificación.'},
  {name:'RNN',short:'RNN',desc:'Procesa secuencias y conserva información de pasos anteriores.',use:'Series temporales y secuencias de texto.'},
  {name:'CNN',short:'CNN',desc:'Usa filtros convolucionales para detectar patrones espaciales.',use:'Imágenes y reconocimiento visual.'},
  {name:'GAN',short:'GAN',desc:'Combina un generador y un discriminador que compiten durante el aprendizaje.',use:'Generación de muestras y aumento de datos.'}
];
const layerOptions=['Dense','Dropout','Flatten','Conv2D','MaxPooling2D','LSTM','GRU','SimpleRNN','Salida'];
const API_BASE = 'http://localhost:8000/api/v1';

type ArchitectureRecord = {
  id: number;
  name: string;
  family: string;
  layers: NeuralLayer[];
  parameters_estimate: number;
  project_id: number | null;
  created_at: string;
};

type Project = {
  id: number;
  name: string;
};

const initialLayers: NeuralLayer[]=[
  {id:1,name:'Entrada',type:'Input',units:10,activation:'—'},
  {id:2,name:'Salida',type:'Dense',units:2,activation:'Softmax'}
];

export default function Architectures() {
  const [family, setFamily] = useState('Feedforward');
  const [layers, setLayers] = useState<NeuralLayer[]>(initialLayers);
  const [selected, setSelected] = useState(layers[0]?.id || 0);
  const [message, setMessage] = useState('');
  const [view, setView] = useState<'2d'|'3d'>('2d');
  const [savedDesigns, setSavedDesigns] = useState<ArchitectureRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [archName, setArchName] = useState('Mi Arquitectura');

  const current = layers.find(l => l.id === selected);
  const params = useMemo(() => layers.reduce((sum, l, i) => sum + (l.type === 'Dense' && i > 0 ? ((layers[i - 1]?.units || 1) + 1) * l.units : 0), 0), [layers]);
  
  const update = (key: keyof NeuralLayer, value: string | number) => setLayers(old => old.map(l => l.id === selected ? {...l, [key]: value} : l));
  
  const addLayer = (type = 'Dense') => {
    const nextId = Math.max(0, ...layers.map(l => l.id)) + 1;
    const layer: NeuralLayer = {
      id: nextId,
      name: `${type} ${layers.length + 1}`,
      type,
      units: type === 'Dropout' ? 20 : 32,
      activation: type === 'Dropout' ? '—' : 'ReLU'
    };
    setLayers(old => [...old, layer]);
    setSelected(nextId);
    setMessage('Capa añadida al lienzo.');
  };

  const remove = () => {
    if (!current) return;
    if (current.type === 'Input' || current.name.toLowerCase() === 'salida') {
      setMessage('Para conservar una estructura válida, cambia o ajusta esta capa en lugar de eliminarla.');
      return;
    }
    setLayers(old => old.filter(l => l.id !== selected));
    setSelected(layers.find(l => l.id !== selected)?.id || 0);
    setMessage('Capa eliminada del diseño.');
  };

  const validate = () => {
    const errors: string[] = [];
    if (layers.length < 2) errors.push('Agrega al menos una capa de entrada y una de salida.');
    if (layers.some(l => l.units < 1)) errors.push('Todas las capas deben tener unidades mayores a cero.');
    if (layers[0]?.type !== 'Input') errors.push('La primera capa debe ser Input.');
    setMessage(errors.length ? `Revisión local: ${errors.join(' ')}` : 'Diseño revisado correctamente. Configuración lista para enviar al backend.');
  };

  useEffect(() => {
    fetchArchitectures();
    fetchProjects();
  }, []);

  const fetchArchitectures = async () => {
    try {
      const res = await fetch(`${API_BASE}/architectures`);
      if (res.ok) {
        const data = await res.json();
        setSavedDesigns(data);
      }
    } catch (error) {
      console.error('Error al cargar arquitecturas', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar proyectos', error);
    }
  };

  const save = async () => {
    if (layers.length < 2) {
      setMessage('La arquitectura requiere al menos dos capas.');
      return;
    }
    try {
      const payload = {
        name: archName,
        family,
        layers,
        parameters_estimate: params,
        project_id: selectedProjectId
      };
      const res = await fetch(`${API_BASE}/architectures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMessage('Arquitectura guardada exitosamente en la base de datos.');
        fetchArchitectures();
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Error al guardar la arquitectura.');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor.');
    }
  };

  const deleteArch = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/architectures/${id}`, {
        method: 'DELETE'
      });
      if (res.ok || res.status === 204) {
        setMessage('Arquitectura eliminada de la base de datos.');
        fetchArchitectures();
      } else {
        setMessage('No se pudo eliminar la arquitectura.');
      }
    } catch (error) {
      setMessage('Error de conexión al eliminar.');
    }
  };

  const latestSaved = savedDesigns[0];

  return (
    <div className="page-stack">
      <PageIntro 
        eyebrow="LABORATORIO VISUAL" 
        title="Diseñador de arquitecturas" 
        description="Define la familia de red, agrega capas y visualiza la arquitectura en 2D o 3D conectada al backend." 
        action={
          <Button variant="secondary" onClick={() => { setFamily('Feedforward'); setLayers(initialLayers); setSelected(1); setView('2d'); setMessage('Diseño restablecido.'); }}>
            <RotateCcw size={15}/> Restablecer
          </Button>
        }
      />
      
      <Panel title="Familia de red neuronal" subtitle="Selecciona una familia para consultar sus características">
        <div className="family-grid">
          {families.map(f => (
            <button 
              key={f.name} 
              onClick={() => { setFamily(f.name); setMessage(`${f.name} seleccionado. Ajusta las capas según sus requisitos.`); }} 
              className={`family-card ${family === f.name ? 'chosen' : ''}`}
            >
              <div className="family-card-top">
                <span>{f.short}</span>
                {family === f.name && <Check size={16}/>}
              </div>
              <b>{f.name}</b>
              <p>{f.desc}</p>
              <small>{f.use}</small>
            </button>
          ))}
        </div>
      </Panel>

      <div className="designer-grid">
        <Panel title="Capas disponibles" subtitle="Añade una capa al lienzo">
          <div className="layer-option-list">
            {layerOptions.map(opt => (
              <button key={opt} onClick={() => addLayer(opt)}>
                <span className="layer-option-icon"><Layers size={15}/></span>
                <span>
                  {opt}
                  <small>{opt === 'Dense' ? 'Totalmente conectada' : opt === 'Dropout' ? 'Regularización' : opt === 'Conv2D' ? 'Convolución 2D' : 'Componente de red'}</small>
                </span>
                <Plus size={15}/>
              </button>
            ))}
          </div>
          <div className="demo-form-note">El lienzo es una representación visual de la red conectada a FastAPI.</div>
        </Panel>

        <Panel 
          title="Lienzo de arquitectura" 
          subtitle={`${family} · ${layers.length} capas`} 
          action={
            <div className="canvas-view-switch">
              <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}><Box size={13}/> 2D</button>
              <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}><Cuboid size={13}/> 3D</button>
            </div>
          } 
          className="architecture-canvas-panel"
        >
          <div className="properties-form" style={{ marginBottom: '1rem' }}>
            <div className="form-row">
              <label>
                Nombre de la arquitectura
                <input value={archName} onChange={e => setArchName(e.target.value)} placeholder="Ej. Red Neuronal MLP" />
              </label>
              <label>
                Asociar a Proyecto
                <select value={selectedProjectId || ''} onChange={e => setSelectedProjectId(Number(e.target.value) || null)}>
                  <option value="">Sin proyecto asociado</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className={`architecture-canvas architecture-canvas-${view}`}>
            <div className="canvas-grid-bg"/>
            <div className={`canvas-flow ${view === '3d' ? 'canvas-flow-3d' : ''}`}>
              {layers.map((layer, i) => (
                <div className="canvas-layer-wrap" key={layer.id}>
                  <button className={`canvas-layer ${selected === layer.id ? 'selected' : ''}`} onClick={() => setSelected(layer.id)}>
                    <span className="canvas-layer-type">{layer.type}</span>
                    <b>{layer.name}</b>
                    <span>{layer.units} {layer.type === 'Dropout' ? '%' : 'unidades'}</span>
                    <div className="neuron-dots" aria-label="Neuronas animadas">
                      {Array.from({length: Math.min(layer.units, 8)}, (_, n) => <i key={n} style={{animationDelay: `${(n % 4) * 0.18}s`}}/>)}
                    </div>
                  </button>
                  {i < layers.length - 1 && (
                    <div className="layer-connector animated-connector" aria-hidden="true">
                      <span/><span/><span/><i className="signal-pulse"/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="canvas-footer">
            <span><i className="legend-blue"/> Capa seleccionada</span>
            <span>{layers.length} capas · {params.toLocaleString()} parámetros aprox.</span>
          </div>

          <div className="canvas-actions">
            <Button variant="secondary" onClick={() => addLayer('Dense')}><Plus size={15}/> Agregar Dense</Button>
            <Button variant="secondary" onClick={validate}><Check size={15}/> Validar diseño</Button>
            <Button onClick={save}><Save size={15}/> Guardar arquitectura en DB</Button>
          </div>

          {latestSaved && (
            <div className="saved-architecture-card">
              <div className="saved-architecture-heading">
                <div>
                  <span className="eyebrow">ÚLTIMO DISEÑO EN BASE DE DATOS</span>
                  <b>{latestSaved.name} ({latestSaved.family})</b>
                  <small>{new Date(latestSaved.created_at).toLocaleString('es-PE')}</small>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="saved-architecture-badge"><Check size={13}/> Guardado</span>
                  <button className="icon-action" title="Eliminar arquitectura" onClick={() => deleteArch(latestSaved.id)}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
              <div className="saved-layer-list">
                {latestSaved.layers.map((layer, index) => (
                  <div key={`${layer.id}-${index}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <b>{layer.name}</b>
                    <small>{layer.type} · {layer.units} {layer.type === 'Dropout' ? '%' : 'unidades'} · {layer.activation}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Propiedades" subtitle={current ? `Capa seleccionada · ${current.id}` : 'Selecciona una capa'}>
          <div className="properties-form">
            {current ? (
              <>
                <label>Nombre<input value={current.name} onChange={e => update('name', e.target.value)}/></label>
                <label>Tipo de capa
                  <select value={current.type} onChange={e => update('type', e.target.value)}>
                    {['Input', ...layerOptions].map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label>{current.type === 'Dropout' ? 'Tasa (%)' : 'Unidades / filtros'}
                  <input type="number" min="1" max="4096" value={current.units} onChange={e => update('units', Number(e.target.value))}/>
                </label>
                <label>Activación
                  <select value={current.activation} onChange={e => update('activation', e.target.value)}>
                    {['—', 'ReLU', 'Sigmoid', 'Tanh', 'Softmax', 'Linear'].map(a => <option key={a}>{a}</option>)}
                  </select>
                </label>
                <div className="property-actions">
                  <Button variant="secondary" onClick={() => {
                    const i = layers.findIndex(l => l.id === selected);
                    if (i > 0) {
                      const next = [...layers];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      setLayers(next);
                    }
                  }}><ArrowUp size={14}/></Button>
                  <Button variant="secondary" onClick={() => {
                    const i = layers.findIndex(l => l.id === selected);
                    if (i >= 0 && i < layers.length - 1) {
                      const next = [...layers];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      setLayers(next);
                    }
                  }}><ArrowDown size={14}/></Button>
                  <Button variant="danger" onClick={remove}><Trash2 size={14}/> Eliminar</Button>
                </div>
              </>
            ) : (
              <p className="muted-copy">Haz clic en una capa del lienzo para editar sus parámetros.</p>
            )}
          </div>
          <div className="parameter-summary">
            <span>Parámetros Dense estimados</span>
            <b>{params.toLocaleString()}</b>
            <small>Estimación aproximada del backend</small>
          </div>
        </Panel>
      </div>

      {message && (
        <div className="info-callout">
          <CircleAlert size={18}/>
          <div><b>Resultado de la acción</b><p>{message}</p></div>
          <button className="dismiss" onClick={() => setMessage('')}>Cerrar</button>
        </div>
      )}
    </div>
  );
}