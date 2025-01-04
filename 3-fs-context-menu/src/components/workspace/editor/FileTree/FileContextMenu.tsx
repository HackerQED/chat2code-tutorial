"use client";

import { FolderPlus, FilePlus, Trash2, Edit } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface FileOperations {
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

interface FileContextMenuProps extends FileOperations {
  children: React.ReactNode;
}

export function FileContextMenu({
  children,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {onCreateFolder && (
          <ContextMenuItem onClick={onCreateFolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>New Folder</span>
          </ContextMenuItem>
        )}
        {onCreateFile && (
          <ContextMenuItem onClick={onCreateFile}>
            <FilePlus className="mr-2 h-4 w-4" />
            <span>New File</span>
          </ContextMenuItem>
        )}
        {onRename && (
          <ContextMenuItem onClick={onRename}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
