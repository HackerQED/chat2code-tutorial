"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { keymap } from "@codemirror/view";
import { type KeyBinding } from "@codemirror/view";
import { useWebContainer } from "@/components/shared/WebContainerProvider";
import { useEffect, useState } from "react";
import { writeFile } from "@/lib/webcontainer/filesystem";

const TEST_FILE_PATH = "index.js";
const INITIAL_CONTENT = `
// Test file for WebContainer
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!\\n');
});

const port = 3000;
server.listen(port, () => {
    console.log(\`Server is running on http://localhost:\${port}/\`);
});
`.trim();

export function CodeEditor() {
  const { webcontainer, isLoading, error } = useWebContainer();
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize file when WebContainer is ready
  useEffect(() => {
    if (webcontainer) {
      void webcontainer.mount({
        [TEST_FILE_PATH]: {
          file: { contents: INITIAL_CONTENT },
        },
      });
    }
  }, [webcontainer]);

  const handleSave = async () => {
    if (!webcontainer) return;

    setIsSaving(true);
    try {
      await writeFile(webcontainer, TEST_FILE_PATH, content);
    } catch (err) {
      console.error("Failed to save file:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const saveKeymap: KeyBinding[] = [
    {
      key: "Ctrl-s",
      run: () => {
        void handleSave();
        return true;
      },
      preventDefault: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Loading WebContainer...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-destructive">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <CodeMirror
        value={content}
        height="100%"
        width="100%"
        theme={vscodeDark}
        extensions={[javascript(), keymap.of(saveKeymap)]}
        onChange={setContent}
        className="flex-1 overflow-hidden"
      />
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
        {isSaving ? "Saving..." : "Press Ctrl+S to save"}
      </div>
    </div>
  );
}
