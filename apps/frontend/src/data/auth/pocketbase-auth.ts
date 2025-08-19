import { pb } from '../../lib/pocketbase'
import type { AuthUser } from '../../auth/auth-types'

export type AuthSnapshot = {
  user: AuthUser | null
  role: 'receptionist' | 'dentist' | 'manager' | 'admin' | 'user' | null
}

export async function login(email: string, password: string) {
  await pb.collection('users').authWithPassword(email, password)
}

export async function loginAsAdmin(email: string, password: string) {
  await pb.collection('_superusers').authWithPassword(email, password)
}

export async function register(email: string, password: string, name?: string) {
  await pb.collection('users').create({ email, password, passwordConfirm: password, name })
  await pb.collection('users').authWithPassword(email, password)
}

export async function logout() {
  pb.authStore.clear()
}

export async function refreshAuth() {
  if (pb.authStore.isValid && pb.authStore.token) {
    await pb.collection('users').authRefresh()
  }
}

export function getSnapshot(): AuthSnapshot {
  const isValid = pb.authStore.isValid
  const record = pb.authStore.record
  if (!isValid || !record) return { user: null, role: null }
  const user: AuthUser = {
    id: record.id,
    email: record.email,
    name: record.name,
    avatar: record.avatar,
    verified: !!record.verified,
    created: record.created,
    updated: record.updated,
  }
  const role = pb.authStore.token && record.collectionName === '_superusers' ? 'admin' : 'user'
  return { user, role }
}

export function subscribe(cb: () => void) {
  return pb.authStore.onChange(() => cb())
}


