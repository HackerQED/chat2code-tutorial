"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import { FileContextMenu } from "./FileContextMenu";

export interface Node {
  id: number;
  kind: "file" | "folder";
  name: string;
  fullPath: string;
  depth: number;
}

export interface FileTreeItemProps {
  node: Node;
  selected: boolean;
  collapsed: boolean;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onCreateFile?: (path: string) => void;
  onCreateFolder?: (path: string) => void;
  onRename?: (path: string, name: string) => void;
  onDelete?: (path: string, name: string) => void;
}

export function FileTreeItem({
  node,
  selected,
  collapsed,
  onSelect,
  onToggle,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}: FileTreeItemProps) {
  const isFolder = node.kind === "folder";
  const paddingLeft = `${(node.depth + 1) * 16}px`;

  return (
    <FileContextMenu
      onCreateFile={() => {
        const path = isFolder
          ? node.fullPath
          : node.fullPath.substring(0, node.fullPath.lastIndexOf("/"));
        onCreateFile?.(path);
      }}
      onCreateFolder={() => {
        const path = isFolder
          ? node.fullPath
          : node.fullPath.substring(0, node.fullPath.lastIndexOf("/"));
        onCreateFolder?.(path);
      }}
      onRename={() => onRename?.(node.fullPath, node.name)}
      onDelete={() => onDelete?.(node.fullPath, node.name)}
    >
      <div
        className={cn(
          "group flex h-8 cursor-pointer items-center gap-2 rounded-sm px-2 text-sm hover:bg-accent/50",
          selected && "bg-accent text-accent-foreground",
        )}
        style={{ paddingLeft }}
        onClick={(e) => {
          e.stopPropagation();
          if (isFolder && onToggle) {
            onToggle(node.fullPath);
          } else {
            onSelect(node.fullPath);
          }
        }}
      >
        <div className="flex items-center gap-1">
          {isFolder ? (
            <>
              <div className="flex h-4 w-4 items-center justify-center">
                {collapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </div>
              <Folder className="h-4 w-4 text-blue-400" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
        <span className="truncate">{node.name}</span>
      </div>
    </FileContextMenu>
  );
}
