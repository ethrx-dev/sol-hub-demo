import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { Providers } from "@/src/components/providers";
import { Toaster } from "@/src/components/ui/toast";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${roboto.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
