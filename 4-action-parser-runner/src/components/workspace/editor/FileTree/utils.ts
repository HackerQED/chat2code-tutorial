/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Node } from "./FileTreeItem";
import { WORK_DIR } from "@/lib/constants";
import { type FileNode as StoreFileNode } from "@/lib/store/files";

export function buildFileList(
  files: Record<string, StoreFileNode>,
  rootPath = WORK_DIR,
): Node[] {
  const nodes: Node[] = [];
  const folderPaths = new Set<string>();
  let id = 0;

  // Process folders first
  Object.entries(files).forEach(([filePath, fileNode]) => {
    if (!filePath.startsWith(rootPath) || fileNode.type !== "directory") {
      return;
    }

    const relativePath = filePath.slice(rootPath.length);
    const segments = relativePath.split("/").filter(Boolean);
    let currentPath = rootPath;

    segments.forEach((segment, index) => {
      currentPath += "/" + segment;
      const isLast = index === segments.length - 1;
      const depth = segments.slice(0, index + 1).length - 1;

      if (!folderPaths.has(currentPath)) {
        folderPaths.add(currentPath);
        nodes.push({
          id: id++,
          kind: "folder",
          name: segment,
          fullPath: currentPath,
          depth,
        });
      }
    });
  });

  // Then process files
  Object.entries(files).forEach(([filePath, fileNode]) => {
    if (!filePath.startsWith(rootPath) || fileNode.type !== "file") {
      return;
    }

    const relativePath = filePath.slice(rootPath.length);
    const segments = relativePath.split("/").filter(Boolean);
    let currentPath = rootPath;

    segments.forEach((segment, index) => {
      currentPath += "/" + segment;
      const isLast = index === segments.length - 1;
      const depth = segments.slice(0, index + 1).length - 1;

      if (isLast) {
        nodes.push({
          id: id++,
          kind: "file",
          name: segment,
          fullPath: currentPath,
          depth,
        });
      }
    });
  });

  return sortFileList(nodes);
}

function sortFileList(nodes: Node[]): Node[] {
  const nodeMap = new Map<string, Node>();
  const childrenMap = new Map<string, Node[]>();

  // pre-sort nodes by name and type
  nodes.sort((a, b) => compareNodes(a, b));

  for (const node of nodes) {
    nodeMap.set(node.fullPath, node);

    const parentPath = node.fullPath.slice(0, node.fullPath.lastIndexOf("/"));

    if (!childrenMap.has(parentPath)) {
      childrenMap.set(parentPath, []);
    }

    childrenMap.get(parentPath)?.push(node);
  }

  const sortedList: Node[] = [];

  const depthFirstTraversal = (path: string): void => {
    const node = nodeMap.get(path);

    if (node) {
      sortedList.push(node);
    }

    const children = childrenMap.get(path);

    if (children) {
      for (const child of children) {
        if (child.kind === "folder") {
          depthFirstTraversal(child.fullPath);
        } else {
          sortedList.push(child);
        }
      }
    }
  };

  // Start traversal from root nodes (nodes without parents)
  const rootNodes = nodes.filter(
    (node) =>
      !nodeMap.has(node.fullPath.slice(0, node.fullPath.lastIndexOf("/"))),
  );
  for (const rootNode of rootNodes) {
    depthFirstTraversal(rootNode.fullPath);
  }

  return sortedList;
}

function compareNodes(a: Node, b: Node): number {
  if (a.kind !== b.kind) {
    return a.kind === "folder" ? -1 : 1;
  }

  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
