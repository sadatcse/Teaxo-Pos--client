const DB_NAME = 'TeaxoPOSDatabase';
const DB_VERSION = 2;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onblocked = () => {
      console.warn("Database upgrade blocked. Please close other tabs of this application.");
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      const stores = [
        { name: 'categories', keyPath: '_id' },
        { name: 'products', keyPath: '_id' },
        { name: 'addons', keyPath: '_id' },
        { name: 'systemSettings', keyPath: 'branch' },
        { name: 'userPermissions', keyPath: 'role' },
        { name: 'actionPermissions', keyPath: 'role' },
        { name: 'invoices', keyPath: '_id' },
        { name: 'tables', keyPath: '_id' },
        { name: 'customers', keyPath: '_id' }
      ];

      stores.forEach(store => {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(store.name, { keyPath: store.keyPath });
        }
      });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      
      // Close database connection if a version upgrade is requested elsewhere
      db.onversionchange = () => {
        db.close();
        console.warn("Database version changed. Closing connection to allow upgrade.");
        window.location.reload();
      };
      
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const dbGetAll = async (storeName) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const dbGet = async (storeName, key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const dbPut = async (storeName, value) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const dbBulkPut = async (storeName, items) => {
  if (!items || items.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    items.forEach(item => {
      if (item) store.put(item);
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const dbDelete = async (storeName, key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const dbClear = async (storeName) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Offline-to-Online Synchronization Helper
export const syncPendingInvoices = async (axiosSecure, branch) => {
  try {
    // 1. Sync pending customers first
    const customers = await dbGetAll('customers');
    const pendingCustomers = customers.filter(cust => cust.isSyncPending);
    
    if (pendingCustomers.length > 0) {
      console.log(`Syncing ${pendingCustomers.length} pending customers...`);
      for (const customer of pendingCustomers) {
        try {
          const payload = { ...customer };
          delete payload._id; // Let server generate the real _id
          delete payload.isSyncPending;
          
          const response = await axiosSecure.post('/customer/post', payload);
          if (response.data) {
            // Delete local temporary customer and save server-returned customer
            await dbDelete('customers', customer._id);
            await dbPut('customers', { ...response.data, isSyncPending: false });
            console.log(`Customer ${customer.name} synced successfully.`);
          }
        } catch (err) {
          console.error(`Failed to sync customer ${customer.name}:`, err);
        }
      }
    }

    // 2. Sync pending invoices
    const invoices = await dbGetAll('invoices');
    const pending = invoices.filter(inv => inv.isSyncPending);
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} pending invoices...`);
    const channel = new BroadcastChannel('teaxo-pos-offline-sync');

    for (const invoice of pending) {
      try {
        if (invoice.isOfflineCreated || (invoice._id && invoice._id.toString().startsWith('local_'))) {
          // New offline order
          const payload = { ...invoice };
          delete payload._id; // Let server generate _id
          delete payload.isOfflineCreated;
          delete payload.isSyncPending;
          
          const response = await axiosSecure.post('/invoice/post', payload);
          if (response.data) {
            // Delete local offline invoice
            await dbDelete('invoices', invoice._id);
            // Save server response invoice (with isSyncPending: false)
            const serverInvoice = response.data;
            await dbPut('invoices', { ...serverInvoice, isSyncPending: false });
          }
        } else {
          // Update to an existing order (like kitchen display state changes)
          const payload = { ...invoice };
          delete payload.isSyncPending;
          
          await axiosSecure.put(`/invoice/update/${invoice._id}`, payload);
          // Mark sync pending as false
          await dbPut('invoices', { ...invoice, isSyncPending: false });
        }
      } catch (err) {
        console.error(`Failed to sync invoice ${invoice._id}:`, err);
      }
    }

    // Broadcast sync complete
    channel.postMessage({ type: 'INVOICE_UPDATED' });
    channel.close();
  } catch (err) {
    console.error("Error running background sync:", err);
  }
};
