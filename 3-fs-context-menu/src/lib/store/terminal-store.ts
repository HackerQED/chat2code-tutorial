import { atom } from "nanostores";

export interface TerminalTab {
  id: string;
  name: string;
}

// 存储终端标签
export const terminals = atom<TerminalTab[]>([]);

// 当前活跃的终端ID
export const activeTerminalId = atom<string | null>(null);

// 终端面板是否可见
export const isTerminalVisible = atom(true);

const MAX_TERMINALS = 3;

// Actions
export function addTerminal(terminal: TerminalTab) {
  const currentTerminals = terminals.get();
  if (currentTerminals.length >= MAX_TERMINALS) return;

  terminals.set([...currentTerminals, terminal]);
  activeTerminalId.set(terminal.id);
}

export function removeTerminal(id: string) {
  const currentTerminals = terminals.get();
  const newTerminals = currentTerminals.filter((t) => t.id !== id);
  terminals.set(newTerminals);

  if (activeTerminalId.get() === id) {
    activeTerminalId.set(newTerminals[0]?.id ?? null);
  }
}

export function setActiveTerminal(id: string) {
  activeTerminalId.set(id);
}

export function setVisible(visible: boolean) {
  isTerminalVisible.set(visible);
}
