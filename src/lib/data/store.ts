// Browser-storage persistence layer. Swap this module for real API calls later.
import { useSyncExternalStore } from "react";
import { createSeed } from "./seed";
import type { DB } from "./types";

const KEY = "learnwise-db-v1";
let state: DB | null = null;
let serverSnapshot: DB | null = null;
const listeners = new Set<() => void>();

function getServerSnapshot(): DB {
  if (!serverSnapshot) serverSnapshot = createSeed();
  return serverSnapshot;
}

function load(): DB {
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as DB) : createSeed();
  } catch {
    state = createSeed();
  }
  return state;
}

export function getDB(): DB {
  return typeof window === "undefined" ? getServerSnapshot() : load();
}

export function updateDB(updater: (db: DB) => DB) {
  state = updater(load());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable */
  }
  listeners.forEach((l) => l());
}

export function resetDB() {
  const session = load().session;
  updateDB(() => ({ ...createSeed(), session }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns the whole DB snapshot; derive views with useMemo in components. */
export function useDB(): DB {
  return useSyncExternalStore(subscribe, getDB, getServerSnapshot);
}

let counter = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;
