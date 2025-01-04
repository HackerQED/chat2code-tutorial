import { atom, map } from "nanostores";
import { type PathWatcherEvent, type WebContainer } from "@webcontainer/api";
import { listFiles } from "../webcontainer/filesystem";
import { Buffer } from "node:buffer";
import { WORK_DIR } from "../constants";

// Types
export interface FileNode {
  type: "file" | "directory";
  name: string;
  content?: string;
  isBinary?: boolean;
}

export type FileMap = Record<string, FileNode>;

// Stores
export const filesStore = map<FileMap>({});
export const selectedFileAtom = atom<string | null>(null);
export const modifiedFilesStore = map<Set<string>>(new Set());

const utf8TextDecoder = new TextDecoder("utf8", { fatal: true });

const logger = {
  debug: (...args: unknown[]) => console.debug("[FilesStore]", ...args),
  error: (...args: unknown[]) => console.error("[FilesStore]", ...args),
};

// Check if path is within working directory
function isInWorkDir(path: string): boolean {
  return path.startsWith(WORK_DIR);
}

// Actions
export function selectFile(path: string | null) {
  selectedFileAtom.set(path);
}

function processWatchEvents(events: PathWatcherEvent[]) {
  const watchEvents = events;
  logger.debug("Processing watch events:", watchEvents);

  const files = { ...filesStore.get() };

  for (const { type, path, ...event } of watchEvents) {
    if (!isInWorkDir(path)) {
      logger.debug("Ignoring event outside work dir:", path);
      continue;
    }

    switch (type) {
      case "add_file":
      case "change": {
        let content: string | undefined;
        let isBinary = false;

        if (event.buffer) {
          try {
            content = utf8TextDecoder.decode(event.buffer);
          } catch (err) {
            isBinary = true;
            content = undefined;
          }
        }

        files[path] = {
          type: "file",
          name: path.split("/").pop() || "",
          content,
          isBinary,
        };
        break;
      }
      case "add_dir": {
        files[path] = {
          type: "directory",
          name: path.split("/").pop() || "",
        };
        break;
      }
      case "remove_dir": {
        delete files[path];
        Object.keys(files).forEach((key) => {
          if (key.startsWith(path + "/")) {
            delete files[key];
          }
        });
        break;
      }
      case "remove_file": {
        delete files[path];
        break;
      }
      default:
        logger.debug("Unhandled event type:", type);
    }
  }

  logger.debug("Updating files with new content:", files);
  filesStore.set(files);
  logger.debug("Files after update:", filesStore.get());
}

// Watch for WebContainer changes
export function watchFileSystem(webcontainer: WebContainer) {
  logger.debug("Initializing file system watcher");

  // Watch for file changes using internal API
  webcontainer.internal.watchPaths(
    {
      include: [`${WORK_DIR}/**`],
      exclude: ["**/node_modules", ".git"],
      includeContent: true,
    },
    (events) => {
      logger.debug("Received watch events");
      processWatchEvents(events);
    },
  );
}
