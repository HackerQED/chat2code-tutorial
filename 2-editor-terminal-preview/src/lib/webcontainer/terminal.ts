import { type WebContainer } from "@webcontainer/api";
import { type Terminal } from "@xterm/xterm";

interface TerminalOptions {
  cols?: number;
  rows?: number;
}

export async function createTerminal(
  webcontainer: WebContainer,
  term: Terminal,
  options: TerminalOptions = {},
) {
  // Start jsh process with OSC support
  const shellProcess = await webcontainer.spawn("/bin/jsh", ["--osc"], {
    terminal: {
      cols: options.cols ?? term.cols,
      rows: options.rows ?? term.rows,
    },
  });

  const input = shellProcess.input.getWriter();
  let isInteractive = false;
  const jshReady = new Promise<void>((resolve) => {
    // Pipe terminal output to xterm
    void shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          // Check for interactive mode OSC signal
          if (!isInteractive) {
            const [, osc] = /\x1b\]654;([^\x07]+)\x07/.exec(data) || [];
            if (osc === "interactive") {
              isInteractive = true;
              resolve();
            }
          }
          term.write(data);
        },
      }),
    );
  });

  // Pipe xterm input to terminal
  term.onData((data) => {
    if (isInteractive) {
      input.write(data);
    }
  });

  // Wait for jsh to be ready
  await jshReady;

  return {
    process: shellProcess,
    resize: (cols: number, rows: number) => {
      shellProcess.resize({ cols, rows });
    },
  };
}
