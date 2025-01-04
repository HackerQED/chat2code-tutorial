"use client";

import { useState } from "react";
import { useStore } from "@nanostores/react";
import { FileTreeItem } from "./FileTreeItem";
import { buildFileList } from "./utils";
import { type FileMap, selectedFileAtom, selectFile } from "@/lib/store/files";
import { FileContextMenu } from "./FileContextMenu";
import { cn } from "@/lib/utils";
import { FileNameDialog } from "./FileNameDialog";
import { DeleteDialog } from "./DeleteDialog";
import { WORK_DIR } from "@/lib/constants";
import * as fs from "@/lib/webcontainer/filesystem";
import path from "path";
import { useWebContainer } from "@/components/shared/WebContainerProvider";
import { createDirectory, writeFile } from "@/lib/webcontainer/filesystem";

interface FileTreeProps {
  files: FileMap;
  className?: string;
}

export function FileTree({ files, className }: FileTreeProps) {
  const { webcontainer } = useWebContainer();
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(
    new Set(),
  );
  const selectedPath = useStore(selectedFileAtom);
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "newFile" | "newFolder" | "rename" | "delete" | null;
    path: string;
    name: string;
  }>({
    open: false,
    type: null,
    path: "",
    name: "",
  });

  const nodes = buildFileList(files);
  console.debug("[FileTree] Built nodes:", nodes);

  const handleSelect = (path: string) => {
    selectFile(path);
  };

  const handleToggle = (path: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Filter out children of collapsed folders
  const visibleNodes = nodes.filter((node) => {
    const parentPath = node.fullPath.substring(
      0,
      node.fullPath.lastIndexOf("/"),
    );
    return !collapsedFolders.has(parentPath);
  });

  const handleCreateFile = (path: string) => {
    setDialog({
      open: true,
      type: "newFile",
      path,
      name: "",
    });
  };

  const handleCreateFolder = (path: string) => {
    setDialog({
      open: true,
      type: "newFolder",
      path,
      name: "",
    });
  };

  const handleRename = (path: string, oldName: string) => {
    setDialog({
      open: true,
      type: "rename",
      path,
      name: oldName,
    });
  };

  const handleDelete = (path: string, name: string) => {
    setDialog({
      open: true,
      type: "delete",
      path,
      name,
    });
  };

  const getRelativePath = (absolutePath: string) => {
    return path.relative(WORK_DIR, absolutePath);
  };

  const handleSubmitName = async (filename: string) => {
    if (!dialog.type || !dialog.path || !webcontainer) return;

    try {
      switch (dialog.type) {
        case "newFile": {
          const relativePath = getRelativePath(
            path.join(dialog.path || WORK_DIR, filename),
          );
          await writeFile(webcontainer, relativePath, "");
          break;
        }
        case "newFolder": {
          const relativePath = getRelativePath(
            path.join(dialog.path || WORK_DIR, filename),
          );
          await createDirectory(webcontainer, relativePath);
          break;
        }
        case "rename": {
          const oldRelativePath = getRelativePath(dialog.path);
          const newRelativePath = getRelativePath(
            path.join(path.dirname(dialog.path), filename),
          );

          if (dialog.path.includes(".")) {
            const content = await fs.readFile(webcontainer, oldRelativePath);
            await fs.writeFile(webcontainer, newRelativePath, content);
          } else {
            await fs.createDirectory(webcontainer, newRelativePath);
            // TODO: 如果是文件夹，需要递归复制内容
          }
          await fs.removeDirectory(webcontainer, oldRelativePath);
          break;
        }
      }
    } catch (error) {
      console.error("File operation failed:", error);
      // TODO: 添加错误提示
    }
  };

  const handleConfirmDelete = async () => {
    if (!dialog.path || !webcontainer) return;

    try {
      const relativePath = getRelativePath(dialog.path);
      if (dialog.path.includes(".")) {
        await fs.deleteFile(webcontainer, relativePath);
      } else {
        await fs.removeDirectory(webcontainer, relativePath);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      // TODO: 添加错误提示
    }
  };

  return (
    <>
      <FileContextMenu
        onCreateFile={() => handleCreateFile(WORK_DIR)}
        onCreateFolder={() => handleCreateFolder(WORK_DIR)}
      >
        <div className="flex h-full flex-col">
          <div className={cn("flex-1", className)}>
            {visibleNodes.length > 0 ? (
              visibleNodes.map((node) => (
                <FileTreeItem
                  key={node.id}
                  node={node}
                  selected={node.fullPath === selectedPath}
                  collapsed={collapsedFolders.has(node.fullPath)}
                  onSelect={handleSelect}
                  onToggle={handleToggle}
                  onCreateFile={handleCreateFile}
                  onCreateFolder={handleCreateFolder}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <p>No files yet</p>
              </div>
            )}
          </div>
          <div className="border-t p-2">
            <p className="text-xs text-muted-foreground">
              Right click to add or modify files
            </p>
          </div>
        </div>
      </FileContextMenu>

      {(dialog.type === "newFile" ||
        dialog.type === "newFolder" ||
        dialog.type === "rename") && (
        <FileNameDialog
          open={dialog.open}
          onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
          onSubmit={handleSubmitName}
          title={
            dialog.type === "rename"
              ? "Rename"
              : dialog.type === "newFile"
                ? "Create New File"
                : "Create New Folder"
          }
          defaultValue={dialog.type === "rename" ? dialog.name : ""}
          mode={dialog.type === "rename" ? "rename" : "create"}
        />
      )}

      {dialog.type === "delete" && (
        <DeleteDialog
          open={dialog.open}
          onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
          onConfirm={handleConfirmDelete}
          name={dialog.name}
          type={dialog.path.includes(".") ? "file" : "folder"}
        />
      )}
    </>
  );
}
