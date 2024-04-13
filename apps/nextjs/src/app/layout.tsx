import type { Metadata, Viewport } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import { cn } from "@meztli/ui"
import { ThemeProvider, ThemeToggle } from "@meztli/ui/theme"
import { Toaster } from "@meztli/ui/toast"

import { TRPCReactProvider } from "~/trpc/react"

import "~/app/globals.css"

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.VERCEL_ENV === "production"
            ? "http://localhost:3000"
            : "http://localhost:3000",
    ),
    title: "Meztli",
    description: "Simple monorepo with shared backend for web & mobile apps",
    openGraph: {
        title: "Meztli",
        description:
            "Simple monorepo with shared backend for web & mobile apps",
        url: "https://github.com/lelopez-io/meztli-template",
        siteName: "Meztli",
    },
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
}

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans text-foreground antialiased",
                    GeistSans.variable,
                    GeistMono.variable,
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <TRPCReactProvider>{props.children}</TRPCReactProvider>
                    <div className="absolute bottom-4 right-4">
                        <ThemeToggle />
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
