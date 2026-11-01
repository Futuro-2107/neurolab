from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

def now(): return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column("name", String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column("hashed_password", String(255))
    role: Mapped[str] = mapped_column(String(50), default="Viewer")
    is_active: Mapped[bool] = mapped_column("status", Boolean, default=True) # Adaptado a status de tu SQL
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column("title", String(255), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column("responsible", String(255), default="")
    family: Mapped[str] = mapped_column("neural_family", String(100), default="")
    status: Mapped[str] = mapped_column(String(50), default="Activo")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Dataset(Base):
    __tablename__ = "datasets"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    file_type: Mapped[str] = mapped_column(String(50), default="CSV")
    size_bytes: Mapped[str] = mapped_column("file_size", String(50), default="0")
    record_count: Mapped[int] = mapped_column("total_rows", Integer, default=0)
    version: Mapped[str] = mapped_column(String(50), default="v1.0")
    status: Mapped[str] = mapped_column(String(50), default="Disponible")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Architecture(Base):
    __tablename__ = "architectures"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), default="Arquitectura sin nombre")
    family: Mapped[str] = mapped_column("neural_family", String(100), default="Feedforward")
    layers: Mapped[list] = mapped_column("layers_config", JSON, default=list)
    parameters_estimate: Mapped[int] = mapped_column("total_parameters", Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class TrainingJob(Base):
    __tablename__ = "trainings"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column("experiment_name", String(255))
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    architecture_id: Mapped[int | None] = mapped_column(ForeignKey("architectures.id", ondelete="SET NULL"), nullable=True)
    dataset_id: Mapped[int | None] = mapped_column(ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    epochs: Mapped[int] = mapped_column(Integer, default=30)
    batch_size: Mapped[int] = mapped_column(Integer, default=32)
    optimizer: Mapped[str] = mapped_column(String(50), default="Adam")
    status: Mapped[str] = mapped_column(String(50), default="En cola")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class ModelRecord(Base):
    __tablename__ = "models"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    family: Mapped[str] = mapped_column(String(100), default="CNN")
    version: Mapped[str] = mapped_column(String(50), default="v1.0")
    accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    training_job_id: Mapped[int | None] = mapped_column("training_id", ForeignKey("trainings.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="En revisión")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class AuditEvent(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    action: Mapped[str] = mapped_column("event_description", Text)
    actor: Mapped[str] = mapped_column("user_email", String(255), default="sistema@neurolab.com")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)