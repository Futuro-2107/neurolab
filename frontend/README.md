# NeuroLab Enterprise

Proyecto con frontend React + TypeScript + Vite y backend FastAPI + SQLAlchemy.

## Iniciar el frontend
```bash
npm install
npm run dev
```

## Iniciar el backend (otra terminal)
```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

- Frontend: dirección que muestra Vite, normalmente `http://localhost:5173`
- API: `http://127.0.0.1:8000`
- Documentación API: `http://127.0.0.1:8000/docs`
- Base de datos: SQLite (`backend/neurolab.db`)

Lee `backend/README.md` para endpoints, límites y recomendaciones de seguridad. Importante: este paquete añade el backend REST y su base de datos, pero la interfaz actual todavía utiliza localStorage en varios módulos; la integración completa frontend/API es el siguiente paso. Los entrenamientos son registros de seguimiento, no ejecución real de ML.
