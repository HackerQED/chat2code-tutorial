"use client";

import { useEffect, useRef, useState } from "react";
import { useWebContainer } from "@/components/shared/WebContainerProvider";

export function PreviewPanel() {
  const { webcontainer } = useWebContainer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(
    "Waiting for server to start...",
  );

  useEffect(() => {
    if (!webcontainer) return;

    // Listen for port events
    webcontainer.on(
      "port",
      (port: number, type: "open" | "close", url: string) => {
        if (port === 3000) {
          // 只关注 3000 端口
          if (type === "open") {
            setStatus(`Server running on port ${port}`);
            setPreviewUrl(url);
          } else if (type === "close") {
            setStatus("Server stopped");
            setPreviewUrl(null);
          }
        }
      },
    );

    return () => {
      setPreviewUrl(null);
      setStatus("Waiting for server to start...");
    };
  }, [webcontainer]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-2">
        <h3 className="text-sm font-medium">Preview</h3>
        <span className="text-sm text-muted-foreground">{status}</span>
      </div>

      <div className="relative flex-1">
        {!previewUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
            <p>{status}</p>
            <p className="text-sm text-muted-foreground">
              Start your server to see the preview
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className="h-full w-full border-0"
          src={previewUrl ?? "about:blank"}
          sandbox="allow-same-origin allow-scripts allow-forms"
          title="Preview"
        />
      </div>
    </div>
  );
}
