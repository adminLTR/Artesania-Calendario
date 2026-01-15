
export interface EquipoMember {
  id: string;
  nombre: string;
  rol: string;
  responsabilidades: string;
  activo: boolean;
  color: string; // Color hexadecimal para identificar al miembro
}

export type PrioridadTarea = 'baja' | 'media' | 'alta';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  responsableId: string;
  fechaInicio: string;
  fechaEntrega: string;
  concluida: boolean;
  fechaConcluida?: string;
  progreso: number;
  prioridad: PrioridadTarea;
  categoria: string;
  dependencias: string[];
  creadaEn: string;
  actualizadaEn: string;
}

export interface TeamTasksData {
  members: EquipoMember[];
  tasks: Tarea[];
}
