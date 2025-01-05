"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FileNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (filename: string) => void;
  title: string;
  defaultValue?: string;
  mode?: "create" | "rename";
}

export function FileNameDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  defaultValue = "",
  mode = "create",
}: FileNameDialogProps) {
  const [filename, setFilename] = useState(defaultValue);

  // Reset filename when dialog opens with new defaultValue
  useEffect(() => {
    if (open) {
      setFilename(defaultValue);
    }
  }, [open, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filename.trim()) {
      onSubmit(filename.trim());
      setFilename("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter name..."
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!filename.trim()}>
              {mode === "create" ? "Create" : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
