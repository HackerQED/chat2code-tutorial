"use client";

import { useEffect, useState } from "react";
import {
  openDatabase,
  getAllWorkspaces,
  setWorkspace,
  getWorkspace,
  getWorkspaceByUrlId,
  deleteWorkspace,
  generateUrlId,
  type WorkspaceState,
} from "@/lib/persistence/db";
import { useParams } from "next/navigation";

export default function WorkspaceTestPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [db, setDb] = useState<IDBDatabase | undefined>();
  const [workspaces, setWorkspaces] = useState<WorkspaceState[]>([]);
  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceState | null>(null);
  const [error, setError] = useState<string>("");

  // Initialize database and load specific workspace
  useEffect(() => {
    async function initAndLoad() {
      try {
        const database = await openDatabase();
        if (!database) {
          throw new Error("Failed to open database");
        }
        setDb(database);

        // Try to load workspace by URL ID
        if (workspaceId) {
          const workspace = await getWorkspaceByUrlId(database, workspaceId);
          if (workspace) {
            setCurrentWorkspace(workspace);
          } else {
            setError(`Workspace "${workspaceId}" not found`);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    }
    void initAndLoad();
  }, [workspaceId]);

  // Load all workspaces
  useEffect(() => {
    async function loadWorkspaces() {
      if (!db) return;
      try {
        const items = await getAllWorkspaces(db);
        setWorkspaces(items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load workspaces",
        );
      }
    }
    void loadWorkspaces();
  }, [db]);

  // Test functions
  const createTestWorkspace = async () => {
    if (!db) return;
    try {
      const urlId = await generateUrlId(db, "test");
      const workspace: WorkspaceState = {
        id: Date.now().toString(),
        urlId,
        files: {
          "/test.txt": "Hello World",
          "/folder": {
            "nested.txt": "Nested file content",
          },
        },
        timestamp: new Date().toISOString(),
      };
      await setWorkspace(db, workspace);
      const items = await getAllWorkspaces(db);
      setWorkspaces(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace",
      );
    }
  };

  const deleteTestWorkspace = async (id: string) => {
    if (!db) return;
    try {
      await deleteWorkspace(db, id);
      const items = await getAllWorkspaces(db);
      setWorkspaces(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete workspace",
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Workspace Test Page</h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Display current workspace if loaded */}
      {currentWorkspace && (
        <div className="mb-6 rounded border-2 border-blue-200 p-4">
          <h2 className="mb-2 text-xl font-semibold">Current Workspace:</h2>
          <div>
            <p>
              <strong>ID:</strong> {currentWorkspace.id}
            </p>
            <p>
              <strong>URL ID:</strong> {currentWorkspace.urlId}
            </p>
            <p>
              <strong>Timestamp:</strong> {currentWorkspace.timestamp}
            </p>
            <pre className="mt-2 rounded bg-gray-100 p-2">
              {JSON.stringify(currentWorkspace.files, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={createTestWorkspace}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Create Test Workspace
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Workspaces:</h2>
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="rounded border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p>
                  <strong>ID:</strong> {workspace.id}
                </p>
                <p>
                  <strong>URL ID:</strong> {workspace.urlId}
                </p>
                <p>
                  <strong>Timestamp:</strong> {workspace.timestamp}
                </p>
                <pre className="mt-2 rounded bg-gray-100 p-2">
                  {JSON.stringify(workspace.files, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => void deleteTestWorkspace(workspace.id)}
                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
