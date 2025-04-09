// Database API Types matching the backend structures from schema.ts

// Basic entity types
export interface Patient {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string
  email: string | null
  address: string | null
  insuranceProvider: string | null
  insuranceNumber: string | null
  medicalHistory: string | null
  allergies: string | null
  notes: string | null
  createdAt: number | Date
  updatedAt: number | Date
}

export interface Dentist {
  id: number
  firstName: string
  lastName: string
  specialization: string | null
  phone: string
  email: string
  licenseNumber: string
  notes: string | null
  createdAt: number | Date
  updatedAt: number | Date
}

export interface Appointment {
  id: number
  patientId: number
  dentistId: number
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  type: string
  notes: string | null
  createdAt: number | Date
  updatedAt: number | Date
}

export interface TreatmentProcedure {
  id: number
  code: string
  name: string
  description: string | null
  defaultCost: number
  category: string
  duration: number
  createdAt: number | Date
  updatedAt: number | Date
}

export interface Treatment {
  id: number
  patientId: number
  dentistId: number
  procedureId: number
  appointmentId: number | null
  treatmentDate: string
  cost: number
  tooth: string | null
  notes: string | null
  status: string
  createdAt: number | Date
  updatedAt: number | Date
}

export interface Payment {
  id: number
  patientId: number
  amount: number
  paymentDate: string
  paymentMethod: string
  relatedTreatmentIds: string | null
  notes: string | null
  receiptNumber: string | null
  insuranceClaim: string | null
  createdAt: number | Date
  updatedAt: number | Date
}

export interface User {
  id: number
  username: string
  passwordHash: string
  role: string
  dentistId: number | null
  firstName: string
  lastName: string
  email: string | null
  lastLogin: number | null | Date
  active: boolean | number
  createdAt: number | Date
  updatedAt: number | Date
}

// Relations types
export interface PatientWithRelations extends Patient {
  appointments?: AppointmentWithRelations[]
  treatments?: TreatmentWithRelations[]
  payments?: Payment[]
  balance?: {
    totalCost: number
    totalPaid: number
    balance: number
  }
}

export interface DentistWithRelations extends Dentist {
  appointments?: AppointmentWithRelations[]
}

export interface AppointmentWithRelations extends Appointment {
  patient?: {
    id: number
    firstName: string
    lastName: string
    phone?: string
  }
  dentist?: {
    id: number
    firstName: string
    lastName: string
  }
}

export interface TreatmentWithRelations extends Treatment {
  patient?: {
    id: number
    firstName: string
    lastName: string
  }
  dentist?: {
    id: number
    firstName: string
    lastName: string
  }
  procedure?: {
    id: number
    name: string
    code: string
  }
}

// Define the shape of our database API
export interface DatabaseApi {
  // Patients
  getPatients: () => Promise<Patient[]>
  getPatientById: (id: number) => Promise<Patient | undefined>
  createPatient: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Patient>
  updatePatient: (id: number, data: Partial<Patient>) => Promise<Patient | undefined>
  deletePatient: (id: number) => Promise<boolean>
  getPatientWithAppointments: (id: number) => Promise<PatientWithRelations | undefined>
  getPatientWithTreatments: (id: number) => Promise<PatientWithRelations | undefined>
  getPatientWithBalance: (id: number) => Promise<PatientWithRelations | undefined>
  searchPatients: (term: string) => Promise<Patient[]>

  // Dentists
  getDentists: () => Promise<Dentist[]>
  getDentistById: (id: number) => Promise<Dentist | undefined>
  createDentist: (data: Omit<Dentist, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Dentist>
  updateDentist: (id: number, data: Partial<Dentist>) => Promise<Dentist | undefined>
  deleteDentist: (id: number) => Promise<boolean>
  getDentistSchedule: (id: number, date: string) => Promise<AppointmentWithRelations[]>

  // Appointments
  getAppointments: () => Promise<AppointmentWithRelations[]>
  getAppointmentById: (id: number) => Promise<AppointmentWithRelations | undefined>
  createAppointment: (
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Appointment>
  updateAppointment: (id: number, data: Partial<Appointment>) => Promise<Appointment | undefined>
  deleteAppointment: (id: number) => Promise<boolean>
  getAppointmentsByDateRange: (
    startDate: string,
    endDate: string
  ) => Promise<AppointmentWithRelations[]>
  checkAppointmentConflicts: (
    dentistId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: number
  ) => Promise<boolean>

  // Treatment Procedures
  getProcedures: () => Promise<TreatmentProcedure[]>
  getProcedureById: (id: number) => Promise<TreatmentProcedure | undefined>
  createProcedure: (
    data: Omit<TreatmentProcedure, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<TreatmentProcedure>
  updateProcedure: (
    id: number,
    data: Partial<TreatmentProcedure>
  ) => Promise<TreatmentProcedure | undefined>
  deleteProcedure: (id: number) => Promise<boolean>
  getProceduresByCategory: (category: string) => Promise<TreatmentProcedure[]>

  // Treatments
  getTreatments: () => Promise<TreatmentWithRelations[]>
  getTreatmentById: (id: number) => Promise<TreatmentWithRelations | undefined>
  createTreatment: (data: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Treatment>
  updateTreatment: (id: number, data: Partial<Treatment>) => Promise<Treatment | undefined>
  deleteTreatment: (id: number) => Promise<boolean>
  getTreatmentsByPatient: (patientId: number) => Promise<TreatmentWithRelations[]>
  getTreatmentsByStatus: (status: string) => Promise<TreatmentWithRelations[]>

  // Payments
  getPayments: () => Promise<Payment[]>
  getPaymentById: (id: number) => Promise<Payment | undefined>
  createPayment: (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Payment>
  updatePayment: (id: number, data: Partial<Payment>) => Promise<Payment | undefined>
  deletePayment: (id: number) => Promise<boolean>
  getPaymentsByDateRange: (startDate: string, endDate: string) => Promise<Payment[]>
  getPaymentsByPatient: (patientId: number) => Promise<Payment[]>

  // Auth
  createUser: (userData: any) => Promise<User[]>
  getUsers: () => Promise<User[]>
}

// Add global window type extension
declare global {
  interface Window {
    dentalApi: DatabaseApi
  }
}

