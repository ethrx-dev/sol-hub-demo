"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api-client";
import { Loader2, Upload } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  const [profile, setProfile] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    matches: true,
    messages: true,
    milestones: true,
    activity: true,
    email_matches: true,
    email_messages: true,
    email_milestones: true,
    email_activity: true,
  });
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    api
      .get<any>("/users/me/notification-preferences")
      .then((data) => {
        if (data) {
          setNotifPrefs({
            matches: data.matches ?? true,
            messages: data.messages ?? true,
            milestones: data.milestones ?? true,
            activity: data.activity ?? true,
            email_matches: data.email_matches ?? true,
            email_messages: data.email_messages ?? true,
            email_milestones: data.email_milestones ?? true,
            email_activity: data.email_activity ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/me", { full_name: profile.fullName, email: profile.email });
      toast.success("Profile updated");
      const dashPaths: Record<string, string> = {
        admin: "/admin",
        innovator: "/innovator/projects",
        mentor: "/mentor/browse",
        investor: "/investor/browse",
      };
      router.push(dashPaths[user?.role || ""] || "/");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        current_password: passwords.current,
        new_password: passwords.new,
      });
      toast.success("Password changed");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/me/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Avatar updated");
      await refreshUser();
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleNotifSave = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me/notification-preferences", notifPrefs);
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || ""} />
                  <AvatarFallback className="text-lg">
                    {(user?.full_name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={avatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Photo
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP. Max 5MB.</p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <Input
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, fullName: e.target.value }))
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, current: e.target.value }))
                  }
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, new: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, confirm: e.target.value }))
                  }
                  required
                />
                <Button type="submit" loading={saving}>
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notifLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">In-App Notifications</p>
                    <div className="space-y-2">
                      {[
                        { label: "New match notifications", key: "matches" as const },
                        { label: "Message notifications", key: "messages" as const },
                        { label: "Milestone updates", key: "milestones" as const },
                        { label: "Community activity", key: "activity" as const },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 rounded-lg border p-4"
                        >
                          <input
                            type="checkbox"
                            checked={notifPrefs[item.key]}
                            onChange={(e) =>
                              setNotifPrefs((p) => ({ ...p, [item.key]: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Email Notifications</p>
                    <div className="space-y-2">
                      {[
                        { label: "Match updates via email", key: "email_matches" as const },
                        { label: "Messages via email", key: "email_messages" as const },
                        { label: "Milestone updates via email", key: "email_milestones" as const },
                        { label: "Activity digests via email", key: "email_activity" as const },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 rounded-lg border p-4"
                        >
                          <input
                            type="checkbox"
                            checked={notifPrefs[item.key]}
                            onChange={(e) =>
                              setNotifPrefs((p) => ({ ...p, [item.key]: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleNotifSave} loading={saving}>
                    Save Preferences
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BillingTab() {
  const [sub, setSub] = useState<{ tier: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ tier: string; status: string }>("/membership/my-subscription")
      .then((data) => setSub(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tierName = sub?.tier ? sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1) : "Free";
  const isPaid = sub?.tier && sub.tier !== "free";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Membership</CardTitle>
        <CardDescription>Manage your subscription and payment methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
          <div>
            <p className="text-sm font-medium">Current Plan</p>
            <p className="text-2xl font-bold">{tierName}</p>
            <p className="text-sm text-muted-foreground capitalize">{sub?.status || "inactive"}</p>
          </div>
          <Badge variant={isPaid ? "success" : "secondary"}>{isPaid ? "Active" : "Free"}</Badge>
        </div>
        <Link href="/settings/billing">
          <Button variant="outline">Manage Billing</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
