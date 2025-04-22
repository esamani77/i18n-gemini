export interface ApiKeyEntry {
  id: string
  title: string
  value: string
  createdAt: number
}

const STORAGE_KEY = "gemini-api-keys"

export const apiKeyStorage = {
  getAll: (): ApiKeyEntry[] => {
    try {
      const keys = localStorage.getItem(STORAGE_KEY)
      return keys ? JSON.parse(keys) : []
    } catch (error) {
      console.error("Failed to get API keys from storage:", error)
      return []
    }
  },

  add: (title: string, value: string): ApiKeyEntry => {
    try {
      const keys = apiKeyStorage.getAll()
      const newKey: ApiKeyEntry = {
        id: crypto.randomUUID(),
        title,
        value,
        createdAt: Date.now(),
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys, newKey]))
      return newKey
    } catch (error) {
      console.error("Failed to add API key to storage:", error)
      throw error
    }
  },

  remove: (id: string): void => {
    try {
      const keys = apiKeyStorage.getAll()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys.filter((key) => key.id !== id)))
    } catch (error) {
      console.error("Failed to remove API key from storage:", error)
      throw error
    }
  },

  update: (id: string, updates: Partial<Omit<ApiKeyEntry, "id" | "createdAt">>): ApiKeyEntry | null => {
    try {
      const keys = apiKeyStorage.getAll()
      const keyIndex = keys.findIndex((key) => key.id === id)

      if (keyIndex === -1) return null

      const updatedKey = { ...keys[keyIndex], ...updates }
      keys[keyIndex] = updatedKey

      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
      return updatedKey
    } catch (error) {
      console.error("Failed to update API key in storage:", error)
      throw error
    }
  },
}
