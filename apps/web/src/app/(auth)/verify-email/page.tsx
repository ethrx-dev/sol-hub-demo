"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { CheckCircle, Loader2, XCircle, ArrowLeft } from "lucide-react";
import { api } from "@/src/lib/api-client";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.message || "Invalid or expired verification token.");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
            <p className="text-center text-sm text-muted-foreground">{message}</p>
            {status === "success" && (
              <Link href="/login" className="w-full">
                <Button className="w-full" corner="sol">
                  Sign In
                </Button>
              </Link>
            )}
            {status === "error" && (
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline" corner="sol">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
