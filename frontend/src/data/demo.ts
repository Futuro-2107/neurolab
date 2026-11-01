import type { Dataset, ModelVersion, Project, TrainingJob } from '../types';

// El sistema inicia vacío: no se precargan registros de ejemplo.
export const initialProjects: Project[] = [];
export const demoJobs: TrainingJob[] = [];
export const demoDatasets: Dataset[] = [];
export const demoModels: ModelVersion[] = [];
export const trainingChart: { day: string; jobs: number; loss: number }[] = [];
