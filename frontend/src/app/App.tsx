import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../features/dashboard/Dashboard';
import Projects from '../features/projects/Projects';
import Fundamentals from '../features/fundamentals/Fundamentals';
import Architectures from '../features/architectures/Architectures';
import Datasets from '../features/datasets/Datasets';
import Training from '../features/training/Training';
import Evaluation from '../features/evaluation/Evaluation';
import ModelRegistry from '../features/model-registry/ModelRegistry';
import Reports from '../features/reports/Reports';
import Administration from '../features/administration/Administration';
import { Login } from '../features/login/login';
import React from 'react';

// Definimos qué roles pueden entrar a cada ruta específica
const routePermissions: Record<string, string[]> = {
  '/': ['Administrador', 'Investigador', 'Analista', 'Observador'],
  '/projects': ['Administrador', 'Investigador', 'Analista', 'Observador'],
  '/fundamentals': ['Administrador', 'Investigador'],
  '/architectures': ['Administrador', 'Investigador'],
  '/datasets': ['Administrador', 'Investigador', 'Analista'],
  '/training': ['Administrador', 'Investigador'],
  '/evaluation': ['Administrador', 'Investigador', 'Analista'],
  '/models': ['Administrador', 'Investigador', 'Analista', 'Observador'],
  '/reports': ['Administrador', 'Analista', 'Observador'],
  '/administration': ['Administrador'],
};

function ProtectedRoute({ path, element }: { path: string; element: React.ReactNode }) {
  const userRole = localStorage.getItem('user_role') || 'Observador';
  const allowedRoles = routePermissions[path] || ['Administrador'];

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return element; // ¡Sin el "as JSX.Element"!
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  if (!token) {
    return <Login onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProtectedRoute path="/projects" element={<Projects />} />} />
        <Route path="fundamentals" element={<ProtectedRoute path="/fundamentals" element={<Fundamentals />} />} />
        <Route path="architectures" element={<ProtectedRoute path="/architectures" element={<Architectures />} />} />
        <Route path="datasets" element={<ProtectedRoute path="/datasets" element={<Datasets />} />} />
        <Route path="training" element={<ProtectedRoute path="/training" element={<Training />} />} />
        <Route path="evaluation" element={<ProtectedRoute path="/evaluation" element={<Evaluation />} />} />
        <Route path="models" element={<ProtectedRoute path="/models" element={<ModelRegistry />} />} />
        <Route path="reports" element={<ProtectedRoute path="/reports" element={<Reports />} />} />
        <Route path="administration" element={<ProtectedRoute path="/administration" element={<Administration />} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}