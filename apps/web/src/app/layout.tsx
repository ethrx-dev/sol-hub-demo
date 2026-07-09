import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { Providers } from "@/src/components/providers";
import { Toaster } from "@/src/components/ui/toast";
import { ErrorBoundary } from "@/src/components/shared/error-boundary";
import { Analytics } from "@/src/components/shared/analytics";
// CSS loaded via <link> in metadata (pre-built by @tailwindcss/cli)

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "SOL Hub - Private Membership Incubation Platform",
  description:
    "Nurture your dream into a successful business with SOL Hub. Join a community of innovators, mentors, and conscious investors.",
  icons: {
    icon: "/sol-icon-color.svg",
    shortcut: "/sol-icon-color.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${roboto.variable} font-sans`}>
        <link rel="stylesheet" href="/globals.css" />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
