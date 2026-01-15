
export enum AppView {
  CALENDAR = 'calendar',
  STUDENTS = 'students',
  PIECES = 'pieces',
  GIFTCARDS = 'giftcards',
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
  TEAM_TASKS = 'team_tasks'
}

export interface AssignedClass {
  date: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent';
  sessionId: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  classesRemaining: number;
  status: 'regular' | 'needs_renewal' | 'new';
  paymentMethod?: string;
  notes?: string;
  price?: number;
  assignedClasses?: AssignedClass[];
  attendanceHistory?: AttendanceRecord[];
  classType?: string;
  expiryDate?: string;
}

export interface ClassSession {
  id: string;
  date: string; // ISO format
  startTime: string;
  endTime: string;
  students: string[]; // List of student names
  attendanceConfirmed?: string[]; // List of names marked as present
  attendanceAbsent?: string[]; // List of names marked as absent
}

export type CeramicPieceStatus = 
  | 'creada' 
  | 'en secado' 
  | 'bizcochada' 
  | 'esmaltada' 
  | 'cocida final' 
  | 'concluida';

export interface CeramicPiece {
  id: string;
  alumnoId?: string; 
  owner: string; 
  description: string;
  status: CeramicPieceStatus;
  fechaCreacion: string; 
  fechaConclusion?: string; 
  glazeType?: string;
  deliveryDate?: string; 
  notes?: string;
  extraCommentary?: string;
  tecnica?: string;
  hornoId?: string;
  lote?: string;
  foto?: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCard {
  id: string;
  buyerId: string;
  recipientId: string;
  buyer?: Client;
  recipient?: Client;
  numClasses: number;
  type: 'modelado' | 'torno';
  scheduledDate?: string;
  createdAt: string; 
  extraCommentary?: string;
}
