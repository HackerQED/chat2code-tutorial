"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { keymap } from "@codemirror/view";
import { type KeyBinding } from "@codemirror/view";
import { useWebContainer } from "@/components/shared/WebContainerProvider";
import { useEffect, useState } from "react";
import { writeFile } from "@/lib/webcontainer/filesystem";
import { useStore } from "@nanostores/react";
import { filesStore, selectedFileAtom } from "@/lib/store/files";

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
  const { webcontainer } = useWebContainer();
  const selectedFile = useStore(selectedFileAtom);
  const files = useStore(filesStore);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // mount initial file
  useEffect(() => {
    if (webcontainer) {
      void webcontainer.mount({
        [TEST_FILE_PATH]: {
          file: { contents: INITIAL_CONTENT },
        },
      });
    }
  }, [webcontainer]);

  // Update editor content when selected file changes
  useEffect(() => {
    if (selectedFile && files[selectedFile]) {
      setContent(files[selectedFile].content ?? "");
    } else {
      setContent(""); // Clear content if no file selected
    }
  }, [selectedFile, files]);

  const handleSave = async () => {
    if (!webcontainer || !selectedFile) return;
    console.debug("[CodeEditor] Saving file:", selectedFile);

    setIsSaving(true);
    try {
      const relativePath = selectedFile.replace(webcontainer.workdir + "/", "");
      await writeFile(webcontainer, relativePath, content);
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

  return (
    <div className="relative h-full">
      <div
        className="absolute inset-0 overflow-auto"
        style={{ backgroundColor: "#1e1e1e" }}
      >
        {selectedFile ? (
          <CodeMirror
            value={content}
            height="100%"
            width="100%"
            theme={vscodeDark}
            extensions={[javascript(), keymap.of(saveKeymap)]}
            onChange={setContent}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to edit
          </div>
        )}
      </div>
      {selectedFile && (
        <div className="pointer-events-none absolute bottom-2 right-6 text-xs text-muted-foreground">
          {isSaving ? "Saving..." : "Press Ctrl+S to save"}
        </div>
      )}
    </div>
  );
}
