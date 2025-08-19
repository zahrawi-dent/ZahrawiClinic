import type { Appointment, DashboardStats, Patient } from "./types";

export const mockStats: DashboardStats = {
  totalPatients: 1247,
  todayAppointments: 23,
  pendingAppointments: 8,
  completedTreatments: 156,
  revenue: 45600,
  newPatients: 12
};

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientId: 'P001',
    date: '2024-01-15',
    time: '09:00 AM',
    type: 'Dental Cleaning',
    status: 'scheduled',
    dentist: 'Dr. Smith'
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientId: 'P002',
    date: '2024-01-15',
    time: '10:30 AM',
    type: 'Root Canal',
    status: 'in-progress',
    dentist: 'Dr. Johnson'
  },
  {
    id: '3',
    patientName: 'Emily Davis',
    patientId: 'P003',
    date: '2024-01-15',
    time: '02:00 PM',
    type: 'Crown Placement',
    status: 'scheduled',
    dentist: 'Dr. Williams'
  }
];


export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    lastVisit: '2024-01-12',
    status: 'active'
  }
];
