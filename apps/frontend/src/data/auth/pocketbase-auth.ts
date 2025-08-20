import { pb } from '../../lib/pocketbase'
import type { AuthUser } from '../../auth/auth-types'
import { Collections, type StaffMembersResponse, StaffMembersRoleOptions, type TypedPocketBase } from '../../types/pocketbase-types'

export type AuthSnapshot = {
  user: AuthUser | null
  role: 'receptionist' | 'dentist' | 'manager' | 'admin' | 'user' | null
  staffMember: StaffMembersResponse | null
}

let currentStaffMember: StaffMembersResponse | null = null

async function loadCurrentStaffMember(): Promise<void> {
  const record = pb.authStore.record
  if (!record || record.collectionName !== Collections.Users) {
    currentStaffMember = null
    return
  }
  try {
    const typedPb = pb as unknown as TypedPocketBase
    const staff = await typedPb
      .collection('staff_members')
      .getFirstListItem(`user="${record.id}"`)
    currentStaffMember = staff
  } catch (err) {
    // Not found or error – treat as no staff membership
    currentStaffMember = null
  }
}

function mapStaffRoleToUiRole(role: StaffMembersRoleOptions): 'receptionist' | 'dentist' | 'manager' | 'admin' {
  switch (role) {
    case StaffMembersRoleOptions.receptionist:
      return 'receptionist'
    case StaffMembersRoleOptions.dentist:
      return 'dentist'
    case StaffMembersRoleOptions.clinic_manager:
      return 'manager'
    case StaffMembersRoleOptions.org_admin:
      return 'admin'
  }
}

export async function login(email: string, password: string) {
  await pb.collection('users').authWithPassword(email, password)
  await loadCurrentStaffMember()
}

export async function loginAsAdmin(email: string, password: string) {
  await pb.collection('_superusers').authWithPassword(email, password)
  currentStaffMember = null
}

export async function register(email: string, password: string, name?: string) {
  await pb.collection('users').create({ email, password, passwordConfirm: password, name })
  await pb.collection('users').authWithPassword(email, password)
  await loadCurrentStaffMember()
}

export async function logout() {
  pb.authStore.clear()
  currentStaffMember = null
}

export async function refreshAuth() {
  if (pb.authStore.isValid && pb.authStore.token) {
    await pb.collection('users').authRefresh()
    await loadCurrentStaffMember()
  }
}

export async function ensureStaffLoaded() {
  const record = pb.authStore.record
  if (!record || record.collectionName !== Collections.Users) return
  if (!currentStaffMember) {
    await loadCurrentStaffMember()
  }
}

export function getSnapshot(): AuthSnapshot {
  const isValid = pb.authStore.isValid
  const record = pb.authStore.record
  if (!isValid || !record) return { user: null, role: null, staffMember: null }
  const user: AuthUser = {
    id: record.id,
    email: record.email,
    name: record.name,
    avatar: record.avatar,
    verified: !!record.verified,
    created: record.created,
    updated: record.updated,
  }

  // if user is admin, return with role admin
  if (record.collectionName === Collections.Superusers) return { user, role: 'admin', staffMember: null }

  // Derive role from cached staff member if available
  console.log(currentStaffMember)
  const role = currentStaffMember ? mapStaffRoleToUiRole(currentStaffMember.role) : 'user'
  return { user, role, staffMember: currentStaffMember }
}

export function subscribe(cb: () => void) {
  return pb.authStore.onChange(async () => {
    await loadCurrentStaffMember()
    cb()
  })
}


