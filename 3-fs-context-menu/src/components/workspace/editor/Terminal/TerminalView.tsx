/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useWebContainer } from "@/components/shared/WebContainerProvider";
import { createTerminal } from "@/lib/webcontainer/terminal";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useCallback, useEffect, useRef } from "react";

interface TerminalViewProps {
  terminalId: string;
}

export default function TerminalView({ terminalId }: TerminalViewProps) {
  const { webcontainer } = useWebContainer();
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal>();
  const fitAddon = useRef<FitAddon>();
  const shellProcess = useRef<any>();
  const isTerminalReady = useRef(false);

  // Cleanup terminal resources
  const cleanup = useCallback(() => {
    isTerminalReady.current = false;

    // Cleanup terminal
    if (terminalInstance.current) {
      terminalInstance.current.dispose();
      terminalInstance.current = undefined;
    }

    // Cleanup shell process - no longer try to close the process
    // WebContainer will automatically manage process lifecycle
    shellProcess.current = undefined;
  }, []);

  const initTerminal = useCallback(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
      fontSize: 12,
      fontFamily: "Menlo, courier-new, courier, monospace",
      cols: 80,
      rows: 24,
    });

    // Add addons
    const fit = new FitAddon();
    const webLinks = new WebLinksAddon();
    terminal.loadAddon(fit);
    terminal.loadAddon(webLinks);

    // Store instances
    terminalInstance.current = terminal;
    fitAddon.current = fit;

    // Open terminal
    terminal.open(terminalRef.current);

    // Ensure terminal is properly sized before marking as ready
    setTimeout(() => {
      fit.fit();
      isTerminalReady.current = true;
    }, 0);

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (!isTerminalReady.current) return;
      fit.fit();
      if (shellProcess.current) {
        shellProcess.current.resize(terminal.cols, terminal.rows);
      }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    return initTerminal();
  }, [initTerminal]);

  // Connect to WebContainer
  useEffect(() => {
    async function connectTerminal() {
      if (
        !webcontainer ||
        !terminalInstance.current ||
        !fitAddon.current ||
        !isTerminalReady.current
      ) {
        return;
      }

      try {
        // Ensure terminal dimensions are available
        const terminal = terminalInstance.current;
        const dimensions = {
          cols: terminal.cols || 80,
          rows: terminal.rows || 24,
        };

        const process = await createTerminal(
          webcontainer,
          terminal,
          dimensions,
        );

        shellProcess.current = process;
      } catch (err) {
        console.error("Failed to create terminal:", err);
      }
    }

    // Add a delay to ensure terminal is fully initialized
    const timer = setTimeout(() => {
      void connectTerminal();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [webcontainer, cleanup]);

  return (
    <div className="h-full">
      <div className="h-full" ref={terminalRef} />
    </div>
  );
}
