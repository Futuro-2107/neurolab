import { useEffect, useMemo, useState } from 'react';
import { FolderKanban, MoreHorizontal, Pencil, Plus, X, Trash2 } from 'lucide-react';
import { Button, PageIntro, Panel, SearchInput, Status } from '../../components/ui/Elements';

type Project = {
  id: number;
  name: string;
  description: string;
  owner: string;
  family: string;
  status: string;
  created_at?: string;
};

const API_BASE = 'http://localhost:8000/api/v1';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  
  // Campos del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [family, setFamily] = useState('');
  
  const families = ['Feedforward', 'Red convolucional (CNN)', 'Red neuronal recurrente (RNN)', 'Red generativa adversaria (GAN)'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error al cargar proyectos desde la API', error);
    }
  };

  const filtered = useMemo(() => projects.filter(p => 
    (p.name?.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase())) && 
    (status === 'Todos' || p.status === status)
  ), [projects, search, status]);

  const openNew = (p?: Project) => { 
    setEditing(p || null); 
    setName(p?.name || ''); 
    setDescription(p?.description || ''); 
    setOwner(p?.owner || ''); 
    setFamily(p?.family || ''); 
    setModal(true); 
  };

  const save = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!name.trim()) return; 

    try {
      // Estructura limpia ajustada estrictamente a la BD PostgreSQL
      const payload = {
        name: name.trim(),
        description: description.trim(),
        owner: owner.trim(),
        family: family.trim(),
        status: editing ? editing.status : 'Activo'
      };

      if (editing) {
        const res = await fetch(`${API_BASE}/projects/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchProjects();
          setModal(false);
        }
      } else {
        const res = await fetch(`${API_BASE}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchProjects();
          setModal(false);
        }
      }
    } catch (error) {
      console.error('Error al guardar el proyecto', error);
    }
  };

  const archive = async (p: Project) => { 
    if (window.confirm(`¿Archivar el proyecto "${p.name}"?`)) {
      try {
        const res = await fetch(`${API_BASE}/projects/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...p, status: 'Archivado' })
        });
        if (res.ok) fetchProjects();
      } catch (error) {
        console.error('Error al archivar proyecto', error);
      }
    } 
  };

  const removeProject = async (p: Project) => { 
    if (window.confirm(`¿Eliminar definitivamente el proyecto "${p.name}" de la base de datos? Esta acción no se puede deshacer.`)) {
      try {
        const res = await fetch(`${API_BASE}/projects/${p.id}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
          fetchProjects();
        }
      } catch (error) {
        console.error('Error al eliminar proyecto', error);
      }
    } 
  };

  const activeCount = projects.filter(p => p.status === 'Activo').length;

  return (
    <div className="page-stack">
      <PageIntro 
        eyebrow="WORKSPACE / PROYECTOS" 
        title="Proyectos de IA" 
        description="Organiza tus experimentos, arquitecturas y ejecuciones sincronizados con tu base de datos." 
        action={<Button onClick={() => openNew()}><Plus size={16}/> Nuevo proyecto</Button>}
      />
      
      <div className="stats-strip">
        <div><span>Proyectos visibles</span><b>{String(projects.length).padStart(2, '0')}</b></div>
        <div><span>Activos</span><b>{String(activeCount).padStart(2, '0')}</b></div>
        <div><span>Base de datos</span><b>PostgreSQL</b></div>
        <div><span>API</span><b>FastAPI</b></div>
      </div>

      <Panel title="Todos los proyectos" subtitle={`${filtered.length} proyectos encontrados en la BD`}>
        <div className="table-toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar proyectos..."/>
          <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Todos</option>
            <option>Activo</option>
            <option>Borrador</option>
            <option>Archivado</option>
          </select>
        </div>
        
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>PROYECTO</th>
                <th>RESPONSABLE</th>
                <th>FAMILIA DE RED NEURONAL</th>
                <th>ESTADO</th>
                <th>CREACIÓN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="table-project">
                      <div className="project-icon"><FolderKanban size={17}/></div>
                      <div>
                        <b>{p.name}</b>
                        <small>{p.description}</small>
                      </div>
                    </div>
                  </td>
                  <td>{p.owner || '—'}</td>
                  <td>{p.family || 'Sin definir'}</td>
                  <td><Status>{p.status}</Status></td>
                  <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('es-PE') : 'Reciente'}</td>
                  <td>
                    <div className="row-actions">
                      <button title="Editar" onClick={() => openNew(p)}><Pencil size={15}/></button>
                      <button title="Archivar proyecto" onClick={() => archive(p)}><MoreHorizontal size={16}/></button>
                      <button className="delete-row-action" title="Eliminar proyecto" onClick={() => removeProject(p)}><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">No hay proyectos que coincidan con los filtros en la base de datos.</div>}
        </div>
      </Panel>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <form className="modal-card" onSubmit={save}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">{editing ? 'EDITAR' : 'NUEVO'} PROYECTO</span>
                <h3>{editing ? 'Editar proyecto' : 'Crear proyecto'}</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            
            <label>
              Nombre del proyecto
              <input autoFocus value={name} onChange={e => setName(e.target.value)} required minLength={3} placeholder="Ej. Predicción de demanda"/>
            </label>
            
            <label>
              Descripción
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="¿Qué problema quieres resolver?"/>
            </label>
            
            <label>
              Responsable
              <input value={owner} onChange={e => setOwner(e.target.value)} required placeholder="Nombre del responsable"/>
            </label>
            
            <label>
              Familia de red neuronal
              <select className="project-family-select" value={family} onChange={e => setFamily(e.target.value)} required>
                <option value="">Selecciona una familia</option>
                {families.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            
            <div className="demo-form-note">La información se guarda directamente en la base de datos PostgreSQL a través de la API.</div>
            
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit"><Plus size={15}/>{editing ? 'Guardar cambios' : 'Crear proyecto'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}