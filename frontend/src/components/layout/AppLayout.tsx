import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './layout.css';

export default function AppLayout() {
  return <div className="app-shell"><Sidebar /><div className="main-shell"><Header /><main className="page-content"><Outlet /></main><footer className="footer">NeuroLab Enterprise <span>•</span> Aplicación sin datos precargados</footer></div></div>;
}