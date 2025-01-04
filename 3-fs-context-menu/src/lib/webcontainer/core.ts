import { type WebContainer } from "@webcontainer/api";
import { WORK_DIR_NAME } from "../constants";

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainerInstance() {
  if (!webcontainerInstance) {
    const { WebContainer } = await import("@webcontainer/api");
    webcontainerInstance = await WebContainer.boot({
      workdirName: WORK_DIR_NAME,
    });
  }
  return webcontainerInstance;
}

export async function mountFiles(
  webcontainer: WebContainer,
  files: Record<string, { file: { contents: string } } | { directory: {} }>,
) {
  await webcontainer.mount(files);
}

// Helper to create a simple file structure
export function createFileTree(files: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(files).map(([path, contents]) => [
      path,
      { file: { contents } },
    ]),
  );
}
