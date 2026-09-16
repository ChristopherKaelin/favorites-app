import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const STORAGE_PREF_KEY = 'sb-storage-pref'

// Call this before signing in to control where the session gets persisted:
// true = localStorage (survives browser close, e.g. Christopher's own login)
// false = sessionStorage (clears when the tab/window closes, e.g. the demo account)
export function setAuthPersistence(persistent: boolean) {
  window.localStorage.setItem(STORAGE_PREF_KEY, persistent ? 'local' : 'session')
}

function activeStorage(): Storage {
  // Defaults to sessionStorage (the safer option) if no preference has been set yet.
  const pref = window.localStorage.getItem(STORAGE_PREF_KEY)
  return pref === 'local' ? window.localStorage : window.sessionStorage
}

const dynamicStorage = {
  getItem: (key: string) => activeStorage().getItem(key),
  setItem: (key: string, value: string) => activeStorage().setItem(key, value),
  removeItem: (key: string) => {
    // Clear from both so a stale copy never lingers in the other storage.
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: dynamicStorage,
  },
})
