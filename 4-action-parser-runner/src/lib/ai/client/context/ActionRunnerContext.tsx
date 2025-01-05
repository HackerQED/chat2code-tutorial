import { type WebContainer } from "@webcontainer/api";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ActionRunner } from "../runtime/action-runner";

const ActionRunnerContext = createContext<ActionRunner | null>(null);

export function ActionRunnerProvider({
  webcontainer,
  children,
}: {
  webcontainer: WebContainer | null;
  children: ReactNode;
}) {
  const actionRunner = useMemo(() => {
    if (!webcontainer) return null;
    return new ActionRunner(Promise.resolve(webcontainer));
  }, [webcontainer]);

  return (
    <ActionRunnerContext.Provider value={actionRunner}>
      {children}
    </ActionRunnerContext.Provider>
  );
}

export function useActionRunner() {
  const context = useContext(ActionRunnerContext);
  if (!context) {
    throw new Error("useActionRunner must be used within ActionRunnerProvider");
  }
  return context;
}
