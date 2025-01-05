import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { ActionRunnerConnection } from "@/components/shared/ActionRunnerConnection";
import { WebContainerProvider } from "@/components/shared/WebContainerProvider";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Chat2Code",
  description: "AI-powered coding environment",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-screen">
        <TRPCReactProvider>
          <WebContainerProvider>
            <ActionRunnerConnection>
              <main className="h-screen">{children}</main>
            </ActionRunnerConnection>
          </WebContainerProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
