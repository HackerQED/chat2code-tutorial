import { type WebContainer } from "@webcontainer/api";

export async function readFile(webcontainer: WebContainer, path: string) {
  const file = await webcontainer.fs.readFile(path, "utf-8");
  return file;
}

export async function writeFile(
  webcontainer: WebContainer,
  path: string,
  contents: string,
) {
  await webcontainer.fs.writeFile(path, contents);
}

export async function listFiles(webcontainer: WebContainer, path: string) {
  const entries = await webcontainer.fs.readdir(path, { withFileTypes: true });
  return entries;
}

export async function deleteFile(webcontainer: WebContainer, path: string) {
  await webcontainer.fs.rm(path);
}

export async function createDirectory(
  webcontainer: WebContainer,
  path: string,
) {
  await webcontainer.fs.mkdir(path, { recursive: true });
}

export async function removeDirectory(
  webcontainer: WebContainer,
  path: string,
  options = { recursive: true },
) {
  await webcontainer.fs.rm(path, options);
}

export async function modifyFile(
  webcontainer: WebContainer,
  path: string,
  modifier: (content: string) => string,
) {
  const content = await readFile(webcontainer, path);
  const modified = modifier(content);
  await writeFile(webcontainer, path, modified);
  return modified;
}
