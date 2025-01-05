import { type FileMap } from "../store/files";

export interface WorkspaceState {
  id: string;
  urlId: string;
  files: FileMap;
  timestamp: string;
}

const logger = {
  debug: (...args: unknown[]) => console.debug("[WorkspaceDB]", ...args),
  error: (...args: unknown[]) => console.error("[WorkspaceDB]", ...args),
  info: (...args: unknown[]) => console.info("[WorkspaceDB]", ...args),
};

class DBError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "DBError";
  }
}

// Open database connection
export async function openDatabase(): Promise<IDBDatabase | undefined> {
  try {
    logger.debug("Opening database...");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("workspaceHistory", 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        logger.info("Upgrading database schema...");

        if (!db.objectStoreNames.contains("workspaces")) {
          const store = db.createObjectStore("workspaces", { keyPath: "id" });
          store.createIndex("id", "id", { unique: true });
          store.createIndex("urlId", "urlId", { unique: true });
          logger.info("Created workspaces store with indexes");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new DBError("Failed to open database", request.error));
    });

    logger.debug("Database opened successfully");
    return db;
  } catch (err) {
    logger.error("Database initialization failed:", err);
    return undefined;
  }
}

// Basic CRUD operations
export async function getAllWorkspaces(
  db: IDBDatabase,
): Promise<WorkspaceState[]> {
  const transaction = db.transaction("workspaces", "readonly");
  const store = transaction.objectStore("workspaces");

  try {
    return await new Promise<WorkspaceState[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new DBError("Failed to get workspaces", request.error));
    });
  } catch (err) {
    throw new DBError("Failed to get workspaces", err);
  }
}

export async function getWorkspaceByUrlId(
  db: IDBDatabase,
  urlId: string,
): Promise<WorkspaceState | undefined> {
  logger.debug("Getting workspace by URL ID:", urlId);
  const transaction = db.transaction("workspaces", "readonly");
  const store = transaction.objectStore("workspaces");
  const index = store.index("urlId");

  try {
    const result = await new Promise<WorkspaceState | undefined>(
      (resolve, reject) => {
        const request = index.get(urlId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(
            new DBError("Failed to get workspace by URL ID", request.error),
          );
      },
    );

    logger.debug("Workspace lookup result:", result);
    return result;
  } catch (err) {
    throw new DBError(`Failed to get workspace with URL ID: ${urlId}`, err);
  }
}

export async function setWorkspace(
  db: IDBDatabase,
  workspace: WorkspaceState,
): Promise<void> {
  const transaction = db.transaction("workspaces", "readwrite");
  const store = transaction.objectStore("workspaces");

  try {
    await new Promise<void>((resolve, reject) => {
      const request = store.put(workspace);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new DBError("Failed to save workspace", request.error));
    });
  } catch (err) {
    throw new DBError("Failed to save workspace", err);
  }
}

export async function deleteWorkspace(
  db: IDBDatabase,
  id: string,
): Promise<void> {
  const transaction = db.transaction("workspaces", "readwrite");
  const store = transaction.objectStore("workspaces");

  try {
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new DBError("Failed to delete workspace", request.error));
    });
  } catch (err) {
    throw new DBError(`Failed to delete workspace with ID: ${id}`, err);
  }
}

export async function generateUrlId(
  db: IDBDatabase,
  baseId: string,
): Promise<string> {
  const existingIds = await getExistingUrlIds(db);

  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  let counter = 2;
  while (existingIds.includes(`${baseId}-${counter}`)) {
    counter++;
  }
  return `${baseId}-${counter}`;
}

async function getExistingUrlIds(db: IDBDatabase): Promise<string[]> {
  const transaction = db.transaction("workspaces", "readonly");
  const store = transaction.objectStore("workspaces");

  try {
    return await new Promise<string[]>((resolve, reject) => {
      const urlIds: string[] = [];
      const request = store.openCursor();

      request.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          urlIds.push(cursor.value.urlId);
          cursor.continue();
        } else {
          resolve(urlIds);
        }
      };

      request.onerror = () =>
        reject(new DBError("Failed to get URL IDs", request.error));
    });
  } catch (err) {
    throw new DBError("Failed to get URL IDs", err);
  }
}
