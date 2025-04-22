// API Key Storage Utility
// This utility manages API keys in localStorage

export interface ApiKeyEntry {
  id: string
  title: string
  value: string
  createdAt: number
}

const STORAGE_KEY = "gemini-api-keys"

export const apiKeyStorage = {
  /**
   * Get all stored API keys
   */
  getAll(): ApiKeyEntry[] {
    try {
      const keys = localStorage.getItem(STORAGE_KEY)
      return keys ? JSON.parse(keys) : []
    } catch (error) {
      console.error("Failed to load API keys from storage", error)
      return []
    }
  },

  /**
   * Get a specific API key by ID
   */
  get(id: string): ApiKeyEntry | undefined {
    return this.getAll().find((key) => key.id === id)
  },

  /**
   * Add a new API key
   */
  add(title: string, value: string): ApiKeyEntry {
    const keys = this.getAll()

    // Check if key with same value already exists
    const existingKey = keys.find((key) => key.value === value)
    if (existingKey) {
      return existingKey
    }

    const newKey: ApiKeyEntry = {
      id: generateId(),
      title,
      value,
      createdAt: Date.now(),
    }

    const updatedKeys = [...keys, newKey]
    this.saveKeys(updatedKeys)

    return newKey
  },

  /**
   * Update an existing API key
   */
  update(id: string, updates: Partial<Omit<ApiKeyEntry, "id" | "createdAt">>): ApiKeyEntry | null {
    const keys = this.getAll()
    const keyIndex = keys.findIndex((key) => key.id === id)

    if (keyIndex === -1) {
      return null
    }

    const updatedKey = {
      ...keys[keyIndex],
      ...updates,
    }

    keys[keyIndex] = updatedKey
    this.saveKeys(keys)

    return updatedKey
  },

  /**
   * Remove an API key
   */
  remove(id: string): boolean {
    const keys = this.getAll()
    const filteredKeys = keys.filter((key) => key.id !== id)

    if (filteredKeys.length === keys.length) {
      return false // No key was removed
    }

    this.saveKeys(filteredKeys)
    return true
  },

  /**
   * Save keys to localStorage
   */
  saveKeys(keys: ApiKeyEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    } catch (error) {
      console.error("Failed to save API keys to storage", error)
    }
  },
}

/**
 * Generate a random ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
