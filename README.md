# NeuroLab Enterprise — Frontend y Backend separados

El proyecto está organizado en dos aplicaciones independientes:

- `frontend/`: React + TypeScript + Vite.
- `backend/`: FastAPI + SQLAlchemy + SQLite.

## Estructura

```text
NeuroLab_Enterprise/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── services/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── security.py
│   │   └── config.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Ejecutar el backend

Abre una terminal en `backend/`:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

API: `http://127.0.0.1:8000`  
Documentación: `http://127.0.0.1:8000/docs`

## Ejecutar el frontend

Abre otra terminal en `frontend/`:

```powershell
npm install
npm run dev
```

Vite mostrará la dirección local (normalmente `http://localhost:5173`).

## Importante sobre la integración

Separar las carpetas organiza el código, pero no garantiza que todos los módulos del frontend consuman ya los endpoints del backend. Verifica los servicios en `frontend/src/services/` y la configuración CORS del backend antes de integrar todos los formularios. El módulo de entrenamiento es un registro de experimentos y no implica por sí solo ejecución real de redes neuronales.
