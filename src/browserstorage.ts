/**
 * In-memory version of window.localStorage
 */
const BrowserStorage: Partial<Storage> = {
  _storage: {},

  setItem: function (key: string, value: any) {
    this._storage[key] = value;
  },

  getItem: function (key) {
    return this._storage[key] || null;
  },

  removeItem: function (key) {
    delete this._storage[key];
  },
};

/**
 * Determines which storage to use:
 * window.localStorage, or BrowserStorage
 *
 * @returns {localStorage|Object|Storage}
 */
function determineStorage(): Storage {
  try {
    // Get current timestamp
    const now = Date.now();
    // Put current timestamp in storage and verify if storage is available
    window.localStorage.setItem("_storage", now as any);
    const fromStorage = window.localStorage.getItem("_storage");
    window.localStorage.removeItem("_storage");

    // If timestamp from storage doesn't match, use our mocked storage
    if (now !== parseInt(String(fromStorage))) {
      return BrowserStorage as Storage;
    } else {
      return window.localStorage;
    }
  } catch (err) {
    // In case something fails, use our mocked storage.
    return BrowserStorage as Storage;
  }
}

export default determineStorage();
