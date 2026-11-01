import { useEffect, useState } from 'react';
import { LockKeyhole, Settings2, ShieldCheck, Users, Plus, Save } from 'lucide-react';
import { Button, PageIntro, Panel } from '../../components/ui/Elements';

type User = { id: number; full_name: string; email: string; role: string; is_active: boolean; created_at: string };
type AuditEvent = { id: number; actor: string; action: string; resource: string; details: any; created_at: string };

// URL dinámica basada en las variables de entorno de Vite
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function Administration() {
  const [tab, setTab] = useState('Usuarios');
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [limit, setLimit] = useState(1);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Campos para crear usuario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Investigador');
  const [message, setMessage] = useState('');

  // Cargar datos desde el backend al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchAudit();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit?limit=200`);
      if (res.ok) {
        // Lógica de carga de usuarios si aplica
      }
    } catch (error) {
      console.error('Error al cargar datos', error);
    }
  };

  const fetchAudit = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit`);
      if (res.ok) {
        const data = await res.json();
        setAudit(data);
      }
    } catch (error) {
      console.error('Error al cargar auditoría', error);
    }
  };

  const addUser = async () => {
    if (!fullName.trim() || !email.trim() || !email.includes('@')) {
      setMessage('Ingresa un nombre y un correo válido.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password: password,
          role: role
        })
      });

      if (res.ok) {
        setMessage('Usuario registrado en la base de datos con éxito.');
        setFullName('');
        setEmail('');
        setShowForm(false);
        fetchAudit();
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Error al registrar usuario.');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor.');
    }
  };

  const savePrefs = async () => {
    try {
      await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: 'Administrador',
          action: 'Preferencias actualizadas',
          resource: 'settings',
          details: { limit, notifications, theme }
        })
      });
      setSaved(true);
      fetchAudit();
    } catch (error) {
      console.error('Error al guardar preferencias', error);
    }
  };

  return (
    <div className="page-stack">
      <PageIntro 
        eyebrow="GOVERNANCE & ACCESS" 
        title="Administración" 
        description="Administra usuarios en la base de datos, consulta la actividad del sistema y configura parámetros del servidor." 
      />
      
      <div className="admin-summary">
        <div>
          <div className="admin-summary-icon"><Users size={18}/></div>
          <span>Eventos de auditoría</span>
          <b>{audit.length}</b>
        </div>
        <div>
          <div className="admin-summary-icon"><ShieldCheck size={18}/></div>
          <span>Roles configurables</span>
          <b>4</b>
        </div>
        <div>
          <div className="admin-summary-icon"><LockKeyhole size={18}/></div>
          <span>Seguridad API</span>
          <b className="security-demo">Activa (JWT)</b>
        </div>
        <div>
          <div className="admin-summary-icon"><Settings2 size={18}/></div>
          <span>Estado DB</span>
          <b style={{ color: '#10b981' }}>Conectada</b>
        </div>
      </div>

      <div className="admin-tabs">
        {['Usuarios', 'Auditoría', 'Recursos', 'Preferencias'].map(t => (
          <button 
            key={t} 
            className={tab === t ? 'active' : ''} 
            onClick={() => { setTab(t); setMessage(''); }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Usuarios' && (
        <Panel title="Gestión de usuarios" subtitle="Registros vinculados al backend">
          <div className="table-toolbar">
            <span>Usuarios y credenciales del sistema</span>
            <Button onClick={() => setShowForm(v => !v)}>
              <Plus size={15}/> Registrar usuario
            </Button>
          </div>

          {showForm && (
            <div className="properties-form admin-user-form">
              <div className="form-row">
                <label>
                  Nombre completo
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre del usuario" />
                </label>
                <label>
                  Correo electrónico
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@neurolab.com" />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Contraseña temporal
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
                </label>
                <label>
                  Rol
                  <select value={role} onChange={e => setRole(e.target.value)}>
                    {['Administrador', 'Investigador', 'Analista', 'Observador'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </label>
              </div>
              <div className="detail-actions">
                <Button onClick={addUser}><Save size={15}/> Guardar en Base de Datos</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {message && <p className="saved-message">{message}</p>}

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ACCIÓN REGISTRADA</th>
                  <th>RECURSO</th>
                  <th>AUTOR</th>
                  <th>FECHA</th>
                </tr>
              </thead>
              <tbody>
                {audit.filter(item => item.resource === 'users').map(u => (
                  <tr key={u.id}>
                    <td>{u.action}</td>
                    <td>{u.resource}</td>
                    <td>{u.actor}</td>
                    <td>{new Date(u.created_at).toLocaleString('es-PE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {audit.filter(item => item.resource === 'users').length === 0 && (
              <div className="empty-state">No hay registros de usuarios en la base de datos todavía. Pulsa “Registrar usuario”.</div>
            )}
          </div>
        </Panel>
      )}

      {tab === 'Auditoría' && (
        <Panel title="Registro de actividad (Audit Trail)" subtitle="Eventos sincronizados directamente desde PostgreSQL">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>FECHA Y HORA</th>
                  <th>ACTOR</th>
                  <th>ACCIÓN</th>
                  <th>RECURSO</th>
                </tr>
              </thead>
              <tbody>
                {audit.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString('es-PE')}</td>
                    <td>{item.actor}</td>
                    <td>{item.action}</td>
                    <td>{item.resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {audit.length === 0 && (
              <div className="empty-state">Todavía no hay eventos registrados en la base de datos.</div>
            )}
          </div>
        </Panel>
      )}

      {tab === 'Recursos' && (
        <Panel title="Preferencias de recursos" subtitle="Define límites para la ejecución de entrenamientos">
          <div className="resource-setting">
            <div>
              <b>Entrenamientos simultáneos</b>
              <p>Máximo permitido por el worker de Python.</p>
            </div>
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setSaved(false); }}>
              {[1, 2, 3, 4, 5, 8].map(n => <option key={n} value={n}>{n} ejecución{n > 1 ? 'es' : ''}</option>)}
            </select>
          </div>
          <Button onClick={savePrefs}><Settings2 size={15}/> Guardar preferencia</Button>
          {saved && <p className="saved-message">Preferencia guardada en el servidor: {limit} entrenamientos simultáneos.</p>}
        </Panel>
      )}

      {tab === 'Preferencias' && (
        <Panel title="Preferencias de interfaz" subtitle="Configuración general de la plataforma">
          <div className="preference-row">
            <div>
              <b>Modo oscuro</b>
              <p>Interfaz oscura de NeuroLab Enterprise.</p>
            </div>
            <label className="toggle-setting">
              <input type="checkbox" checked={theme} onChange={e => { setTheme(e.target.checked); setSaved(false); }} /> 
              {theme ? 'Activado' : 'Desactivado'}
            </label>
          </div>
          <div className="preference-row">
            <div>
              <b>Notificaciones de actividad</b>
              <p>Permite mostrar avisos visuales de cambios.</p>
            </div>
            <label className="toggle-setting">
              <input type="checkbox" checked={notifications} onChange={e => { setNotifications(e.target.checked); setSaved(false); }} /> 
              {notifications ? 'Activadas' : 'Desactivadas'}
            </label>
          </div>
          <Button onClick={savePrefs}><Save size={15}/> Guardar preferencias</Button>
          {saved && <p className="saved-message">Preferencias guardadas correctamente.</p>}
        </Panel>
      )}

      <div className="info-callout">
        <LockKeyhole size={17} />
        <div>
          <b>Administración conectada a FastAPI y PostgreSQL</b>
          <p>Los datos de usuarios y auditoría ahora se almacenan de forma persistente en las tablas del servidor mediante peticiones HTTP asíncronas.</p>
        </div>
      </div>
    </div>
  );
}