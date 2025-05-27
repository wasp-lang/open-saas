/**
 * Resilient browser storage wrapper used across the app.
 * Provides async API and basic error handling around localStorage.
 * TODO: extend with fallback strategies (e.g. cookies, IndexedDB).
 */
export class StorageAdapter {
  async get(key: string): Promise<any | null> {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('StorageAdapter.get failed', err);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (err) {
      console.error('StorageAdapter.set failed', err);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error('StorageAdapter.remove failed', err);
    }
  }
}

export const storage = new StorageAdapter();
