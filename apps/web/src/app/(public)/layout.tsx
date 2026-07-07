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
        <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <img src="/sol-icon.svg" alt="" className="w-[150px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <div className="flex items-center gap-2">
                <img src="/sol-logo-white.svg" alt="SOL" className="h-14 w-auto" />
              </div>
              <p className="mt-3 text-sm text-white/70">
                Nurturing dreams into successful businesses through community-powered incubation.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold font-heading text-white">Platform</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/" className="text-sm text-white/70 hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/what-we-do" className="text-sm text-white/70 hover:text-primary transition-colors">What We Do</Link></li>
                <li><Link href="/innovators" className="text-sm text-white/70 hover:text-primary transition-colors">Innovators</Link></li>
                <li><Link href="/mentors" className="text-sm text-white/70 hover:text-primary transition-colors">Mentors</Link></li>
                <li><Link href="/investors" className="text-sm text-white/70 hover:text-primary transition-colors">Conscious Investors</Link></li>
                <li><Link href="/about" className="text-sm text-white/70 hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/become-a-member" className="text-sm text-white/70 hover:text-primary transition-colors">Become a Member</Link></li>
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
                <li><Link href="/contact" className="text-sm text-white/70 hover:text-primary transition-colors">Contact</Link></li>
                <li><span className="text-sm text-white/70">help@solhub.com</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold font-heading text-white">Legal</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/membership-agreement" className="text-sm text-white/70 hover:text-primary transition-colors">Membership Agreement</Link></li>
                <li><Link href="/terms" className="text-sm text-white/70 hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-white/70 hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold font-heading text-white">Join</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/become-a-member" className="text-sm text-white/70 hover:text-primary transition-colors">Become a Member</Link></li>
                <li><Link href="/register" className="text-sm text-white/70 hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm text-white/50">
            &copy; {new Date().getFullYear()} SOL Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
