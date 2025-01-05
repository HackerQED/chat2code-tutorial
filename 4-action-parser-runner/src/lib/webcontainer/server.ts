/* eslint-disable @typescript-eslint/no-explicit-any */

import type { WebContainerProcess } from "@webcontainer/api";

export class ServerManager {
  private serverProcess: WebContainerProcess | null = null;
  private webcontainer: any; // Replace 'any' with proper WebContainer type

  constructor(webcontainer: any) {
    this.webcontainer = webcontainer;
  }

  async startServer() {
    try {
      // If there's a running server, stop it first
      await this.stopServer();

      // Start new server process
      this.serverProcess = await this.webcontainer.spawn("node", ["index.js"]);

      return new Promise((resolve) => {
        this.webcontainer.on("server-ready", (port: number, url: string) => {
          resolve(url);
        });
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      throw error;
    }
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }

  async restartServer() {
    return this.startServer();
  }
}
