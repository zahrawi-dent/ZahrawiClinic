/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
  Authorigins = "_authOrigins",
  Externalauths = "_externalAuths",
  Mfas = "_mfas",
  Otps = "_otps",
  Superusers = "_superusers",
  Appointments = "appointments",
  Clinics = "clinics",
  Organizations = "organizations",
  PatientTransfers = "patient_transfers",
  Patients = "patients",
  StaffMembers = "staff_members",
  TreatmentRecords = "treatment_records",
  TreatmentsCatalog = "treatments_catalog",
  Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

export type GeoPoint = {
  lon: number
  lat: number
}

type ExpandType<T> = unknown extends T
  ? T extends unknown
  ? { expand?: unknown }
  : { expand: T }
  : { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
  id: RecordIdString
  collectionId: string
  collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
  email: string
  emailVisibility: boolean
  username: string
  verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
  collectionRef: string
  created?: IsoDateString
  fingerprint: string
  id: string
  recordRef: string
  updated?: IsoDateString
}

export type ExternalauthsRecord = {
  collectionRef: string
  created?: IsoDateString
  id: string
  provider: string
  providerId: string
  recordRef: string
  updated?: IsoDateString
}

export type MfasRecord = {
  collectionRef: string
  created?: IsoDateString
  id: string
  method: string
  recordRef: string
  updated?: IsoDateString
}

export type OtpsRecord = {
  collectionRef: string
  created?: IsoDateString
  id: string
  password: string
  recordRef: string
  sentTo?: string
  updated?: IsoDateString
}

export type SuperusersRecord = {
  created?: IsoDateString
  email: string
  emailVisibility?: boolean
  id: string
  password: string
  tokenKey: string
  updated?: IsoDateString
  verified?: boolean
}

export enum AppointmentsStatusOptions {
  "scheduled" = "scheduled",
  "confirmed" = "confirmed",
  "completed" = "completed",
  "cancelled" = "cancelled",
  "no_show" = "no_show",
}
export type AppointmentsRecord = {
  clinic: RecordIdString[]
  doctor: RecordIdString[]
  end_time?: IsoDateString
  id: string
  notes?: string
  patient: RecordIdString[]
  reason?: string
  start_time: IsoDateString
  status: AppointmentsStatusOptions
}

export type ClinicsRecord = {
  address: string
  clinic_name: string
  geo_address?: GeoPoint
  id: string
  is_active: boolean
  organization: RecordIdString[]
  phone: string
}

export type OrganizationsRecord = {
  address: string
  id: string
  organization_name: string
  owners: RecordIdString[]
}

export type PatientTransfersRecord = {
  from_clinic: RecordIdString[]
  id: string
  patient: RecordIdString[]
  reason?: string
  to_clinic: RecordIdString[]
  transfer_date: IsoDateString
}

export enum PatientsSexOptions {
  "male" = "male",
  "female" = "female",
}
export type PatientsRecord = {
  address?: string
  dob: IsoDateString
  email?: string
  first_name: string
  id: string
  last_name: string
  medical_history?: string
  phone: string
  primary_clinic: RecordIdString[]
  sex: PatientsSexOptions
}

export enum StaffMembersRoleOptions {
  "org_admin" = "org_admin",
  "clinic_manager" = "clinic_manager",
  "dentist" = "dentist",
  "receptionist" = "receptionist",
}
export type StaffMembersRecord = {
  clinic: RecordIdString[]
  id: string
  is_active: boolean
  organization: RecordIdString[]
  role: StaffMembersRoleOptions
  user: RecordIdString[]
}

export type TreatmentRecordsRecord<Ttooth_numbers = unknown> = {
  appointment: RecordIdString[]
  clinic: RecordIdString[]
  clinical_notes?: string
  doctor: RecordIdString[]
  id: string
  patient: RecordIdString[]
  price_charged: number
  tooth_numbers?: null | Ttooth_numbers
}

export type TreatmentsCatalogRecord = {
  default_price: number
  description?: string
  id: string
  name: string
}

export type UsersRecord = {
  avatar?: string
  created?: IsoDateString
  email: string
  emailVisibility?: boolean
  id: string
  name?: string
  password: string
  tokenKey: string
  updated?: IsoDateString
  verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AppointmentsResponse<Texpand = unknown> = Required<AppointmentsRecord> & BaseSystemFields<Texpand>
export type ClinicsResponse<Texpand = unknown> = Required<ClinicsRecord> & BaseSystemFields<Texpand>
export type OrganizationsResponse<Texpand = unknown> = Required<OrganizationsRecord> & BaseSystemFields<Texpand>
export type PatientTransfersResponse<Texpand = unknown> = Required<PatientTransfersRecord> & BaseSystemFields<Texpand>
export type PatientsResponse<Texpand = unknown> = Required<PatientsRecord> & BaseSystemFields<Texpand>
export type StaffMembersResponse<Texpand = unknown> = Required<StaffMembersRecord> & BaseSystemFields<Texpand>
export type TreatmentRecordsResponse<Ttooth_numbers = unknown, Texpand = unknown> = Required<TreatmentRecordsRecord<Ttooth_numbers>> & BaseSystemFields<Texpand>
export type TreatmentsCatalogResponse<Texpand = unknown> = Required<TreatmentsCatalogRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  _authOrigins: AuthoriginsRecord
  _externalAuths: ExternalauthsRecord
  _mfas: MfasRecord
  _otps: OtpsRecord
  _superusers: SuperusersRecord
  appointments: AppointmentsRecord
  clinics: ClinicsRecord
  organizations: OrganizationsRecord
  patient_transfers: PatientTransfersRecord
  patients: PatientsRecord
  staff_members: StaffMembersRecord
  treatment_records: TreatmentRecordsRecord
  treatments_catalog: TreatmentsCatalogRecord
  users: UsersRecord
}

export type CollectionResponses = {
  _authOrigins: AuthoriginsResponse
  _externalAuths: ExternalauthsResponse
  _mfas: MfasResponse
  _otps: OtpsResponse
  _superusers: SuperusersResponse
  appointments: AppointmentsResponse
  clinics: ClinicsResponse
  organizations: OrganizationsResponse
  patient_transfers: PatientTransfersResponse
  patients: PatientsResponse
  staff_members: StaffMembersResponse
  treatment_records: TreatmentRecordsResponse
  treatments_catalog: TreatmentsCatalogResponse
  users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
  collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
  collection(idOrName: '_mfas'): RecordService<MfasResponse>
  collection(idOrName: '_otps'): RecordService<OtpsResponse>
  collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
  collection(idOrName: 'appointments'): RecordService<AppointmentsResponse>
  collection(idOrName: 'clinics'): RecordService<ClinicsResponse>
  collection(idOrName: 'organizations'): RecordService<OrganizationsResponse>
  collection(idOrName: 'patient_transfers'): RecordService<PatientTransfersResponse>
  collection(idOrName: 'patients'): RecordService<PatientsResponse>
  collection(idOrName: 'staff_members'): RecordService<StaffMembersResponse>
  collection(idOrName: 'treatment_records'): RecordService<TreatmentRecordsResponse>
  collection(idOrName: 'treatments_catalog'): RecordService<TreatmentsCatalogResponse>
  collection(idOrName: 'users'): RecordService<UsersResponse>
}
