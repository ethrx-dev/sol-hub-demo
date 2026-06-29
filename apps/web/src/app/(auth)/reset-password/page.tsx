"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "@/src/lib/api-client";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }
    if (!password) {
      setError("Please enter a new password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired reset token";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>This password reset link is invalid or missing a token.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password">
              <Button className="w-full" corner="sol">
                Request a new reset link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Password Reset</CardTitle>
            <CardDescription>Your password has been reset successfully.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <Link href="/login" className="w-full">
                <Button className="w-full" corner="sol">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[0_10px_0_10px] bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
            <Button type="submit" className="w-full" corner="sol" loading={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-[0_30px_0_30px] px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
