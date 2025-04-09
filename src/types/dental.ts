// src/types/dental.ts

import type { RecordModel } from 'pocketbase'

// Base interface for all PocketBase records to include common fields
export interface BaseRecord extends RecordModel {
  id: string
  created: string // ISO Date string
  updated: string // ISO Date string
}


// Enum for Patient Sex
export enum Sex {
  Male = 'male',
  Female = 'female',
}

// --- Concrete Record Types ---

export interface Patient extends BaseRecord {
  //id: string
  firstName: string;
  lastName: string;
  age: number;
  phone?: string;
  sex: Sex;
  address?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  medicalHistory?: string; // Editor content (HTML string)
  notes?: string; // Editor content (HTML string)
  email?: string;

}

export interface Dentist extends BaseRecord {
  firstName: string;
  lastName: string;
  licenseNumber?: string;
  phone?: string;
  specialty: string;
  email?: string;
  notes?: string; // Editor content (HTML string)
}

export interface Procedure extends BaseRecord {
  name: string
  code?: string // e.g., ADA code
  description?: string
  defaultCost?: number
  // Add any other procedure-specific fields
}

// Enum for Appointment Status
export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
  Rescheduled = 'rescheduled',
  Waiting = 'waiting',
}

export interface Appointment extends BaseRecord {
  date: string; // ISO date string
  status?: AppointmentStatus;
  reasonForVisit?: string;
  patient: string; // Relation ID (Patient ID)
  dentist: string; // Relation ID (Dentist ID)
  notes?: string; // Editor content (HTML string)
  duration?: string;
}


export interface Treatment extends BaseRecord {
  patient: string // Relation ID
  dentist: string // Relation ID
  procedure: string // Relation ID
  treatmentDate: string // 'YYYY-MM-DD'
  description?: string
  cost: number
  notes?: string
  toothNumber?: string | number // e.g., 'UL6' or 18
  status?: 'planned' | 'completed' | 'in-progress'
  expand?: {
    patient?: Patient
    dentist?: Dentist
    procedure?: Procedure
  }
}

export interface Payment extends BaseRecord {
  patient: string // Relation ID
  amount: number
  paymentDate: string // 'YYYY-MM-DD'
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'insurance' | 'other'
  notes?: string
  treatment?: string // Optional relation ID to a specific treatment
  expand?: {
    patient?: Patient
    treatment?: Treatment
  }
}

export interface Invoice {
  patient: string // Relation ID
  amount: number
  invoiceDate: string // 'YYYY-MM-DD'
  notes?: string
}

// --- Input Data Types (for Create/Update) ---
// Use Omit to exclude PocketBase-generated fields

export type PatientData = Omit<Patient, keyof BaseRecord | 'expand'>
export type DentistData = Omit<Dentist, keyof BaseRecord | 'expand'>
export type ProcedureData = Omit<Procedure, keyof BaseRecord | 'expand'>
export type AppointmentData = Omit<Appointment, keyof BaseRecord | 'expand'>
export type TreatmentData = Omit<Treatment, keyof BaseRecord | 'expand'>
export type PaymentData = Omit<Payment, keyof BaseRecord | 'expand'>

// --- Types for Specific Return Structures (with expanded/formatted data) ---

// Helper type for simplified reference in expanded objects
type BaseReference = { id: string }
type PersonReference = BaseReference & { firstName: string; lastName: string }
type PatientReference = PersonReference & { phone?: string } // Add phone if needed
type ProcedureReference = BaseReference & { name: string; code?: string }

export interface ExpandedAppointment extends Omit<Appointment, 'expand' | 'patient' | 'dentist'> {
  patientId: string
  dentistId: string
  patient: PatientReference | null // Simplified expanded patient
  dentist: PersonReference | null // Simplified expanded dentist
}

export interface ExpandedTreatment
  extends Omit<Treatment, 'expand' | 'patient' | 'dentist' | 'procedure'> {
  patientId: string
  dentistId: string
  procedureId: string
  // patient: PersonReference | null; // Patient info not typically expanded here, but could be
  dentist: PersonReference | null
  procedure: ProcedureReference | null
}

// This type represents a PatientRecord with its related appointments expanded
// The key 'appointments(patient)' matches the PocketBase expand syntax
export type PatientWithAppointments = Patient & {
  expand?: {
    'appointments(patient)'?: Appointment[]; // Array of related appointments
  };
};

export interface PatientWithTreatments extends Patient {
  treatments: ExpandedTreatment[]
}

export interface PatientBalance {
  totalCost: number
  totalPaid: number
  balance: number
}

export interface PatientWithBalance extends Patient {
  balance: PatientBalance
}

export interface DentistScheduleItem extends ExpandedAppointment {
  // Inherits fields from ExpandedAppointment, already has patient details needed
}

// Define your collection names/IDs
export const Collections = {
  Appointments: 'appointments', // or 'pbc_1037645436'
  Patients: 'patients',         // or 'pbc_1820489269'
  Dentists: 'dentists',         // or 'pbc_69832866'
} as const; // using 'as const' makes the values readonly and specific strings
