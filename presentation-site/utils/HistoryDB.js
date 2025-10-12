// IndexedDB helper functions for storing strings with dates

class HistoryDB {
  constructor(dbName = 'History', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains('stringEntries')) {
          const store = db.createObjectStore('stringEntries', { 
            keyPath: 'id', 
            autoIncrement: false
          });
          
          // Create indexes for efficient querying
          store.createIndex('timestampIndex', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Add a string with current date
  async addString(prompt_id, text) {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    const entry = {
      text,
      id: prompt_id,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stringEntries'], 'readwrite');
      const store = transaction.objectStore('stringEntries');
      const request = store.add(entry);

      request.onsuccess = () => {
        return resolve({ id: request.result, ...entry });
      };

      request.onerror = (event) => {
        console.error('Failed to add string', event, entry);
        return reject(new Error('Failed to add string to database. '+event.target?.error));
      };
    });
  }

  // Get all entries
  async getAllEntries() {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stringEntries'], 'readonly');
      const store = transaction.objectStore('stringEntries');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result.sort(
          (a, b) => b.timestamp - a.timestamp
        ));
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve entries'));
      };
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stringEntries'], 'readwrite');
      const store = transaction.objectStore('stringEntries');
      const request = store.clear();
      request.addEventListener('success',() => resolve());
      request.addEventListener('error',() => {
        reject(new Error('Failed to clear entries'));
      });
    });
  }

  // Get entry by ID
  async getEntryById(id) {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stringEntries'], 'readonly');
      const store = transaction.objectStore('stringEntries');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve entry'));
      };
    });
  }

  // Delete entry by ID
  async deleteEntry(id) {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stringEntries'], 'readwrite');
      const store = transaction.objectStore('stringEntries');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete entry'));
      };
    });
  }

  static getDB() {
    return historyDB;
  }
}

export default HistoryDB;

const historyDB = new HistoryDB();
if (typeof window !== 'undefined') {
  await historyDB.init();
}
