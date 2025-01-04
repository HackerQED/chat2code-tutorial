"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useStore } from "@nanostores/react";
import {
  terminals,
  activeTerminalId,
  addTerminal,
  removeTerminal,
  setActiveTerminal,
} from "@/lib/store/terminal-store";

const TerminalView = dynamic(() => import("./TerminalView"), { ssr: false });

export function TerminalTabs() {
  const $terminals = useStore(terminals);
  const $activeTerminalId = useStore(activeTerminalId);

  const createNewTerminal = () => {
    addTerminal({
      id: nanoid(),
      name: `Terminal ${$terminals.length + 1}`,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Tabs Header */}
      <div className="flex items-center border-b px-2">
        <div className="flex">
          {$terminals.map((term) => (
            <div
              key={term.id}
              className={`cursor-pointer px-3 py-2 hover:bg-muted ${
                term.id === $activeTerminalId ? "border-b-2 border-primary" : ""
              }`}
              onClick={() => setActiveTerminal(term.id)}
            >
              <span className="text-sm">{term.name}</span>
            </div>
          ))}
        </div>
        {$terminals.length < 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={createNewTerminal}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Terminals Container */}
      <div className="relative flex-1">
        {$terminals.map((term) => (
          <div
            key={term.id}
            className={`absolute inset-0 ${
              term.id === $activeTerminalId ? "block" : "hidden"
            }`}
          >
            <TerminalView terminalId={term.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
