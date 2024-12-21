"use client";

import { createTerminal } from "@/lib/webcontainer/terminal";
import { type WebContainer } from "@webcontainer/api";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createFileTree,
  getWebContainerInstance,
} from "@/lib/webcontainer/core";
import {
  createDirectory,
  listFiles,
  modifyFile,
  removeDirectory,
  writeFile,
} from "@/lib/webcontainer/filesystem";

export default function PlaygroundPage() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon>();
  const shellProcess = useRef<Awaited<
    ReturnType<typeof createTerminal>
  > | null>(null);

  // Initialize terminal with addons
  useEffect(() => {
    if (terminalRef.current && !terminalInstance.current) {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "Menlo, courier-new, courier, monospace",
        theme: {
          background: "#1a1a1a",
        },
      });

      // Add fit addon
      const fit = new FitAddon();
      fitAddon.current = fit;
      term.loadAddon(fit);

      // Add web links addon
      term.loadAddon(new WebLinksAddon());

      term.open(terminalRef.current);
      fit.fit();

      terminalInstance.current = term;

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        fit.fit();
        shellProcess.current?.resize(term.cols, term.rows);
      });

      resizeObserver.observe(terminalRef.current);

      return () => {
        resizeObserver.disconnect();
        terminalInstance.current?.dispose();
      };
    }
  }, []);

  const initWebContainer = useCallback(async () => {
    try {
      setStatus("Booting WebContainer...");
      const instance = await getWebContainerInstance();
      setWebcontainer(instance);
      setStatus("WebContainer ready!");

      // Initialize terminal with jsh
      if (terminalInstance.current) {
        const terminal = await createTerminal(
          instance,
          terminalInstance.current,
          {
            cols: terminalInstance.current.cols,
            rows: terminalInstance.current.rows,
          },
        );
        shellProcess.current = terminal;
        setStatus((prev) => `${prev}\nTerminal connected to jsh`);
      }

      // Test file system
      const files = createFileTree({
        "package.json": JSON.stringify({
          name: "example",
          type: "module",
          dependencies: {},
        }),
        "index.js": "console.log('Hello from WebContainer!')",
      });

      await instance.mount(files);
      setStatus((prev) => `${prev}\nFiles mounted successfully!`);

      // Test directory operations
      setStatus((prev) => `${prev}\n\nTesting directory operations...`);

      // Create directories
      await createDirectory(instance, "src/utils");
      setStatus((prev) => `${prev}\nCreated src/utils directory`);

      // Create a file in the new directory
      await writeFile(
        instance,
        "src/utils/helper.js",
        "export const add = (a, b) => a + b;",
      );
      setStatus((prev) => `${prev}\nCreated helper.js in src/utils`);

      // List directory contents
      const srcEntries = await listFiles(instance, "src");
      setStatus(
        (prev) =>
          `${prev}\nFiles in src: ${srcEntries.map((e) => e.name).join(", ")}`,
      );

      // Test file modification
      setStatus((prev) => `${prev}\n\nTesting file modification...`);

      // Modify helper.js
      const modified = await modifyFile(
        instance,
        "src/utils/helper.js",
        (content) => {
          return content + "\nexport const subtract = (a, b) => a - b;";
        },
      );
      setStatus((prev) => `${prev}\nModified helper.js:\n${modified}`);

      // Clean up
      await removeDirectory(instance, "src");
      setStatus((prev) => `${prev}\nRemoved src directory and its contents`);

      // Final file list
      const finalEntries = await listFiles(instance, "/");
      setStatus(
        (prev) =>
          `${prev}\nFinal files: ${finalEntries.map((e) => e.name).join(", ")}`,
      );

      // Test command execution
      setStatus((prev) => `${prev}\n\nTesting command execution...`);
      const process = await instance.spawn("node", ["index.js"]);

      void process.output.pipeTo(
        new WritableStream({
          write(data) {
            setStatus((prev) => `${prev}\nOutput: ${data}`);
          },
        }),
      );

      const exitCode = await process.exit;
      setStatus((prev) => `${prev}\nProcess exited with code ${exitCode}`);
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`,
      );
    }
  }, []);

  useEffect(() => {
    void initWebContainer();
  }, [initWebContainer]);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">WebContainer Playground</h1>
      <div className="space-y-4">
        <div className="rounded border bg-gray-50 p-4">
          <pre className="whitespace-pre-wrap">{status}</pre>
        </div>
        <div className="rounded border bg-gray-50 p-4">
          <p className="font-medium">
            Try running these commands in the terminal below:
          </p>
          <pre className="mt-2 rounded bg-gray-100 p-2">
            ls{"\n"}
            npm install cowsay{"\n"}
            npx cowsay &quot;Hello WebContainer!&quot;
          </pre>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded border bg-black">
          <div ref={terminalRef} className="absolute inset-0 p-2" />
        </div>
      </div>
    </div>
  );
}
