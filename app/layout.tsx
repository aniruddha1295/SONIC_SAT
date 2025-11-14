import type { Metadata } from "next";
import "./globals.css";
import { ContextProvider } from ".";
import ReactQueryProvider from "./ReactQueryProvider";
import { IPProvider } from "@/contexts/IPContext";
import { RoleProvider } from "@/contexts/RoleContext";


// Websit Config
export const metadata: Metadata = {
  title: "FIL-B",
  description: "Made with love by Team FIL-B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <ReactQueryProvider>
          <ContextProvider>
            <RoleProvider>
              <IPProvider>
                {children}
              </IPProvider>
            </RoleProvider>
          </ContextProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
