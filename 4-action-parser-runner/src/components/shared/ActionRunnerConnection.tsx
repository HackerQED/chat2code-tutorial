"use client";

import { ActionRunnerProvider } from "@/lib/ai/client/context/ActionRunnerContext";
import { type ReactNode } from "react";
import { useWebContainer } from "./WebContainerProvider";

export function ActionRunnerConnection({ children }: { children: ReactNode }) {
  const { webcontainer, isLoading } = useWebContainer();

  if (isLoading) {
    return <div>Loading WebContainer...</div>;
  }

  return (
    <ActionRunnerProvider webcontainer={webcontainer}>
      {children}
    </ActionRunnerProvider>
  );
}
