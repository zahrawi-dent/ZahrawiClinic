// Re-export all types from dental-api.d.ts
export * from './dental-api'

// Export existing types from the current types.ts file
export interface UserUI {
  id: number
  name: string
  email: string
  role: string
}

export interface PatientUI {
  id: number
  name: string
  email: string
  phone: string
  lastVisit: string
  address?: string
  dob?: string
  sex?: string
}

export interface AppointmentUI {
  id: number
  patientName: string
  procedure: string
  time: string
  doctor?: string
  status?: string
}

export interface TreatmentUI {
  id: number
  date: string
  procedure: string
  notes: string
  doctor: string
}

export interface InvoiceUI {
  id: number
  date: string
  amount: number
  status: string
  description: string
}

