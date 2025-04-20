// services/pocketbase.js

import PocketBase from 'pocketbase'
import type { ListResult, RecordModel } from 'pocketbase' // Use RecordModel as a fallback if needed
import {
  type Patient,
  type PatientData,
  type PatientWithTreatments,
  type PatientWithBalance,
  type PatientBalance,
  type Dentist,
  type DentistData,
  type DentistScheduleItem,
  type AppointmentData,
  type ExpandedAppointment,
  type Treatment,
  type TreatmentData,
  type ExpandedTreatment,
  type Payment,
  type PaymentData,
  type Procedure, // Assuming Procedure type might be needed indirectly
  Collections
} from './types/dental' // Adjust path as needed
import { type Appointment } from './types/appointments'

import { getEndOfDayString, getStartOfDayString, getStartOfWeekString } from './utils/dateUtils'

const pb = new PocketBase('http://127.0.0.1:8090')

//await pb.collection('_superusers').authWithPassword('muhammadatefsw@gmail.com', '3jwfk39v8eu9EJg')


async function setup() {

  await pb.collection('_superusers').authWithPassword('muhammadatefsw@gmail.com', '3jwfk39v8eu9EJg')
}

setup().then(() => {
  console.log('Setup completed.')
}).catch((error) => {
  console.error('Setup failed:', error)
})
// Structure returned by PocketBase getList
export interface PaginatedResult<T> {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

// src/services/dentalOperations.ts

// Helper function for safe error handling (optional but recommended)
function handleError(error: unknown, context: string): never {
  console.error(`${context}:`, error)
  // You could check if error is an instance of PocketBase's ClientResponseError
  // and extract more specific details if needed.
  const message = error instanceof Error ? error.message : String(error)
  throw new Error(`${context}: ${message}`)
}

// Custom Types for dental charts
export interface DentalChart extends RecordModel {
  patient: string; // Reference to patient ID
  chartData: string; // Stringified JSON object containing dental chart state
}

export type DentalChartData = Omit<DentalChart, keyof RecordModel | 'expand'>

export class DentalOperations {
  // Helper to get typed collection access
  private collection<T extends RecordModel>(name: string) {
    return pb.collection<T>(name)
  }

  // ===== PATIENT OPERATIONS =====
  patients = {
    create: async (patientData: PatientData): Promise<Patient> => {
      try {
        return await this.collection<Patient>('patients').create(patientData)
      } catch (error) {
        handleError(error, 'Error creating patient')
      }
    },

    getAll: async (page = 1, perPage = 100): Promise<Patient[]> => {
      try {
        const result: ListResult<Patient> = await this.collection<Patient>('patients').getList(
          page,
          perPage,
          {
            sort: 'firstName,lastName' // Sort by last then first name
          }
        )
        return result.items
      } catch (error) {
        handleError(error, 'Error fetching patients')
      }
    },

    getById: async (id: string): Promise<Patient> => {
      try {
        return await this.collection<Patient>('patients').getOne(id)
      } catch (error) {
        handleError(error, `Error fetching patient with ID ${id}`)
      }
    },

    search: async (searchTerm: string, limit = 50): Promise<Patient[]> => {
      if (!searchTerm?.trim()) return [] // Avoid empty search
      try {
        // Use PocketBase recommended way for safe filter values
        const filter = `(firstName ~ {:term} || lastName ~ {:term} || phone ~ {:term} || email ~ {:term})`
        const result = await this.collection<Patient>('patients').getList(1, limit, {
          filter: pb.filter(filter, { term: searchTerm.trim() })
        })
        return result.items
      } catch (error) {
        handleError(error, 'Error searching patients')
      }
    },

    update: async (id: string, patientData: Partial<PatientData>): Promise<Patient> => {
      try {
        // Use Partial<> as typically updates modify only some fields
        return await this.collection<Patient>('patients').update(id, patientData)
      } catch (error) {
        handleError(error, `Error updating patient with ID ${id}`)
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        await this.collection<Patient>('patients').delete(id)
        return true
      } catch (error) {
        handleError(error, `Error deleting patient with ID ${id}`)
      }
    },

    getWithAppointments: async (patientId: string): Promise<ExpandedAppointment[]> => {
      if (!patientId) {
        console.error('Patient ID is required.');
        return; // Or throw an error
      }

      try {
        const appointmentsResult = await this.collection<Appointment>(Collections.Appointments).getList(
          1,
          100,
          {
            filter: pb.filter('patient = {:patientId}', { patientId }),
            sort: '-date',
            expand: 'dentist' // Only expand dentist as per original logic
          }
        )

        const formattedAppointments: ExpandedAppointment[] = appointmentsResult.items.map(
          (apt) => ({
            ...apt, // Spread base fields (id, created, updated, date, time, status, notes etc.)
            patientId: apt.patient, // Keep original relation ID
            dentistId: apt.dentist, // Keep original relation ID
            patient: null, // Patient is not expanded in this specific call
            dentist: apt.expand?.dentist
              ? {
                id: apt.expand.dentist.id,
                firstName: apt.expand.dentist.firstName,
                lastName: apt.expand.dentist.lastName
              }
              : null
          })
        )

        console.log('Formatted Appointments:', formattedAppointments)

        return formattedAppointments
      } catch (error) {
        handleError(error, `Error fetching patient with appointments for ID ${patientId}`)
      }
    },

    getWithTreatments: async (patientId: string): Promise<PatientWithTreatments> => {
      try {
        const patient = await this.patients.getById(patientId)

        const treatmentsResult = await this.collection<Treatment>('treatments').getList(1, 100, {
          // Maybe increase limit?
          filter: pb.filter('patient = {:patientId}', { patientId }),
          sort: '-treatmentDate',
          expand: 'dentist,procedure'
        })

        const formattedTreatments: ExpandedTreatment[] = treatmentsResult.items.map((tx) => ({
          ...tx, // Spread base treatment fields
          patientId: tx.patient,
          dentistId: tx.dentist,
          procedureId: tx.procedure,
          dentist: tx.expand?.dentist
            ? {
              id: tx.expand.dentist.id,
              firstName: tx.expand.dentist.firstName,
              lastName: tx.expand.dentist.lastName
            }
            : null,
          procedure: tx.expand?.procedure
            ? {
              id: tx.expand.procedure.id,
              name: tx.expand.procedure.name,
              code: tx.expand.procedure.code
            }
            : null
        }))

        return {
          ...patient,
          treatments: formattedTreatments
        }
      } catch (error) {
        handleError(error, `Error fetching patient with treatments for ID ${patientId}`)
      }
    },

    getWithBalance: async (patientId: string): Promise<PatientWithBalance> => {
      try {
        const patient = await this.patients.getById(patientId)

        // Use getAllRecords to fetch all matching items, avoiding pagination limits for calculation
        const treatments = await this.collection<Treatment>('treatments').getFullList({
          filter: pb.filter('patient = {:patientId}', { patientId })
          // Only fetch 'cost' field to optimize? Check if PocketBase supports fields selection
          // fields: 'cost'
        })
        const totalCost = treatments.reduce((sum, tx) => sum + (tx.cost || 0), 0)

        const payments = await this.collection<Payment>('payments').getFullList({
          filter: pb.filter('patient = {:patientId}', { patientId })
          // fields: 'amount'
        })
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

        const balance: PatientBalance = {
          totalCost,
          totalPaid,
          balance: totalCost - totalPaid
        }

        return {
          ...patient,
          balance
        }
      } catch (error) {
        handleError(error, `Error calculating balance for patient with ID ${patientId}`)
      }
    },

    getPayments: async (patientId: string, page = 1, perPage = 100): Promise<Payment[]> => {
      try {
        const result = await this.collection<Payment>('payments').getList(page, perPage, {
          filter: pb.filter('patient = {:patientId}', { patientId }),
          sort: '-paymentDate'
        })
        return result.items
      } catch (error) {
        handleError(error, `Error fetching payments for patient with ID ${patientId}`)
      }
    }
  }

  // ===== DENTIST OPERATIONS =====
  dentists = {
    create: async (dentistData: DentistData): Promise<Dentist> => {
      try {
        return await this.collection<Dentist>('dentists').create(dentistData)
      } catch (error) {
        handleError(error, 'Error creating dentist')
      }
    },

    getAll: async (page = 1, perPage = 100): Promise<Dentist[]> => {
      try {
        const result = await this.collection<Dentist>('dentists').getList(page, perPage, {
          sort: 'lastName,firstName'
        })
        return result.items
      } catch (error) {
        handleError(error, 'Error fetching dentists')
      }
    },

    getById: async (id: string): Promise<Dentist> => {
      try {
        return await this.collection<Dentist>('dentists').getOne(id)
      } catch (error) {
        handleError(error, `Error fetching dentist with ID ${id}`)
      }
    },

    update: async (id: string, dentistData: Partial<DentistData>): Promise<Dentist> => {
      try {
        return await this.collection<Dentist>('dentists').update(id, dentistData)
      } catch (error) {
        handleError(error, `Error updating dentist with ID ${id}`)
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        await this.collection<Dentist>('dentists').delete(id)
        return true
      } catch (error) {
        handleError(error, `Error deleting dentist with ID ${id}`)
      }
    },

    getSchedule: async (dentistId: string, date: string): Promise<DentistScheduleItem[]> => {
      // Validate date format if necessary 'YYYY-MM-DD'
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.warn(`Invalid date format provided for getSchedule: ${date}. Expected YYYY-MM-DD.`)
        // Optionally throw an error or return empty array
        // throw new Error("Invalid date format. Use YYYY-MM-DD.");
        return []
      }

      try {
        const appointmentsResult = await this.collection<Appointment>('appointments').getList(
          1,
          50,
          {
            // 50 appts per day seems reasonable
            filter: pb.filter('dentist = {:dentistId} && appointmentDate = {:date}', {
              dentistId,
              date
            }),
            sort: '+startTime',
            expand: 'patient' // Expand patient details
          }
        )

        // Map to the expected structure (DentistScheduleItem inherits from ExpandedAppointment)
        return appointmentsResult.items.map((apt) => ({
          ...apt, // Base appointment fields
          patientId: apt.patient,
          dentistId: apt.dentist,
          // Map expanded patient, include phone as in original
          patient: apt.expand?.patient
            ? {
              id: apt.expand.patient.id,
              firstName: apt.expand.patient.firstName,
              lastName: apt.expand.patient.lastName,
              phone: apt.expand.patient.phone // Include phone here
            }
            : null,
          dentist: null // Dentist info is known (dentistId), not expanded here
        }))
      } catch (error) {
        handleError(error, `Error fetching schedule for dentist ID ${dentistId} on ${date}`)
      }
    }
  }

  // ===== APPOINTMENT OPERATIONS =====
  appointments = {
    create: async (appointmentData: Appointment): Promise<Appointment> => {
      try {
        // Add validation for overlapping times if needed *before* creating
        return await this.collection<Appointment>('appointments').create(appointmentData)
      } catch (error) {
        handleError(error, 'Error creating appointment')
      }
    },

    getAll: async (page = 1, perPage = 100): Promise<PaginatedResult<Appointment>> => {
      try {
        const result = await this.collection<Appointment>('appointments').getList(page, perPage, {
          sort: '-date',
          expand: 'patient,dentist' // Expand both
        })

        // return result.items.map(this.mapToExpandedAppointment) // Use helper mapper
        return result
        // return result
      } catch (error) {
        handleError(error, 'Error fetching appointments')
      }
    },

    fetchRecentAppointments: async (): Promise<PaginatedResult<Appointment>> => {
      const result = await pb.collection('appointments').getList<Appointment>(1, 5, { // Page 1, 5 per page
        sort: '-date', // Sort by date/time descending (most recent first)
        expand: 'patient', // IMPORTANT: Expand the patient relation
        // Optional: Add filter if needed, e.g., filter out past appointments
        // filter: `dateTime >= "${new Date().toISOString()}"`
      });

      return result;
    },
    updateAppointmentStatus: async (id: string, status: string): Promise<Appointment> => {
      try {
        return await this.collection<Appointment>('appointments').update(id, { status });
      } catch (error) {
        handleError(error, `Error updating appointment with ID ${id}`);
      }
    },

    // Fetch count of appointments for today
    fetchAppointmentsTodayCount: async (): Promise<number> => {
      const start = getStartOfDayString();
      const end = getEndOfDayString();
      const result = await pb.collection('appointments').getList(1, 1, { // Only need 1 item to get total
        filter: `date >= "${start}" && date <= "${end}"`,
      });
      return result.totalItems; // Return the total count
    },
    // Fetch count of new patients created this week (assuming Monday is start of week)
    fetchNewPatientsThisWeekCount: async (): Promise<number> => {
      const startOfWeek = getStartOfWeekString();
      // Filter by creation date >= start of the week
      const result = await pb.collection('patients').getList(1, 1, { // Only need 1 item to get total
        filter: `created >= "${startOfWeek}"`,
      });
      return result.totalItems;
    },

    getById: async (id: string): Promise<ExpandedAppointment> => {
      try {
        const appointment = await this.collection<Appointment>('appointments').getOne(id, {
          expand: 'patient,dentist'
        })
        return this.mapToExpandedAppointment(appointment) // Use helper mapper
      } catch (error) {
        handleError(error, `Error fetching appointment with ID ${id}`)
      }
    },

    update: async (id: string, appointmentData: Partial<AppointmentData>): Promise<Appointment> => {
      try {
        // Add validation for overlapping times if date/time/dentist changes
        return await this.collection<Appointment>('appointments').update(id, appointmentData)
      } catch (error) {
        handleError(error, `Error updating appointment with ID ${id}`)
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        await this.collection<Appointment>('appointments').delete(id)
        return true
      } catch (error) {
        handleError(error, `Error deleting appointment with ID ${id}`)
      }
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<ExpandedAppointment[]> => {
      // Add date validation if needed
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.')
      }
      try {
        // Use getFullList if the potential number of appointments could exceed typical page limits often
        const appointments = await this.collection<Appointment>('appointments').getFullList({
          filter: pb.filter('appointmentDate >= {:startDate} && appointmentDate <= {:endDate}', {
            startDate,
            endDate
          }),
          sort: '+appointmentDate,+startTime',
          expand: 'patient,dentist'
        })

        return appointments.map(this.mapToExpandedAppointment) // Use helper mapper
      } catch (error) {
        handleError(error, `Error fetching appointments for date range ${startDate} to ${endDate}`)
      }
    },

    checkConflicts: async (
      dentistId: string,
      date: string, // YYYY-MM-DD
      startTime: string, // HH:MM
      endTime: string, // HH:MM
      excludeAppointmentId?: string // Optional ID to ignore (when updating)
    ): Promise<Appointment[]> => {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !/^\d{2}:\d{2}$/.test(startTime) ||
        !/^\d{2}:\d{2}$/.test(endTime)
      ) {
        throw new Error('Invalid date/time format.')
      }
      try {
        // PocketBase filter syntax for time overlap check:
        // (start1 < end2) and (end1 > start2)
        let filter = `dentist = {:dentistId} && appointmentDate = {:date} && startTime < {:endTime} && endTime > {:startTime}`
        const params: { [key: string]: string } = { dentistId, date, startTime, endTime }

        if (excludeAppointmentId) {
          filter += ` && id != {:excludeId}`
          params.excludeId = excludeAppointmentId
        }

        const conflicts = await this.collection<Appointment>('appointments').getFullList({
          filter: pb.filter(filter, params)
        })

        return conflicts
      } catch (error) {
        handleError(error, 'Error checking for appointment conflicts')
      }
    },

    fetchAppointmentsStats: async (): Promise<{ total: number; completed: number; cancelled: number; noShows: number }> => {
      try {
        // Get total appointments
        const totalResult = await this.collection<Appointment>('appointments').getList(1, 1);
        const total = totalResult.totalItems;

        // Get completed appointments
        const completedResult = await this.collection<Appointment>('appointments').getList(1, 1, {
          filter: 'status = "completed"'
        });
        const completed = completedResult.totalItems;

        // Get cancelled appointments
        const cancelledResult = await this.collection<Appointment>('appointments').getList(1, 1, {
          filter: 'status = "cancelled"'
        });
        const cancelled = cancelledResult.totalItems;

        // Get no-show appointments
        const noShowsResult = await this.collection<Appointment>('appointments').getList(1, 1, {
          filter: 'status = "noshow"'
        });
        const noShows = noShowsResult.totalItems;

        return { total, completed, cancelled, noShows };
      } catch (error) {
        handleError(error, 'Error fetching appointment statistics');
        return { total: 0, completed: 0, cancelled: 0, noShows: 0 };
      }
    },
  }

  // ===== TREATMENT OPERATIONS ===== (Added based on Patient methods)
  treatments = {
    create: async (treatmentData: TreatmentData): Promise<Treatment> => {
      try {
        return await this.collection<Treatment>('treatments').create(treatmentData)
      } catch (error) {
        handleError(error, 'Error creating treatment')
      }
    },

    getById: async (id: string): Promise<ExpandedTreatment> => {
      try {
        const treatment = await this.collection<Treatment>('treatments').getOne(id, {
          expand: 'dentist,procedure' // Expand necessary fields
        })
        return this.mapToExpandedTreatment(treatment) // Use helper mapper
      } catch (error) {
        handleError(error, `Error fetching treatment with ID ${id}`)
      }
    },

    update: async (id: string, treatmentData: Partial<TreatmentData>): Promise<Treatment> => {
      try {
        return await this.collection<Treatment>('treatments').update(id, treatmentData)
      } catch (error) {
        handleError(error, `Error updating treatment with ID ${id}`)
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        await this.collection<Treatment>('treatments').delete(id)
        return true
      } catch (error) {
        handleError(error, `Error deleting treatment with ID ${id}`)
      }
    }

    // You might add getByPatientId, getByDateRange etc. if needed
  }

  // ===== PAYMENT OPERATIONS ===== (Added based on Patient methods)
  payments = {
    create: async (paymentData: PaymentData): Promise<Payment> => {
      try {
        return await this.collection<Payment>('payments').create(paymentData)
      } catch (error) {
        handleError(error, 'Error creating payment')
      }
    },

    getById: async (id: string): Promise<Payment> => {
      // Payments usually don't need much expansion by default
      try {
        return await this.collection<Payment>('payments').getOne(id)
      } catch (error) {
        handleError(error, `Error fetching payment with ID ${id}`)
      }
    },

    update: async (id: string, paymentData: Partial<PaymentData>): Promise<Payment> => {
      try {
        return await this.collection<Payment>('payments').update(id, paymentData)
      } catch (error) {
        handleError(error, `Error updating payment with ID ${id}`)
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        await this.collection<Payment>('payments').delete(id)
        return true
      } catch (error) {
        handleError(error, `Error deleting payment with ID ${id}`)
      }
    }
    // getByPatientId is already covered in the patient section
  }

  // ===== PROCEDURE OPERATIONS ===== (Placeholder, implement if needed)
  procedures = {
    getAll: async (page = 1, perPage = 100): Promise<Procedure[]> => {
      try {
        const result = await this.collection<Procedure>('procedures').getList(page, perPage, {
          sort: 'name'
        })
        return result.items
      } catch (error) {
        handleError(error, 'Error fetching procedures')
      }
    }
    // Add create, update, delete, getById as necessary
  }

  // ===== DENTAL CHART OPERATIONS =====
  dentalCharts = {
    create: async (chartData: DentalChartData): Promise<DentalChart> => {
      try {
        return await this.collection<DentalChart>('dental_charts').create(chartData);
      } catch (error) {
        handleError(error, 'Error creating dental chart')
      }
    },
    
    getByPatientId: async (patientId: string): Promise<DentalChart | null> => {
      try {
        const result = await this.collection<DentalChart>('dental_charts').getList(1, 1, {
          filter: pb.filter('patient = {:patientId}', { patientId })
        });
        
        // Return the first chart found, or null if none exists
        return result.items.length > 0 ? result.items[0] : null;
      } catch (error) {
        handleError(error, `Error fetching dental chart for patient with ID ${patientId}`)
      }
    },
    
    update: async (chartId: string, chartData: Partial<DentalChartData>): Promise<DentalChart> => {
      try {
        return await this.collection<DentalChart>('dental_charts').update(chartId, chartData);
      } catch (error) {
        handleError(error, `Error updating dental chart with ID ${chartId}`)
      }
    },
    
    delete: async (chartId: string): Promise<boolean> => {
      try {
        await this.collection<DentalChart>('dental_charts').delete(chartId);
        return true;
      } catch (error) {
        handleError(error, `Error deleting dental chart with ID ${chartId}`)
      }
    }
  }

  // --- Helper Mappers for Consistent Expanded Types ---

  private mapToExpandedAppointment(apt: Appointment): ExpandedAppointment {
    return {
      ...apt,
      patientId: apt.patient,
      dentistId: apt.dentist,
      patient: apt.expand?.patient
        ? {
          id: apt.expand.patient.id,
          firstName: apt.expand.patient.firstName,
          lastName: apt.expand.patient.lastName,
          phone: apt.expand.patient.phone // Include phone if needed here too
        }
        : null,
      dentist: apt.expand?.dentist
        ? {
          id: apt.expand.dentist.id,
          firstName: apt.expand.dentist.firstName,
          lastName: apt.expand.dentist.lastName
        }
        : null
    }
  }

  private mapToExpandedTreatment(tx: Treatment): ExpandedTreatment {
    return {
      ...tx,
      patientId: tx.patient,
      dentistId: tx.dentist,
      procedureId: tx.procedure,
      dentist: tx.expand?.dentist
        ? {
          id: tx.expand.dentist.id,
          firstName: tx.expand.dentist.firstName,
          lastName: tx.expand.dentist.lastName
        }
        : null,
      procedure: tx.expand?.procedure
        ? {
          id: tx.expand.procedure.id,
          name: tx.expand.procedure.name,
          code: tx.expand.procedure.code
        }
        : null
    }
  }
}

export const dentalOps = new DentalOperations()
