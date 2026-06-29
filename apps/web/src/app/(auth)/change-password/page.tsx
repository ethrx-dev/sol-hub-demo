"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "@/src/lib/api-client";
import { useAuth } from "@/src/lib/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Password Changed</CardTitle>
            <CardDescription>Your password has been updated successfully.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <Link href="/hub" className="w-full">
                <Button className="w-full" corner="sol">
                  Back to Hub
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
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Enter your current password and a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[0_10px_0_10px] bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your current password"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              required
            />
            <Button type="submit" className="w-full" corner="sol" loading={loading}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
            <Link
              href="/hub"
              className="inline-flex w-full items-center justify-center rounded-[0_30px_0_30px] px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hub
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
