import type { AuthUser } from '../../auth/auth-types'
import type { StaffMembersResponse } from '../../types/pocketbase-types'

let currentUser: AuthUser | null = null
let currentRole: 'receptionist' | 'dentist' | 'manager' | 'admin' | 'user' | null = null
let currentStaff: StaffMembersResponse | null = null
const listeners = new Set<() => void>()

export type AuthSnapshot = {
  user: AuthUser | null
  role: 'receptionist' | 'dentist' | 'manager' | 'admin' | 'user' | null
  staffMember: StaffMembersResponse | null
}

export async function login(email: string, _password: string) {
  currentUser = {
    id: 'local_user',
    email,
    name: 'Demo User',
    verified: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }
  currentRole = 'user'
  currentStaff = null
  listeners.forEach((l) => l())
}

export async function loginAsAdmin(email: string, _password: string) {
  currentUser = {
    id: 'local_admin',
    email,
    name: 'Demo Admin',
    verified: true,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }
  currentRole = 'admin'
  currentStaff = null
  listeners.forEach((l) => l())
}

export async function register(email: string, password: string, name?: string) {
  await login(email, password)
  if (name) currentUser = { ...currentUser!, name }
}

export async function logout() {
  currentUser = null
  currentRole = null
  currentStaff = null
  listeners.forEach((l) => l())
}

export async function refreshAuth() {
  // no-op in local mode
}

export async function ensureStaffLoaded() {
  // no-op in local mode
}

export function getSnapshot(): AuthSnapshot {
  return { user: currentUser, role: currentRole, staffMember: currentStaff }
}

export function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}


