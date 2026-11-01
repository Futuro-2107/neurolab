// Al iniciar, los proyectos están vacíos. Los registros creados desde la interfaz se guardan localmente en este navegador.
import type { Project } from '../types';
const STORAGE_KEY = 'neurolab-projects-clean';
export function getProjects(): Project[] {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) as Project[] : []; }
  catch { return []; }
}
export function saveProjects(projects: Project[]): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); }
