import type { AuthUser } from '../../auth/auth-types'

let currentUser: AuthUser | null = null
let currentRole: 'receptionist' | 'dentist' | 'manager' | 'admin' | 'user' | null = null
const listeners = new Set<() => void>()

export type AuthSnapshot = {
  user: AuthUser | null
  role: 'receptionist' | 'dentist' | 'manager' | 'admin' | 'user' | null
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
  listeners.forEach((l) => l())
}

export async function register(email: string, password: string, name?: string) {
  await login(email, password)
  if (name) currentUser = { ...currentUser!, name }
}

export async function logout() {
  currentUser = null
  currentRole = null
  listeners.forEach((l) => l())
}

export async function refreshAuth() {
  // no-op in local mode
}

export function getSnapshot(): AuthSnapshot {
  return { user: currentUser, role: currentRole }
}

export function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}


