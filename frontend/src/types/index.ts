export type ProjectStatus = 'Activo' | 'Borrador' | 'Archivado';
export interface Project {
  id: number; name: string; description: string; owner: string; family: string; status: ProjectStatus;
  createdAt: string; architectures: number; trainings: number; activity: string; tags: string[];
}
export interface NeuralLayer { id: number; name: string; type: string; units: number; activation: string; }
export interface TrainingJob {
  id: string; project: string; architecture: string; dataset: string; status: string;
  progress: number; epoch: number; totalEpochs: number; started: string; duration: string;
}
export interface Dataset {
  id: number; name: string; type: string; size: string; records: string; date: string;
  status: string; project: string; version: string;
}
export interface ModelVersion {
  id: string; name: string; project: string; family: string; version: string;
  date: string; training: string; accuracy: number; status: string; owner: string;
}
