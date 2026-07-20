"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useAuth, type UserRole } from "@/src/lib/auth";
import VideoRecorder from "@/src/components/shared/VideoRecorder";

const PILLAR_MAP: Record<string, UserRole> = {
  innovators: "innovator",
  mentors: "mentor",
  investors: "investor",
};

const AGREEMENT_KEY = "sol_membership_agreed";

function RegisterForm() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pillar = searchParams.get("pillar");
  const preselectedRole = pillar ? PILLAR_MAP[pillar] || "" : "";

  const justRegistered = useRef(false);

  const [agreementAccepted, setAgreementAccepted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAgreementAccepted(localStorage.getItem(AGREEMENT_KEY) === "true");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !justRegistered.current) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const acceptAgreement = () => {
    localStorage.setItem(AGREEMENT_KEY, "true");
    setAgreementAccepted(true);
  };

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: preselectedRole as UserRole | "",
    membershipAgreed: false,
    emailAlerts: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!form.membershipAgreed) {
      setError("You must agree to the Membership Agreement to join");
      return;
    }

    setLoading(true);
    justRegistered.current = true;
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: (form.role || "participant") as UserRole,
        membershipAgreed: form.membershipAgreed,
        emailAlerts: form.emailAlerts,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  if (!agreementAccepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center gap-3">
            <img src="/sol-icon.svg" alt="SOL" className="h-8 w-8" />
            <div>
              <h2 className="text-lg font-bold font-heading">Membership Agreement</h2>
              <p className="text-xs text-muted-foreground">Private Membership Association Notice &amp; Agreement</p>
            </div>
          </div>
          <div className="px-6 py-4 text-sm space-y-4 leading-relaxed">
            <p>Becoming a member of <strong>SPACES OF LEARNING</strong> (SOL) is required to participate in its activities. Please read the terms and conditions below. Membership is free at this time.</p>
            <p>This Membership Agreement is entered into by and between the undersigned individual (&ldquo;Member&rdquo;) and SOL PMA, a Private Membership Association, effective as of the date signed below.</p>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs">
              <p className="font-medium">As a Private Member of SOL you acknowledge that SOL is a Private Membership Association exercising the right of &ldquo;freedom of association&rdquo; as guaranteed by the 1st and 14th Amendments of the U.S. Constitution. The Association is protected under the 1st, 4th, 5th, 9th, 10th and 14th Amendments. This means the Association is outside the jurisdiction and authority of ALL STATE and FEDERAL agencies and Law Enforcement Authorities.</p>
            </div>
            <ol className="list-none space-y-3 pl-0">
              <li><strong>1.</strong> This Association declares our main objective is to protect our rights to learning freedom of choice.</li>
              <li><strong>2.</strong> As Private Members, we affirm our belief that the Creator guarantees our rights of free speech, petition, assembly, and the right to gather together for lawful purposes.</li>
              <li><strong>3.</strong> You understand you have entered into the private jurisdiction when accessing SOL and that you respect the private nature and confidentiality of all SOL activities.</li>
              <li><strong>4.</strong> SOL makes zero claims, promises, commitments, or guarantees.</li>
              <li><strong>5.</strong> All information provided is for learning purposes only and is not intended to discredit any system of education.</li>
              <li><strong>6.</strong> Some information is copyrighted and confidential; Private Members may make private referrals to SOL.</li>
              <li><strong>7.</strong> You forever take full responsibility, unlimited liability, and 100% risk for your own safety and health.</li>
              <li><strong>8.</strong> You will freely select the members most skilled to assist your specific needs.</li>
              <li><strong>9.</strong> You have absolute freedom to make all your own choices and access information free from censorship.</li>
              <li><strong>10.</strong> You agree to act honorably towards all SOL Members at all times.</li>
              <li><strong>11.</strong> You agree to abide by the SOL code of conduct.</li>
              <li><strong>12.</strong> Within SOL, no relationship exists other than a Private Member-to-Private Member Association relationship. You have freely chosen to change your legal status from &ldquo;public person&rdquo; to &ldquo;Private Member&rdquo; of SOL.</li>
              <li><strong>13.</strong> You are entering into this Agreement of your own free will without any pressure. You can withdraw and terminate your membership at any time.</li>
            </ol>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs">
              <strong>Notice:</strong> SPACES OF LEARNING is a private, membership-based organization functioning for learning purposes only. No information should be considered legal or health advice. By entering this website you agree you entered a private domain subject to SOL Membership Agreement and Terms of Use.
            </div>
          </div>
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">Back to Home</Link>
            <button onClick={acceptAgreement} className="btn-sol btn-sol-primary text-sm uppercase">
              I Agree &amp; Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/sol-icon.svg" alt="SOL" className="h-12 w-12" />
        </div>

        {pillar && (
          <div className="mb-8">
            <VideoRecorder pillar={pillar as "innovators" | "mentors" | "investors"} />
          </div>
        )}

        <Card>
        <CardHeader className="text-center">
          <CardTitle>Join Our PMA</CardTitle>
          <CardDescription>Sign up for Spaces of Learning Private Membership Association</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[0_10px_0_10px] bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                How do you feel called to contribute?{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Select
                value={form.role}
                onValueChange={(v) => update("role", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role, or arrive as a Participant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="innovator">Innovator</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="participant">Participant — not sure yet, let me be met first</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nothing is decided here. Your contribution comes into focus through reflection, not a
                checkbox — you can change this anytime.
              </p>
            </div>
            <div className="rounded-[0_10px_0_10px] border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <strong className="text-primary">SPACES OF LEARNING</strong> is a Private Membership
              Association (PMA). By joining, you are entering into a private membership subject to
              our{" "}
              <Link href="/membership-agreement" className="text-primary underline">
                Membership Agreement
              </Link>
              , Terms of Use, and Privacy Policy.
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.membershipAgreed}
                onChange={(e) => update("membershipAgreed", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>
                I have read and agree to the{" "}
                <Link href="/membership-agreement" className="text-primary underline">
                  Membership Agreement
                </Link>{" "}
                and acknowledge that SOL is a Private Membership Association exercising the right
                of freedom of association guaranteed by the 1st and 14th Amendments.
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.emailAlerts}
                onChange={(e) => update("emailAlerts", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>Get email alerts about events, opportunities, and community updates</span>
            </label>

            <Button type="submit" className="w-full" corner="sol" loading={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
