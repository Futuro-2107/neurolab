import { useEffect, useMemo, useRef, useState } from 'react';
import { FileUp, FileSpreadsheet, Info, Plus, UploadCloud, Trash2, Eye, X } from 'lucide-react';
import { Button, PageIntro, Panel, Status } from '../../components/ui/Elements';

type DatasetRecord = {
  id: number;
  name: string;
  file_type: string;
  size_bytes: number;
  record_count: number;
  columns: string[];
  preview_rows: string[][];
  version: string;
  status: string;
  created_at: string;
  project_id: number | null;
};

type Project = {
  id: number;
  name: string;
};

// URL dinámica basada en las variables de entorno de Vite (Render / Local)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function parseCsv(text: string): { columns: string[]; rows: string[][] } {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell); cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(value => value.trim() !== '')) lines.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some(value => value.trim() !== '')) lines.push(row);
  if (lines.length < 2) throw new Error('El CSV debe contener una fila de encabezados y al menos un registro.');
  const columns = lines[0].map((value, index) => value.trim() || `columna_${index + 1}`);
  const rows = lines.slice(1).map(values => columns.map((_, index) => (values[index] ?? '').trim()));
  return { columns, rows };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function Datasets() {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detailDataset, setDetailDataset] = useState<DatasetRecord | null>(null);
  const [train, setTrain] = useState(70);
  const [valid, setValid] = useState(15);
  const inputRef = useRef<HTMLInputElement>(null);
  const test = 100 - train - valid;
  const allRecords = useMemo(() => datasets.reduce((sum, dataset) => sum + dataset.record_count, 0), [datasets]);

  useEffect(() => {
    fetchDatasets();
    fetchProjects();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${API_BASE}/datasets`);
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
      }
    } catch (e) {
      console.error('Error al cargar datasets', e);
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
    } catch (e) {
      console.error('Error al cargar proyectos', e);
    }
  };

  async function handleFile(file?: File) {
    if (!file) return;
    setError(''); setSuccess(''); setSelectedFile(null); setColumns([]); setRows([]);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Selecciona un archivo .csv. Esta versión procesa archivos CSV.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (file.size === 0) { setError('El archivo está vacío. Comprueba que el CSV tenga contenido.'); return; }
    try {
      const content = await file.text();
      const parsed = parseCsv(content);

      const payload = {
        name: file.name,
        file_type: 'CSV',
        size_bytes: file.size,
        record_count: parsed.rows.length,
        columns: parsed.columns,
        preview_rows: parsed.rows.slice(0, 5),
        content: content,
        project_id: selectedProjectId,
        version: 'v1.0',
        status: 'Disponible'
      };

      const res = await fetch(`${API_BASE}/datasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSelectedFile(file);
        setColumns(parsed.columns);
        setRows(parsed.rows);
        setSuccess(`Dataset "${file.name}" registrado correctamente en la base de datos: ${parsed.rows.length} registros.`);
        fetchDatasets();
      } else {
        const err = await res.json();
        setError(err.detail || 'Error al guardar el dataset en el servidor.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar el archivo CSV.');
    }
  }

  async function removeDataset(id: number) {
    try {
      const res = await fetch(`${API_BASE}/datasets/${id}`, {
        method: 'DELETE'
      });
      if (res.ok || res.status === 204) {
        setSuccess('Dataset eliminado correctamente.');
        fetchDatasets();
      } else {
        setError('No se pudo eliminar el dataset.');
      }
    } catch (e) {
      setError('Error de conexión al eliminar el dataset.');
    }
  }

  return (
    <div className="page-stack">
      <PageIntro 
        eyebrow="GESTIÓN DE DATOS" 
        title="Datasets" 
        description="Importa archivos CSV, revisa sus columnas y regístralos directamente en PostgreSQL mediante FastAPI." 
        action={<Button onClick={() => inputRef.current?.click()}><Plus size={16}/> Registrar dataset</Button>}
      />

      <div className="stats-strip">
        <div><span>Datasets registrados</span><b>{datasets.length}</b></div>
        <div><span>Registros importados</span><b>{allRecords}</b></div>
        <div><span>Archivos CSV</span><b>{datasets.length}</b></div>
        <div><span>Columnas detectadas</span><b>{datasets.reduce((sum, d) => sum + (d.columns?.length || 0), 0)}</b></div>
      </div>

      <div className="properties-form" style={{ marginBottom: '1rem', padding: '1rem', background: '#1e293b', borderRadius: '8px' }}>
        <label>
          <b>Asignar próximo CSV a Proyecto:</b>
          <select value={selectedProjectId || ''} onChange={e => setSelectedProjectId(Number(e.target.value) || null)} style={{ marginTop: '0.5s', width: '100%', padding: '8px' }}>
            <option value="">Sin proyecto asociado</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>

      <Panel title="Conjuntos de datos" subtitle={`${datasets.length} dataset(s) guardado(s) en PostgreSQL`}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>DATASET</th>
                <th>TIPO</th>
                <th>TAMAÑO</th>
                <th>REGISTROS</th>
                <th>COLUMNAS</th>
                <th>VERSIÓN</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(d => (
                <tr key={d.id}>
                  <td>
                    <div className="table-project">
                      <div className="project-icon"><FileSpreadsheet size={17}/></div>
                      <div>
                        <b>{d.name}</b>
                        <small>Creado {new Date(d.created_at).toLocaleString('es-PE')}</small>
                      </div>
                    </div>
                  </td>
                  <td>{d.file_type || 'CSV'}</td>
                  <td>{formatBytes(d.size_bytes)}</td>
                  <td>{d.record_count}</td>
                  <td>{d.columns?.length || 0}</td>
                  <td>{d.version}</td>
                  <td><Status>{d.status}</Status></td>
                  <td>
                    <div className="dataset-row-actions">
                      <Button variant="secondary" onClick={() => setDetailDataset(d)}><Eye size={13}/> Ver datos</Button>
                      <Button variant="danger" onClick={() => { if(window.confirm(`¿Eliminar el dataset "${d.name}"?`)) removeDataset(d.id); }}><Trash2 size={13}/> Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {datasets.length === 0 && <div className="empty-state">Todavía no hay datasets en la base de datos. Selecciona un archivo CSV para importar.</div>}
        </div>
      </Panel>

      <div className="two-column">
        <Panel title="Importar archivo CSV" subtitle="El archivo se lee localmente y se almacena en la BD">
          <input ref={inputRef} type="file" hidden accept=".csv,text/csv" onChange={event => void handleFile(event.target.files?.[0])}/>
          <button className="upload-zone" onClick={() => inputRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void handleFile(event.dataTransfer.files?.[0]); }}>
            <div className="upload-icon"><UploadCloud size={23}/></div>
            <b>{selectedFile?.name || 'Selecciona o arrastra un archivo CSV'}</b>
            <span>{selectedFile ? `Tamaño real: ${formatBytes(selectedFile.size)}` : 'Haz clic aquí o arrastra el CSV desde tu computadora'}</span>
            <small>Formato compatible: .csv · Conectado a PostgreSQL</small>
          </button>
          {error && <div className="dataset-error" role="alert">{error}</div>}
          {success && <div className="dataset-success" role="status">{success}</div>}
          {selectedFile && <>
            <div className="dataset-metadata">
              <b>Archivo leído correctamente</b>
              <div><span>Registros detectados</span><strong>{rows.length}</strong></div>
              <div><span>Columnas detectadas</span><strong>{columns.length}</strong></div>
              <div className="dataset-columns"><span>Columnas</span><p>{columns.join(' · ')}</p></div>
            </div>
            <div className="dataset-preview">
              <b>Vista previa (primeras {Math.min(rows.length, 5)} filas)</b>
              <div className="table-scroll">
                <table>
                  <thead><tr>{columns.map((column, index) => <th key={`${column}-${index}`}>{column}</th>)}</tr></thead>
                  <tbody>{rows.slice(0, 5).map((row, ri) => <tr key={ri}>{columns.map((_, ci) => <td key={ci}>{row[ci]}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
            <div className="upload-actions">
              <Button variant="secondary" onClick={() => { setSelectedFile(null); setColumns([]); setRows([]); setError(''); setSuccess(''); if (inputRef.current) inputRef.current.value = ''; }}>Cerrar vista previa</Button>
              <Button disabled><FileUp size={15}/> Registrado en DB</Button>
            </div>
          </>}
          <div className="info-callout compact"><Info size={16}/><div><b>Persistencia segura</b><p>Los metadatos y la estructura del CSV se guardan en PostgreSQL a través de FastAPI.</p></div></div>
        </Panel>

        <Panel title="Distribución del dataset" subtitle="Porcentajes de referencia para tus experimentos">
          <div className="split-summary">
            <div><b>{train}%</b><span>Entrenamiento</span></div>
            <div><b>{valid}%</b><span>Validación</span></div>
            <div><b>{test}%</b><span>Prueba</span></div>
          </div>
          <div className="split-bar">
            <i style={{width:`${train}%`}}/>
            <i style={{width:`${valid}%`}}/>
            <i style={{width:`${test}%`}}/>
          </div>
          <label className="range-label">Entrenamiento <b>{train}%</b><input type="range" min="50" max="90" value={train} onChange={event => { const value = Number(event.target.value); setTrain(value); if (value + valid > 95) setValid(100 - value - 5); }}/></label>
          <label className="range-label">Validación <b>{valid}%</b><input type="range" min="5" max={Math.max(5, Math.min(30, 100 - train - 5))} value={valid} onChange={event => setValid(Math.min(Number(event.target.value), 100 - train - 5))}/></label>
          <div className="split-footnote">Total: {train + valid + test}% · Distribución de referencia; no modifica el CSV original.</div>
        </Panel>
      </div>

      {detailDataset && (
        <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDetailDataset(null); }}>
          <section className="modal-card dataset-detail-modal" role="dialog" aria-modal="true" aria-labelledby="dataset-detail-title">
            <div className="modal-head">
              <div>
                <span className="eyebrow">DETALLE DEL DATASET</span>
                <h3 id="dataset-detail-title">{detailDataset.name}</h3>
              </div>
              <button type="button" className="icon-button" aria-label="Cerrar" onClick={() => setDetailDataset(null)}><X size={18}/></button>
            </div>
            <div className="dataset-detail-stats">
              <div><span>Registros</span><b>{detailDataset.record_count}</b></div>
              <div><span>Columnas</span><b>{detailDataset.columns?.length || 0}</b></div>
              <div><span>Tamaño</span><b>{formatBytes(detailDataset.size_bytes)}</b></div>
              <div><span>Versión</span><b>{detailDataset.version}</b></div>
            </div>
            <div className="dataset-detail-columns">
              <b>Columnas detectadas</b>
              <p>{detailDataset.columns?.join(' · ')}</p>
              <small>Registrado: {new Date(detailDataset.created_at).toLocaleString('es-PE')}</small>
            </div>
            <div className="dataset-preview">
              <b>Vista previa de los datos (hasta 5 filas)</b>
              <div className="table-scroll">
                <table>
                  <thead><tr>{detailDataset.columns?.map((column, index) => <th key={`${column}-${index}`}>{column}</th>)}</tr></thead>
                  <tbody>
                    {detailDataset.preview_rows?.map((row, ri) => (
                      <tr key={ri}>
                        {detailDataset.columns?.map((_, ci) => <td key={ci}>{row[ci] ?? ''}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-actions"><Button onClick={() => setDetailDataset(null)}>Cerrar detalles</Button></div>
          </section>
        </div>
      )}
    </div>
  );
}