import { type WebContainer } from "@webcontainer/api";
import { WORK_DIR_NAME } from "../constants";

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainerInstance() {
  if (!webcontainerInstance) {
    const { WebContainer } = await import("@webcontainer/api");
    webcontainerInstance = await WebContainer.boot({
      workdirName: WORK_DIR_NAME,
    });
  }
  return webcontainerInstance;
}
