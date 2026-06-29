"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";
import { Pencil, Save, X, Loader2 } from "lucide-react";

interface Plan {
  tier: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});

  useEffect(() => {
    api.get<Plan[]>("/membership/plans")
      .then(setPlans)
      .catch(() => toast.error("Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (plan: Plan) => {
    setEditingTier(plan.tier);
    setEditForm({ ...plan });
  };

  const cancelEdit = () => {
    setEditingTier(null);
    setEditForm({});
  };

  const savePlan = async (tier: string) => {
    try {
      await api.patch(`/admin/plans/${tier}`, editForm);
      setPlans((prev) => prev.map((p) => (p.tier === tier ? { ...p, ...editForm } as Plan : p)));
      toast.success("Plan updated");
      setEditingTier(null);
    } catch {
      toast.error("Failed to update plan");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Pricing Plans</h1>
        <p className="text-muted-foreground">Manage membership pricing and plan details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.tier} className={plan.tier === "free" ? "border-muted" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{plan.name}</CardTitle>
                <Badge variant={plan.price === 0 ? "secondary" : "success"}>
                  {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}/mo`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {editingTier === plan.tier ? (
                <div className="space-y-3">
                  <Input
                    label="Name"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={editForm.price ?? 0}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  />
                  <Input
                    label="Description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => savePlan(plan.tier)}>
                      <Save className="mr-1 h-3 w-3" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((f) => (
                      <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => startEdit(plan)}>
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
