import { Navbar } from "@/src/components/layout/navbar";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="relative border-t-2 border-tan bg-footer text-white overflow-hidden">
        <div className="absolute bottom-0 right-0 opacity-[0.04] pointer-events-none">
          <img src="/sol-asset-5.svg" alt="" className="w-[400px] sm:w-[600px]" />
        </div>
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <img src="/sol-icon.svg" alt="" className="w-[150px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <img src="/sol-logo.svg" alt="SOL Hub" className="h-8 w-auto" />
                <span className="text-lg font-bold font-heading">Hub</span>
              </div>
              <p className="mt-3 text-sm text-white/70">
                Nurturing dreams into successful businesses through community-powered incubation.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold font-heading text-white">Platform</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/" className="text-sm text-white/70 hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-sm text-white/70 hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/pricing" className="text-sm text-white/70 hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/resources" className="text-sm text-white/70 hover:text-primary transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold font-heading text-white">Community</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/hub" className="text-sm text-white/70 hover:text-primary transition-colors">Hub</Link></li>
                <li><Link href="/hub/members" className="text-sm text-white/70 hover:text-primary transition-colors">Members</Link></li>
                <li><Link href="/hub/groups" className="text-sm text-white/70 hover:text-primary transition-colors">Groups</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold font-heading text-white">Support</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/about" className="text-sm text-white/70 hover:text-primary transition-colors">Contact</Link></li>
                <li><span className="text-sm text-white/70">help@solhub.com</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm text-white/50">
            &copy; {new Date().getFullYear()} SOL Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
