import ModalProvider from "@/components/providers/ModalProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Discord",
  description:
    "A discord-like web application where users can interact via text, voice and video channels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(font.className,"bg-white dark:bg-[#313338]")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <SocketProvider>
                <ModalProvider/>
                {children}
              </SocketProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
