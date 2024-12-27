"use client";

import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { EditorPanel } from "./editor/EditorPanel";
import { PreviewPanel } from "./preview/PreviewPanel";

// Store
export const activeTab = atom<"editor" | "preview">("editor");
export const setActiveTab = (tab: "editor" | "preview") => activeTab.set(tab);

export function Tabs() {
  const $activeTab = useStore(activeTab);

  return (
    <div className="flex h-full flex-col">
      {/* Tabs Header */}
      <div className="flex items-center border-b px-2">
        <div className="flex">
          <div
            className={`cursor-pointer px-3 py-2 hover:bg-muted ${
              $activeTab === "editor" ? "border-b-2 border-primary" : ""
            }`}
            onClick={() => setActiveTab("editor")}
          >
            <span className="text-sm">Code</span>
          </div>
          <div
            className={`cursor-pointer px-3 py-2 hover:bg-muted ${
              $activeTab === "preview" ? "border-b-2 border-primary" : ""
            }`}
            onClick={() => setActiveTab("preview")}
          >
            <span className="text-sm">Preview</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative flex-1">
        <div
          className={`absolute inset-0 ${
            $activeTab === "editor" ? "block" : "hidden"
          }`}
        >
          <EditorPanel />
        </div>
        <div
          className={`absolute inset-0 ${
            $activeTab === "preview" ? "block" : "hidden"
          }`}
        >
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
