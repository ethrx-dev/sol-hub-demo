"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

interface MatchSettings {
  id: number;
  sector_weight: number;
  skill_weight: number;
  mentor_exact_weight: number;
  mentor_partial_weight: number;
  guided_weight: number;
  quality_threshold: number;
  ai_enabled: boolean;
  ai_weight: number;
}

const FIELDS: { key: keyof MatchSettings; label: string; hint: string; max: number }[] = [
  { key: "sector_weight", label: "Sector overlap (per shared sector)", hint: "Points added for each sector the person shares with the project.", max: 100 },
  { key: "skill_weight", label: "Skill match", hint: "Points when a person's skill matches the project sub-sector.", max: 100 },
  { key: "mentor_exact_weight", label: "Mentor type — exact match", hint: "Points when mentor type exactly matches the innovator's preferred type.", max: 100 },
  { key: "mentor_partial_weight", label: "Mentor type — partial", hint: "Points when a mentor type exists but differs from preference.", max: 100 },
  { key: "guided_weight", label: "Guided-answer similarity (max)", hint: "Cap on points from the reflection Q&A similarity.", max: 100 },
  { key: "quality_threshold", label: "Quality-match alert threshold", hint: "Whitney is notified when a mentor match scores at or above this.", max: 100 },
];

export default function AdminMatchSettingsPage() {
  const [settings, setSettings] = useState<MatchSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<MatchSettings>("/admin/match-settings")
      .then(setSettings)
      .catch(() => toast.error("Failed to load match settings"))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof MatchSettings, value: number | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const payload = {
        sector_weight: settings.sector_weight,
        skill_weight: settings.skill_weight,
        mentor_exact_weight: settings.mentor_exact_weight,
        mentor_partial_weight: settings.mentor_partial_weight,
        guided_weight: settings.guided_weight,
        quality_threshold: settings.quality_threshold,
        ai_enabled: settings.ai_enabled,
        ai_weight: settings.ai_weight,
      };
      await api.put<MatchSettings>("/admin/match-settings", payload);
      toast.success("Match weighting saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading…</div>;
  }

  if (!settings) {
    return <div className="p-6 text-center text-muted-foreground">Could not load settings.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Match Weighting</h1>
        <p className="mt-1 text-muted-foreground">
          Tune how resonance is scored. Changes apply immediately to new matches and suggestions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scoring Factors (0–100)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium">{field.label}</label>
              <Input
                type="number"
                min={0}
                max={field.max}
                value={String(settings[field.key])}
                onChange={(e) => update(field.key, Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            </div>
          ))}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-Assisted Resonance (Beta)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={settings.ai_enabled}
              onChange={(e) => update("ai_enabled", e.target.checked)}
            />
            <span>
              <span className="text-sm font-medium">Enable AI resonance scoring</span>
              <p className="text-xs text-muted-foreground">
                Blend a semantic “resonance” read of each mentor’s reflection into the
                score. Requires an LLM key to be configured on the server — until then
                this has no effect and matching stays fully deterministic.
              </p>
            </span>
          </label>

          <div className="space-y-1">
            <label className="text-sm font-medium">AI blend weight (0–100)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={settings.ai_weight}
              onChange={(e) => update("ai_weight", Number(e.target.value))}
              disabled={!settings.ai_enabled}
            />
            <p className="text-xs text-muted-foreground">
              How much the AI score counts vs. the deterministic score. 0 = ignore AI,
              100 = AI only. Applied only to the top mentor suggestions.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="mt-2">
            {saving ? "Saving…" : "Save weighting"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
