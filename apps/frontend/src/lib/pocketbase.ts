import PocketBase from 'pocketbase';
import { createContext, useContext } from 'solid-js';
import type { TypedPocketBase } from '../types/pocketbase-types';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

export const PocketBaseContext = createContext<TypedPocketBase>();
export const usePocketBase = () => {
  const ctx = useContext(PocketBaseContext);
  if (!ctx) throw new Error("usePocketBase must be used within a PocketBaseProvider");
  return ctx;
};
