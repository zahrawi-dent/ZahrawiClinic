// src/services/pocketbase.js
import PocketBase from 'pocketbase';

// Singleton instance
let pbInstance: PocketBase = null;

export function createPocketBaseClient(url: string): PocketBase {
  pbInstance = new PocketBase(url);
  return pbInstance;
}

export function getPocketBase() {
  if (!pbInstance) {
    const url = localStorage.getItem('pocketbaseUrl');
    if (!url) {
      throw new Error('PocketBase URL not found. Please connect first.');
    }
    pbInstance = new PocketBase(url);
  }
  return pbInstance;
}

// Authentication helpers
export function isAuthenticated() {
  const pb = getPocketBase();
  return pb.authStore.isValid;
}


export async function loginAdmin(email: string, password: string) {
  const pb = getPocketBase();
  return await pb.collection('_superusers').authWithPassword(email, password)
}

export function logout() {
  const pb = getPocketBase();
  pb.authStore.clear();
  localStorage.removeItem('pocketbaseUrl');
}

// Check if connection settings exist
export function hasConnectionSettings() {
  return !!localStorage.getItem('pocketbaseUrl');
}

// Store token to persist auth
export function persistConnection(url: string) {
  const pb = getPocketBase();
  localStorage.setItem('pocketbaseUrl', url);
  localStorage.setItem('authStore', JSON.stringify(pb.authStore.exportToCookie()));
}

// Restore auth from stored token
export function restoreConnection() {
  const url = localStorage.getItem('pocketbaseUrl');
  const authData = localStorage.getItem('authStore');

  if (url && authData) {
    try {
      const pb = createPocketBaseClient(url);
      pb.authStore.loadFromCookie(JSON.parse(authData) as string);
      return pb.authStore.isValid;
    } catch (error) {
      console.error("Failed to restore connection:", error);
      return false;
    }
  }
  return false;
}
