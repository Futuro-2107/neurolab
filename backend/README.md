# Backend NeuroLab Enterprise

API REST desarrollada con FastAPI + SQLAlchemy. Por defecto utiliza SQLite para facilitar la ejecución local; puedes cambiar `DATABASE_URL` a PostgreSQL cuando despliegues.

## Requisitos
- Python 3.11 o superior recomendado
- pip

## Instalación en Windows (PowerShell)
```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```
Si PowerShell bloquea la activación, abre CMD y ejecuta `.venv\Scripts\activate.bat`.

La API queda en `http://127.0.0.1:8000`; documentación interactiva en `http://127.0.0.1:8000/docs` y estado en `/health`. La base `neurolab.db` se crea automáticamente dentro de `backend` al iniciar.

## Endpoints principales
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `GET/POST/PATCH/DELETE /api/v1/projects`
- `GET/POST/DELETE /api/v1/datasets`
- `GET/POST/DELETE /api/v1/architectures`
- `GET/POST /api/v1/trainings`, `PATCH /api/v1/trainings/{id}/status`
- `GET/POST/DELETE /api/v1/models`
- `GET/POST /api/v1/audit`
- `GET /api/v1/dashboard`, `GET /api/v1/reports/summary`

Los endpoints de registro/login usan JWT. En esta primera entrega, los endpoints CRUD de módulos no exigen token todavía; antes de producción hay que aplicar autorización por rol a todas las rutas, cambiar `SECRET_KEY`, usar HTTPS y configurar una base de datos administrada.

## Alcance real
El backend persiste registros en la base de datos y expone la API. Los entrenamientos registrados son trabajos/estados de seguimiento: **no ejecutan TensorFlow ni entrenan redes neuronales reales**. Para eso se necesita implementar un worker de ML y una cola de tareas. La interfaz existente sigue usando almacenamiento local en varios módulos; para que todos los formularios lean y escriban en esta API hay que hacer la integración frontend módulo por módulo.
