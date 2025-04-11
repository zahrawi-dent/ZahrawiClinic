import { BaseRecord } from "./dental"
import { Dentist, Patient } from "./dental-api";

// Enum for Appointment Status
export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
  Rescheduled = 'rescheduled',
  Waiting = 'waiting',
  InProgress = 'in_progress'
}

export enum AppointmentType {
  CheckupRoutineExam = "Check-up/Routine Exam",
  CleaningHygiene = "Cleaning/Hygiene",
  XraysRadiography = "X-rays/Radiography",
  Consultation = "Consultation",
  FluorideTreatment = "Fluoride Treatment",
  Sealants = "Sealants",
  Filling = "Filling",
  Crown = "Crown",
  Bridge = "Bridge",
  Denture = "Denture",
  RootCanal = "Root Canal",
  Extraction = "Extraction",
  ImplantConsultation = "Implant Consultation",
  ImplantPlacement = "Implant Placement",
  ImplantRestoration = "Implant Restoration",
  TeethWhitening = "Teeth Whitening",
  Veneers = "Veneers",
  Bonding = "Bonding",
  InvisalignOrthodonticAdjustment = "Invisalign/Orthodontic Adjustment",
  EmergencyVisit = "Emergency Visit",
  FollowUp = "Follow-up",
  PediatricExam = "Pediatric Exam",
  DentalExamination = "Dental Examination",
  OralSurgeryProcedure = "Oral Surgery Procedure",
  OralSurgeryConsultation = "Oral Surgery Consultation",
  PeriodontalMaintenance = "Periodontal Maintenance",
  PeriodontalTreatment = "Periodontal Treatment",
  Orthodontics = "Orthodontics",
  Other = "Other",
}

export interface Appointment extends BaseRecord {
  date: string; // ISO date string
  status?: AppointmentStatus;
  reasonForVisit?: string;
  patient: string; // Relation ID (Patient ID)
  dentist: string; // Relation ID (Dentist ID)
  notes?: string; // Editor content (HTML string)
  duration?: number;
  type: AppointmentType;
  // --- Crucial for getting patient name easily ---
  expand?: {
    patient?: Patient; // The expanded patient record
    dentist?: Dentist;
  };
}

export function getAppointmentTypeColor(type: AppointmentType): { bg: string, text: string, dot: string } {
  console.log('-----------------------------', type)
  switch (type) {
    case AppointmentType.CheckupRoutineExam: return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
    case AppointmentType.CleaningHygiene: return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
    case AppointmentType.XraysRadiography: return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
    case AppointmentType.Consultation: return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    case AppointmentType.FluorideTreatment: return { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' };
    case AppointmentType.Sealants: return { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500' };
    case AppointmentType.Filling: return { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' };
    case AppointmentType.Crown: return { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' };
    case AppointmentType.Bridge: return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
    case AppointmentType.Denture: return { bg: 'bg-lime-100', text: 'text-lime-800', dot: 'bg-lime-500' };
    case AppointmentType.RootCanal: return { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' };
    case AppointmentType.Extraction: return { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', dot: 'bg-fuchsia-500' };
    case AppointmentType.ImplantConsultation: return { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500' };
    case AppointmentType.ImplantPlacement: return { bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-500' };
    case AppointmentType.ImplantRestoration: return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' };
    case AppointmentType.TeethWhitening: return { bg: 'bg-violet-100', text: 'text-violet-800', dot: 'bg-violet-500' };
    case AppointmentType.Veneers: return { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500' };
    case AppointmentType.Bonding: return { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' };
    case AppointmentType.Orthodontics: return { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' };
    case AppointmentType.PeriodontalMaintenance: return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
    case AppointmentType.OralSurgeryProcedure: return { bg: 'bg-lime-100', text: 'text-lime-800', dot: 'bg-lime-500' };
    case AppointmentType.InvisalignOrthodonticAdjustment: return { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' };
    case AppointmentType.EmergencyVisit: return { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', dot: 'bg-fuchsia-500' };
    case AppointmentType.FollowUp: return { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500' };

    case AppointmentType.PediatricExam: return { bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-500' };
    case AppointmentType.DentalExamination: return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' };
    case AppointmentType.OralSurgeryConsultation: return { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500' };
    case AppointmentType.PeriodontalTreatment: return { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' };



    case AppointmentType.Other: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  }
}


export function getAppointmentStatusColor(status: AppointmentStatus): { bg: string, text: string, dot: string } {
  switch (status) {
    case AppointmentStatus.Pending: return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
    case AppointmentStatus.Completed: return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
    case AppointmentStatus.Cancelled: return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    case AppointmentStatus.NoShow: return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
    case AppointmentStatus.InProgress: return { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  }

}
// Helper functions for formatting dates and appointment status
export function formatAppointmentTime(dateTimeStr: string) {
  try {
    return new Date(dateTimeStr).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (e) {
    return 'Invalid time';
  }
}

export function formatAppointmentDate(dateTimeStr: string) {
  try {
    return new Date(dateTimeStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
}
