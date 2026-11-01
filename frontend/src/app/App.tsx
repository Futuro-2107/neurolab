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

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  if (!token) {
    return <Login onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="fundamentals" element={<Fundamentals />} />
        <Route path="architectures" element={<Architectures />} />
        <Route path="datasets" element={<Datasets />} />
        <Route path="training" element={<Training />} />
        <Route path="evaluation" element={<Evaluation />} />
        <Route path="models" element={<ModelRegistry />} />
        <Route path="reports" element={<Reports />} />
        <Route path="administration" element={<Administration />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}