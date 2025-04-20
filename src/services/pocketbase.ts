// src/services/pocketbase.js
import PocketBase, { RecordModel } from 'pocketbase';
import type { SavedChartState } from '../components/DentalChart/types/dental.types';
import { ErrorPayload } from 'vite';

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

// --- Dental Chart State Persistence ---

/**
 * Fetches the latest dental chart state for a given patient.
 * @param patientId The ID of the patient.
 * @returns The SavedChartState object or null if not found.
 */
export async function getDentalChartState(patientId: string): Promise<SavedChartState | null> {
  if (!patientId) {
    console.error("getDentalChartState: patientId is required.");
    return null;
  }
  const pb = getPocketBase();
  try {
    const record = await pb.collection('dental_charts').getFirstListItem(`patient="${patientId}"`, {
      // sort: '-last_saved', // Optionally sort if needed, though filter should suffice
    });
    // Field name chart_data is correct
    return record.chart_data as SavedChartState;
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`No existing dental chart state found for patient ${patientId}.`);
      return null;
    } else {
      console.error(`Error fetching dental chart state for patient ${patientId}:`, error);
      throw error;
    }
  }
}

/**
 * Saves the dental chart state for a given patient.
 * Creates a new record if one doesn't exist, otherwise updates the existing one.
 * @param patientId The ID of the patient.
 * @param chartData The SavedChartState object to save.
 */
export async function saveDentalChartState(patientId: string, chartData: SavedChartState): Promise<void> {
  if (!patientId || !chartData) {
    console.error("saveDentalChartState: patientId and chartData are required.");
    return;
  }

  const pb = getPocketBase();
  const dataToSave = {
    patient: patientId,        // Field name is correct
    chart_data: chartData,   // Field name is correct
    last_saved: new Date().toISOString(), // Field name is correct
  };

  try {

    // Use the correct collection name from the schema
    // NOTE: this works fine ignore error
    const existingRecord: RecordModel = await pb.collection('dental_charts').getFirstListItem(`patient="${patientId}"`)
      .catch((error) => {
        if (error.status === 404) return null;
        throw error;
      })

    // .catch(error => {
    //   if (error.status === 404) return null;
    //   throw error;
    // });

    if (existingRecord) {
      // Update existing record
      await pb.collection('dental_charts').update(existingRecord.id, dataToSave);
      console.log(`Updated dental chart state for patient ${patientId}`);
    } else {
      // Create new record
      await pb.collection('dental_charts').create(dataToSave);
      console.log(`Created new dental chart state for patient ${patientId}`);
    }
  } catch (error) {
    console.error(`Error saving dental chart state for patient ${patientId}:`, error);
    throw error;
  }
}

// import PocketBase from 'pocketbase';
// import { load } from '@tauri-apps/plugin-store';
//
// // Create a store instance for persistent storage
// const store = await load('pocketbase-config.json');
//
// // Singleton instance
// let pbInstance: PocketBase = null;
//
// export function createPocketBaseClient(url: string): PocketBase {
//   pbInstance = new PocketBase(url);
//   return pbInstance;
// }
//
// export async function getPocketBase(): Promise<PocketBase> {
//   if (!pbInstance) {
//     const url: string = await store.get('pocketbaseUrl');
//     if (!url) {
//       throw new Error('PocketBase URL not found. Please connect first.');
//     }
//     pbInstance = new PocketBase(url);
//
//     // Restore auth if available
//     const authData: string = await store.get('authStore');
//     if (authData) {
//       try {
//         pbInstance.authStore.loadFromCookie(authData);
//       } catch (error) {
//         console.error("Failed to restore auth:", error);
//       }
//     }
//   }
//   return pbInstance;
// }
//
// // Authentication helpers
// export async function isAuthenticated(): Promise<boolean> {
//   const pb = await getPocketBase();
//   return pb.authStore.isValid;
// }
//
// export async function loginAdmin(email: string, password: string) {
//   const pb = await getPocketBase();
//   return await pb.collection('_superusers').authWithPassword(email, password);
// }
//
// export async function logout() {
//   const pb = await getPocketBase();
//   pb.authStore.clear();
//   await store.delete('pocketbaseUrl');
//   await store.delete('authStore');
//   await store.save();
//   pbInstance = null;
// }
//
// // Check if connection settings exist
// export async function hasConnectionSettings(): Promise<boolean> {
//   return !!(await store.get('pocketbaseUrl'));
// }
//
// // Store token to persist auth
// export async function persistConnection(url: string) {
//   const pb = await getPocketBase();
//   await store.set('pocketbaseUrl', url);
//   await store.set('authStore', pb.authStore.exportToCookie());
//   await store.save();
// }
//
// // Restore auth from stored token
// export async function restoreConnection(): Promise<boolean> {
//   const url: string = await store.get('pocketbaseUrl');
//   const authData: string = await store.get('authStore');
//
//   if (url && authData) {
//     try {
//       const pb = createPocketBaseClient(url);
//       pb.authStore.loadFromCookie(authData);
//       return pb.authStore.isValid;
//     } catch (error) {
//       console.error("Failed to restore connection:", error);
//       return false;
//     }
//   }
//   return false;
// }
