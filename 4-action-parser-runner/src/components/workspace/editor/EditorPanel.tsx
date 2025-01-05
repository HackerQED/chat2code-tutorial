"use client";

import { CodeEditor } from "./CodeEditor";
import { Terminal } from "./Terminal";
import { FileTree } from "./FileTree";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useStore } from "@nanostores/react";
import { filesStore } from "@/lib/store/files";

export function EditorPanel() {
  const files = useStore(filesStore);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* File Tree Panel */}
      <ResizablePanel
        defaultSize={20}
        minSize={15}
        maxSize={30}
        className="border-r"
      >
        <FileTree files={files} className="h-full w-full p-2" />
      </ResizablePanel>

      <ResizableHandle />

      {/* Editor and Terminal Panel */}
      <ResizablePanel defaultSize={80}>
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Editor Panel */}
          <ResizablePanel defaultSize={70} className="h-full">
            <div className="h-full">
              <CodeEditor />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Terminal Panel */}
          <ResizablePanel defaultSize={30} minSize={15} className="h-full">
            <div className="h-full">
              <Terminal />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
