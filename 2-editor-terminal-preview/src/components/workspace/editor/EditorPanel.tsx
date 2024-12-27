"use client";

import { CodeEditor } from "./CodeEditor";
import { Terminal } from "./Terminal";

export function EditorPanel() {
  return (
    <div className="flex h-full flex-col">
      <CodeEditor />
      <Terminal />
    </div>
  );
}
