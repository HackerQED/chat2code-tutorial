"use client";

import { type WebContainer } from "@webcontainer/api";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getWebContainerInstance } from "@/lib/webcontainer/core";
import { watchFileSystem } from "@/lib/store/files";

interface WebContainerContextType {
  webcontainer: WebContainer | null;
  isLoading: boolean;
  error: Error | null;
}

const WebContainerContext = createContext<WebContainerContextType>({
  webcontainer: null,
  isLoading: true,
  error: null,
});

export function WebContainerProvider({ children }: { children: ReactNode }) {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initWebContainer() {
      try {
        console.debug("[WebContainerProvider] Initializing WebContainer...");
        const instance = await getWebContainerInstance();
        console.debug("[WebContainerProvider] WebContainer instance created");

        console.debug(
          "[WebContainerProvider] Initializing file system watcher...",
        );
        watchFileSystem(instance);

        setWebcontainer(instance);
      } catch (err) {
        console.error("[WebContainerProvider] Initialization error:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to initialize WebContainer"),
        );
      } finally {
        setIsLoading(false);
      }
    }

    void initWebContainer();
  }, []);

  return (
    <WebContainerContext.Provider value={{ webcontainer, isLoading, error }}>
      {children}
    </WebContainerContext.Provider>
  );
}

export function useWebContainer() {
  const context = useContext(WebContainerContext);
  if (!context) {
    throw new Error("useWebContainer must be used within WebContainerProvider");
  }
  return context;
}
