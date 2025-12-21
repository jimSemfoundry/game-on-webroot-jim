export default class IndexDB {
  private readonly IDB: Promise<IDBOpenDBRequest>
  private static dbName = 'service'
  private static version = 1
  private static instance: IndexDB
  private static tableName = 'service_host'

  private constructor() {
    const { promise, resolve, reject } = Promise.withResolvers<IDBOpenDBRequest>()
    try {
      const connect = window.indexedDB.open(IndexDB.dbName, IndexDB.version)
      connect.onerror = function (_e) {
        reject(_e)
      }
      connect.onblocked = function (_e) {
        reject(_e)
      }
      connect.onupgradeneeded = function (_e) {
        connect.result.createObjectStore(IndexDB.tableName)
      }
      connect.onsuccess = function (_e) {
        resolve(connect)
      }
    } catch (e) {
      reject(e)
    } finally {
      this.IDB = promise
    }
  }

  static getInstance() {
    if (!IndexDB.instance) {
      IndexDB.instance = new IndexDB()
    }
    return IndexDB.instance
  }

  async transaction(mode: IDBTransactionMode) {
    const IDB = await this.IDB
    const objectStore = IDB.result.transaction([IndexDB.tableName], mode)
    return objectStore.objectStore(IndexDB.tableName)
  }

  async add(key: IDBValidKey, val: any) {
    const { promise, resolve, reject } = Promise.withResolvers()
    const transaction = await this.transaction('readwrite')
    const request = transaction.put(val, key)
    request.onerror = function (_e) {
      reject(_e)
    }
    request.onsuccess = function (_e) {
        resolve(_e)
    }
    return promise
  }
}

try {
  const instance = IndexDB.getInstance()
  void instance.add('value', import.meta.env.VITE_API_URL)
} catch (e) {
  console.info(e)
}
