import { type WebContainer } from "@webcontainer/api";

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainerInstance() {
  if (!webcontainerInstance) {
    const { WebContainer } = await import("@webcontainer/api");
    webcontainerInstance = await WebContainer.boot();
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
