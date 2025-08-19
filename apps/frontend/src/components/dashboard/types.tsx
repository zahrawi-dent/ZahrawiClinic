
export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  dentist: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedTreatments: number;
  revenue: number;
  newPatients: number;
}
