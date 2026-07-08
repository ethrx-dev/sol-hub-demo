"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/src/lib/api-client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { toast } from "sonner";
import {
  Save,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  FileCode,
  Image,
  Type,
  LayoutGrid,
  BarChart3,
  MousePointerClick,
  ArrowLeft,
  History,
  Monitor,
  Undo2,
  ChevronUp,
  ChevronDown,
  Layers,
  Quote,
  Club,
  Flag,
  ListChecks,
  ArrowRightFromLine,
  GraduationCap,
  Handshake,
} from "lucide-react";

interface Section {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  status: string;
  layout: string;
  sections: Section[];
  seo: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero", icon: Eye },
  { value: "hero_slideshow", label: "Slideshow Hero", icon: Layers },
  { value: "tagline", label: "Tagline", icon: Type },
  { value: "pillar_cards", label: "Pillar Cards", icon: LayoutGrid },
  { value: "overlay_card", label: "Overlay Card", icon: Club },
  { value: "mission", label: "Mission", icon: Flag },
  { value: "quote", label: "Quote", icon: Quote },
  { value: "process_steps", label: "Process Steps", icon: ListChecks },
  { value: "cta_banner", label: "CTA Banner", icon: ArrowRightFromLine },
  { value: "tools_resources", label: "Tools & Resources", icon: ListChecks },
  { value: "feature_cards", label: "Feature Cards", icon: LayoutGrid },
  { value: "mentors", label: "Mentors", icon: GraduationCap },
  { value: "investors", label: "Investors", icon: Handshake },
  { value: "benefit_cards", label: "Benefit Cards", icon: LayoutGrid },
  { value: "text", label: "Text", icon: Type },
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "image", label: "Image", icon: Image },
  { value: "gallery", label: "Gallery", icon: Image },
  { value: "stats", label: "Stats", icon: BarChart3 },
  { value: "cta", label: "CTA", icon: MousePointerClick },
  { value: "html", label: "HTML", icon: FileCode },
  { value: "columns", label: "Columns", icon: LayoutGrid },
];

const defaultSectionData: Record<string, Record<string, unknown>> = {
  hero: { eyebrow: "", heading: "New Section", subtext: "", background_image: "" },
  hero_slideshow: {
    slides: [],
    heading_primary: "Spaces of Learning",
    heading_secondary: "Nurture your dream into a successful business",
    description: "SOL's helpful mentors, conscious investors and private business portal brings success for a better Earth.",
  },
  tagline: {
    heading_primary: "Become a Spiritual Entrepreneur for Freedom",
    heading_secondary: "Work For yourSelf * Have more income",
  },
  pillar_cards: {
    cards: [
      { title: "Innovators", description: "We help innovators refine, fund, and ground their projects.", link_text: "Build your idea", link_url: "/innovators", icon: "rocket", is_accent: false },
      { title: "Mentors", description: "We connect mentors, land stewards, and conscious investors to support projects.", link_text: "Help Others", link_url: "/mentors", icon: "graduation_cap", is_accent: true },
      { title: "Conscious Investors", description: "Conscious Investors provide capital, resources, and bring ideas to life.", link_text: "Support Ideas", link_url: "/investors", icon: "handshake", is_accent: false },
    ],
  },
  overlay_card: {
    background_image: "",
    overlay_color: "accent",
    heading: "SOL HUB",
    description: "Join our private portal and be paired with the right people.",
    checklist: ["See Projects", "Be paired with projects", "Connect with users"],
    link_text: "Join Now",
    link_url: "/what-we-do",
  },
  mission: {
    badge_text: "OUR MISSION",
    badge_link: "/blog",
    headings: ["A hub for Innovation to Solution", "Any age, any person can start a business becoming the architect of your life"],
    paragraphs: [
      "At SOL, our mission is to offer a nurturing, private space where ideas come to life, at any age.",
      "The New Earth needs fresh ideas, and SOL is here to deliver them in a whole new way: the SOL way.",
    ],
    image: "",
    button_text: "About Us",
    button_link: "/about",
  },
  quote: {
    background_image: "",
    quote_text: "If you can dream it, you can achieve it.",
    secondary_text: "Think Globally, Act Locally & Connect Everywhere",
  },
  process_steps: {
    badge_text: "How it works?",
    badge_link: "/blog",
    heading: "Collaboration Over Competition",
    subtext: "The future thrives on collaboration and cooperation, not competition.",
    variant: "icons",
    steps: [
      { title: "Submit an Idea", description: "Innovators pitch through our guided proposal portal.", icon: "file_text" },
      { title: "Get Matched", description: "Mentors and investors join based on interest and expertise.", icon: "users" },
      { title: "Co-Create", description: "Projects receive funding, mentorship, and community support.", icon: "pen" },
    ],
    button_text: "Get Started Now!",
    button_link: "/what-we-do",
  },
  cta_banner: {
    background_image: "",
    heading_primary: "SPACES OF LEARNING",
    heading_secondary: "Join SOL Today",
    description: "Be a part of the movement to create the New Earth.",
    buttons: [
      { label: "Become a Member", link: "/become-a-member", style: "solid" },
      { label: "Members Portal", link: "https://portal.spacesoflearning.com", style: "outline" },
    ],
  },
  tools_resources: {
    heading: "Tools, resources, and connections to help you launch transformative ideas",
    paragraphs: [
      "At Spaces of Learning (SOL), we are building the foundation for a New Earth through AdVenture Capitalism\u2014a heart-centered approach to entrepreneurship.",
      "There are big gaps with unmet needs that mean opportunity for business creation in",
    ],
    tags: ["wellness", "education", "housing", "elder care", "climate adaptation", "mental health"],
    image: "",
  },
  feature_cards: {
    cards: [
      { icon: "clipboard", title: "Plan Ahead", description: "We help you turn your vision into a structured, actionable plan." },
      { icon: "users", title: "Start-Up Mentor", description: "Every innovator is paired with a mentor who aligns with their vision." },
      { icon: "dollar", title: "Financial Support", description: "SOL connects you with heart-centered investors who believe in your mission." },
      { icon: "shield", title: "Future Proof", description: "We focus on sustainability and long-term impact." },
    ],
  },
  mentors: {
    background_image: "",
    badge: "Business & SOL Guidance",
    title: "Mentors with a purpose",
    subtext: "The Guide, Teacher, or Muse that will propel your idea!",
    description: "Mentors share wisdom, frameworks, and practical experience with innovators and builders.",
    description_2: "They act as stabilizing anchors in the ecosystem, bridging knowledge and embodiment.",
    checklist: ["Access to aligned mentees and co-creators", "Invitation to workshops and think tanks", "The chance to co-author regenerative case studies"],
    footnote: "Submit your video today and tell us about what skills you have to share.",
    button_text: "Learn More",
    button_link: "/register",
    image: "",
  },
  investors: {
    badge: "Invest in ideas",
    title: "The Conscious Investor",
    paragraphs: [
      "Turn dreams into reality by providing the support, resources, and guidance needed to bring visionary ideas to life.",
    ],
    footnote: "Share your story with us and we will build trust with the right process.",
    button_text: "Learn More",
    button_link: "/register",
  },
  benefit_cards: {
    cards: [
      { title: "Find a Project", description: "Discover purpose-driven projects that align with your values.", is_accent: false },
      { title: "Support with Love", description: "Invest in more than just financial returns\u2014invest in regenerative change.", is_accent: true },
      { title: "Protected Ecosystem", description: "Join a trusted network designed to foster transparency, collaboration, and long-term success.", is_accent: false },
    ],
  },
  text: { heading: "", body: "" },
  cards: { heading: "", cards: [{ title: "Card", description: "", image: "" }] },
  image: { src: "", alt: "", caption: "" },
  gallery: { heading: "", images: [] },
  stats: { heading: "", stats: [{ label: "", value: "" }] },
  cta: { heading: "", subheading: "", button_label: "Get Started", button_link: "/register" },
  html: { html: "<div>Your HTML here</div>" },
  columns: { heading: "", columns: 2, left: "", right: "" },
};

function SectionEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const data = section.data;
  const set = (key: string, value: unknown) => onChange({ ...data, [key]: value });

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Eyebrow (accent tag)</label>
            <Input value={(data.eyebrow as string) || ""} onChange={(e) => set("eyebrow", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subtext</label>
            <Textarea value={(data.subtext as string) || ""} onChange={(e) => set("subtext", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Background Image URL</label>
            <Input value={(data.background_image as string) || ""} onChange={(e) => set("background_image", e.target.value)} />
          </div>
        </div>
      );

    case "hero_slideshow":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Primary Heading</label>
            <Input value={(data.heading_primary as string) || ""} onChange={(e) => set("heading_primary", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Secondary Heading</label>
            <Input value={(data.heading_secondary as string) || ""} onChange={(e) => set("heading_secondary", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Slideshow Images</label>
            {(data.slides as string[] | undefined)?.map((url, i) => (
              <div key={i} className="flex gap-2 items-end mt-2">
                <div className="flex-1">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const slides = [...((data.slides as string[]) || [])];
                      slides[i] = e.target.value;
                      set("slides", slides);
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-destructive"
                  onClick={() => {
                    const slides = [...((data.slides as string[]) || [])];
                    slides.splice(i, 1);
                    set("slides", slides);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => set("slides", [...((data.slides as string[]) || []), ""])}
            >
              <Plus className="mr-1 h-3 w-3" /> Add Slide Image
            </Button>
          </div>
        </div>
      );

    case "tagline":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Icon URL</label>
            <Input value={(data.icon as string) || ""} onChange={(e) => set("icon", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Primary Heading</label>
            <Input value={(data.heading_primary as string) || ""} onChange={(e) => set("heading_primary", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Secondary Heading</label>
            <Input value={(data.heading_secondary as string) || ""} onChange={(e) => set("heading_secondary", e.target.value)} />
          </div>
        </div>
      );

    case "pillar_cards":
      return (
        <div className="space-y-3">
          {(data.cards as Array<Record<string, unknown>> | undefined)?.map((card, i) => (
            <Card key={i}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Card {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => {
                      const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                      cards.splice(i, 1);
                      set("cards", cards);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Title"
                  value={(card.title as string) || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                    cards[i] = { ...cards[i], title: e.target.value };
                    set("cards", cards);
                  }}
                />
                <Input
                  placeholder="Description"
                  value={(card.description as string) || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                    cards[i] = { ...cards[i], description: e.target.value };
                    set("cards", cards);
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Link Text"
                    className="flex-1"
                    value={(card.link_text as string) || ""}
                    onChange={(e) => {
                      const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                      cards[i] = { ...cards[i], link_text: e.target.value };
                      set("cards", cards);
                    }}
                  />
                  <Input
                    placeholder="Link URL"
                    className="flex-1"
                    value={(card.link_url as string) || ""}
                    onChange={(e) => {
                      const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                      cards[i] = { ...cards[i], link_url: e.target.value };
                      set("cards", cards);
                    }}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Icon</label>
                    <Select
                      value={(card.icon as string) || "rocket"}
                      onValueChange={(v) => {
                        const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                        cards[i] = { ...cards[i], icon: v };
                        set("cards", cards);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rocket">Rocket</SelectItem>
                        <SelectItem value="handshake">Handshake</SelectItem>
                        <SelectItem value="graduation_cap">Graduation Cap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <label className="text-xs text-muted-foreground">Accent BG</label>
                    <input
                      type="checkbox"
                      checked={(card.is_accent as boolean) || false}
                      onChange={(e) => {
                        const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                        cards[i] = { ...cards[i], is_accent: e.target.checked };
                        set("cards", cards);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set("cards", [
                ...((data.cards as Array<Record<string, unknown>>) || []),
                { title: "New Card", description: "", link_text: "Learn More", link_url: "/", icon: "rocket", is_accent: false },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Add Card
          </Button>
        </div>
      );

    case "overlay_card":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Background Image URL</label>
            <Input value={(data.background_image as string) || ""} onChange={(e) => set("background_image", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Overlay Color</label>
            <Select
              value={(data.overlay_color as string) || "accent"}
              onValueChange={(v) => set("overlay_color", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accent">Accent (Tan)</SelectItem>
                <SelectItem value="primary">Primary (Green)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Checklist Items</label>
            {(data.checklist as string[] | undefined)?.map((item, i) => (
              <div key={i} className="flex gap-2 items-end mt-2">
                <div className="flex-1">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const list = [...((data.checklist as string[]) || [])];
                      list[i] = e.target.value;
                      set("checklist", list);
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-destructive"
                  onClick={() => {
                    const list = [...((data.checklist as string[]) || [])];
                    list.splice(i, 1);
                    set("checklist", list);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => set("checklist", [...((data.checklist as string[]) || []), ""])}
            >
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Link Text</label>
              <Input value={(data.link_text as string) || ""} onChange={(e) => set("link_text", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Link URL</label>
              <Input value={(data.link_url as string) || ""} onChange={(e) => set("link_url", e.target.value)} />
            </div>
          </div>
        </div>
      );

    case "mission":
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Badge Text</label>
              <Input value={(data.badge_text as string) || ""} onChange={(e) => set("badge_text", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Badge Link</label>
              <Input value={(data.badge_link as string) || ""} onChange={(e) => set("badge_link", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Headings (one per line)</label>
            <Textarea
              value={((data.headings as string[]) || []).join("\n")}
              onChange={(e) => set("headings", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Paragraphs (one per line)</label>
            <Textarea
              className="min-h-[80px]"
              value={((data.paragraphs as string[]) || []).join("\n")}
              onChange={(e) => set("paragraphs", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Image URL</label>
            <Input value={(data.image as string) || ""} onChange={(e) => set("image", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Text</label>
              <Input value={(data.button_text as string) || ""} onChange={(e) => set("button_text", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Link</label>
              <Input value={(data.button_link as string) || ""} onChange={(e) => set("button_link", e.target.value)} />
            </div>
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Background Image URL</label>
            <Input value={(data.background_image as string) || ""} onChange={(e) => set("background_image", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Quote Text</label>
            <Textarea value={(data.quote_text as string) || ""} onChange={(e) => set("quote_text", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Secondary Text</label>
            <Input value={(data.secondary_text as string) || ""} onChange={(e) => set("secondary_text", e.target.value)} />
          </div>
        </div>
      );

    case "process_steps":
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Badge Text</label>
              <Input value={(data.badge_text as string) || ""} onChange={(e) => set("badge_text", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Badge Link</label>
              <Input value={(data.badge_link as string) || ""} onChange={(e) => set("badge_link", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Variant</label>
            <Select
              value={(data.variant as string) || "icons"}
              onValueChange={(v) => set("variant", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icons">Icons</SelectItem>
                <SelectItem value="numbers">Numbers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subtext</label>
            <Textarea value={(data.subtext as string) || ""} onChange={(e) => set("subtext", e.target.value)} />
          </div>
          {(data.steps as Array<Record<string, unknown>> | undefined)?.map((step, i) => (
            <Card key={i}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Step {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => {
                      const steps = [...((data.steps as Array<Record<string, unknown>>) || [])];
                      steps.splice(i, 1);
                      set("steps", steps);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Title"
                  value={(step.title as string) || ""}
                  onChange={(e) => {
                    const steps = [...((data.steps as Array<Record<string, unknown>>) || [])];
                    steps[i] = { ...steps[i], title: e.target.value };
                    set("steps", steps);
                  }}
                />
                <Input
                  placeholder="Description"
                  value={(step.description as string) || ""}
                  onChange={(e) => {
                    const steps = [...((data.steps as Array<Record<string, unknown>>) || [])];
                    steps[i] = { ...steps[i], description: e.target.value };
                    set("steps", steps);
                  }}
                />
                <div>
                  <label className="text-xs text-muted-foreground">Icon</label>
                  <Select
                    value={(step.icon as string) || "file_text"}
                    onValueChange={(v) => {
                      const steps = [...((data.steps as Array<Record<string, unknown>>) || [])];
                      steps[i] = { ...steps[i], icon: v };
                      set("steps", steps);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file_text">File Text</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="pen">Pen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set("steps", [
                ...((data.steps as Array<Record<string, unknown>>) || []),
                { title: "New Step", description: "", icon: "file_text" },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Add Step
          </Button>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Text</label>
              <Input value={(data.button_text as string) || ""} onChange={(e) => set("button_text", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Link</label>
              <Input value={(data.button_link as string) || ""} onChange={(e) => set("button_link", e.target.value)} />
            </div>
          </div>
        </div>
      );

    case "cta_banner":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Background Image URL</label>
            <Input value={(data.background_image as string) || ""} onChange={(e) => set("background_image", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Primary Heading</label>
            <Input value={(data.heading_primary as string) || ""} onChange={(e) => set("heading_primary", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Secondary Heading</label>
            <Input value={(data.heading_secondary as string) || ""} onChange={(e) => set("heading_secondary", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          {(data.buttons as Array<Record<string, string>> | undefined)?.map((btn, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Label</label>
                <Input
                  value={btn.label || ""}
                  onChange={(e) => {
                    const buttons = [...((data.buttons as Array<Record<string, string>>) || [])];
                    buttons[i] = { ...buttons[i], label: e.target.value };
                    set("buttons", buttons);
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Link</label>
                <Input
                  value={btn.link || ""}
                  onChange={(e) => {
                    const buttons = [...((data.buttons as Array<Record<string, string>>) || [])];
                    buttons[i] = { ...buttons[i], link: e.target.value };
                    set("buttons", buttons);
                  }}
                />
              </div>
              <div className="w-20">
                <label className="text-xs text-muted-foreground">Style</label>
                <Select
                  value={btn.style || "solid"}
                  onValueChange={(v) => {
                    const buttons = [...((data.buttons as Array<Record<string, string>>) || [])];
                    buttons[i] = { ...buttons[i], style: v };
                    set("buttons", buttons);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-destructive"
                onClick={() => {
                  const buttons = [...((data.buttons as Array<Record<string, string>>) || [])];
                  buttons.splice(i, 1);
                  set("buttons", buttons);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set("buttons", [
                ...((data.buttons as Array<Record<string, string>>) || []),
                { label: "New Button", link: "/", style: "solid" },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Add Button
          </Button>
        </div>
      );

    case "text":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Body (HTML)</label>
            <Textarea
              className="font-mono text-xs min-h-[150px]"
              value={(data.body as string) || ""}
              onChange={(e) => set("body", e.target.value)}
            />
          </div>
        </div>
      );

    case "cards":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Section Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          {(data.cards as Array<Record<string, string>> | undefined)?.map((card, i) => (
            <Card key={i}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Card {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => {
                      const cards = [...((data.cards as Array<Record<string, string>>) || [])];
                      cards.splice(i, 1);
                      set("cards", cards);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Title"
                  value={card.title || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, string>>) || [])];
                    cards[i] = { ...cards[i], title: e.target.value };
                    set("cards", cards);
                  }}
                />
                <Input
                  placeholder="Description"
                  value={card.description || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, string>>) || [])];
                    cards[i] = { ...cards[i], description: e.target.value };
                    set("cards", cards);
                  }}
                />
                <Input
                  placeholder="Image URL"
                  value={card.image || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, string>>) || [])];
                    cards[i] = { ...cards[i], image: e.target.value };
                    set("cards", cards);
                  }}
                />
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set("cards", [
                ...((data.cards as Array<Record<string, string>>) || []),
                { title: "New Card", description: "", image: "" },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Add Card
          </Button>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Image URL</label>
            <Input value={(data.src as string) || ""} onChange={(e) => set("src", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Alt Text</label>
            <Input value={(data.alt as string) || ""} onChange={(e) => set("alt", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Caption</label>
            <Input value={(data.caption as string) || ""} onChange={(e) => set("caption", e.target.value)} />
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subheading</label>
            <Input value={(data.subheading as string) || ""} onChange={(e) => set("subheading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Button Label</label>
            <Input value={(data.button_label as string) || ""} onChange={(e) => set("button_label", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Button Link</label>
            <Input value={(data.button_link as string) || ""} onChange={(e) => set("button_link", e.target.value)} />
          </div>
        </div>
      );

    case "html":
      return (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Custom HTML</label>
          <Textarea
            className="font-mono text-xs min-h-[200px]"
            value={(data.html as string) || ""}
            onChange={(e) => set("html", e.target.value)}
          />
        </div>
      );

    case "stats":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Section Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          {(data.stats as Array<Record<string, string>> | undefined)?.map((stat, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Label</label>
                <Input
                  value={stat.label || ""}
                  onChange={(e) => {
                    const stats = [...((data.stats as Array<Record<string, string>>) || [])];
                    stats[i] = { ...stats[i], label: e.target.value };
                    set("stats", stats);
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Value</label>
                <Input
                  value={stat.value || ""}
                  onChange={(e) => {
                    const stats = [...((data.stats as Array<Record<string, string>>) || [])];
                    stats[i] = { ...stats[i], value: e.target.value };
                    set("stats", stats);
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-destructive"
                onClick={() => {
                  const stats = [...((data.stats as Array<Record<string, string>>) || [])];
                  stats.splice(i, 1);
                  set("stats", stats);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set("stats", [
                ...((data.stats as Array<Record<string, string>>) || []),
                { label: "New Stat", value: "0" },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Add Stat
          </Button>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Layout</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={(data.layout as string) || "grid"}
              onChange={(e) => set("layout", e.target.value)}
            >
              <option value="grid">Grid</option>
              <option value="two-column">Two Column</option>
              <option value="single">Single</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Section Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          {(data.images as string[] | undefined)?.map((url, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                <Input
                  value={url}
                  onChange={(e) => {
                    const images = [...((data.images as string[]) || [])];
                    images[i] = e.target.value;
                    set("images", images);
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-destructive"
                onClick={() => {
                  const images = [...((data.images as string[]) || [])];
                  images.splice(i, 1);
                  set("images", images);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => set("images", [...((data.images as string[]) || []), ""])}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Image
          </Button>
        </div>
      );

    case "columns":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Columns</label>
            <Select
              value={String(data.columns || 2)}
              onValueChange={(v) => set("columns", parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Left Content (HTML)</label>
            <Textarea
              className="font-mono text-xs min-h-[100px]"
              value={(data.left as string) || ""}
              onChange={(e) => set("left", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Right Content (HTML)</label>
            <Textarea
              className="font-mono text-xs min-h-[100px]"
              value={(data.right as string) || ""}
              onChange={(e) => set("right", e.target.value)}
            />
          </div>
        </div>
      );

    case "tools_resources":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Heading</label>
            <Input value={(data.heading as string) || ""} onChange={(e) => set("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Paragraphs (one per line)</label>
            <Textarea
              className="min-h-[80px]"
              value={((data.paragraphs as string[]) || []).join("\n")}
              onChange={(e) => set("paragraphs", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
            <Input
              value={((data.tags as string[]) || []).join(", ")}
              onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Image URL</label>
            <Input value={(data.image as string) || ""} onChange={(e) => set("image", e.target.value)} />
          </div>
        </div>
      );

    case "feature_cards":
      return (
        <div className="space-y-3">
          {(data.cards as Array<Record<string, unknown>> | undefined)?.map((card, i) => (
            <Card key={i}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Card {i + 1}</span>
                  <Button
                    variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive"
                    onClick={() => {
                      const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                      cards.splice(i, 1);
                      set("cards", cards);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Title"
                  value={(card.title as string) || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                    cards[i] = { ...cards[i], title: e.target.value };
                    set("cards", cards);
                  }}
                />
                <Textarea
                  placeholder="Description"
                  value={(card.description as string) || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                    cards[i] = { ...cards[i], description: e.target.value };
                    set("cards", cards);
                  }}
                />
                <div>
                  <label className="text-xs text-muted-foreground">Icon</label>
                  <Select
                    value={(card.icon as string) || "clipboard"}
                    onValueChange={(v) => {
                      const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                      cards[i] = { ...cards[i], icon: v };
                      set("cards", cards);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clipboard">Clipboard</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="dollar">Dollar</SelectItem>
                      <SelectItem value="shield">Shield</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline" size="sm"
            onClick={() =>
              set("cards", [
                ...((data.cards as Array<Record<string, unknown>>) || []),
                { icon: "clipboard", title: "New Card", description: "" },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Add Card
          </Button>
        </div>
      );

    case "mentors":
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Background Image URL</label>
            <Input value={(data.background_image as string) || ""} onChange={(e) => set("background_image", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Badge</label>
              <Input value={(data.badge as string) || ""} onChange={(e) => set("badge", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input value={(data.title as string) || ""} onChange={(e) => set("title", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subtext</label>
            <Input value={(data.subtext as string) || ""} onChange={(e) => set("subtext", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={(data.description as string) || ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description (paragraph 2)</label>
            <Textarea value={(data.description_2 as string) || ""} onChange={(e) => set("description_2", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Checklist Items (one per line)</label>
            <Textarea
              value={((data.checklist as string[]) || []).join("\n")}
              onChange={(e) => set("checklist", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Footnote</label>
            <Input value={(data.footnote as string) || ""} onChange={(e) => set("footnote", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Text</label>
              <Input value={(data.button_text as string) || ""} onChange={(e) => set("button_text", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Link</label>
              <Input value={(data.button_link as string) || ""} onChange={(e) => set("button_link", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Image URL</label>
            <Input value={(data.image as string) || ""} onChange={(e) => set("image", e.target.value)} />
          </div>
        </div>
      );

    case "investors":
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Badge</label>
              <Input value={(data.badge as string) || ""} onChange={(e) => set("badge", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input value={(data.title as string) || ""} onChange={(e) => set("title", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Paragraphs (one per line)</label>
            <Textarea
              className="min-h-[80px]"
              value={((data.paragraphs as string[]) || []).join("\n")}
              onChange={(e) => set("paragraphs", e.target.value.split("\n").filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Footnote</label>
            <Input value={(data.footnote as string) || ""} onChange={(e) => set("footnote", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Text</label>
              <Input value={(data.button_text as string) || ""} onChange={(e) => set("button_text", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Button Link</label>
              <Input value={(data.button_link as string) || ""} onChange={(e) => set("button_link", e.target.value)} />
            </div>
          </div>
        </div>
      );

    case "benefit_cards":
      return (
        <div className="space-y-3">
          {(data.cards as Array<Record<string, unknown>> | undefined)?.map((card, i) => (
            <Card key={i}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Card {i + 1}</span>
                  <Button
                    variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive"
                    onClick={() => {
                      const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                      cards.splice(i, 1);
                      set("cards", cards);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Title"
                  value={(card.title as string) || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                    cards[i] = { ...cards[i], title: e.target.value };
                    set("cards", cards);
                  }}
                />
                <Textarea
                  placeholder="Description"
                  value={(card.description as string) || ""}
                  onChange={(e) => {
                    const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                    cards[i] = { ...cards[i], description: e.target.value };
                    set("cards", cards);
                  }}
                />
                <div className="flex items-center gap-2 pt-2">
                  <label className="text-xs text-muted-foreground">Accent BG</label>
                  <input
                    type="checkbox"
                    checked={(card.is_accent as boolean) || false}
                    onChange={(e) => {
                      const cards = [...((data.cards as Array<Record<string, unknown>>) || [])];
                      cards[i] = { ...cards[i], is_accent: e.target.checked };
                      set("cards", cards);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline" size="sm"
            onClick={() =>
              set("cards", [
                ...((data.cards as Array<Record<string, unknown>>) || []),
                { title: "New Card", description: "", is_accent: false },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Add Card
          </Button>
        </div>
      );

    default:
      return (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Data (JSON)</label>
          <Textarea
            className="font-mono text-xs min-h-[150px]"
            value={JSON.stringify(data, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                /* invalid json while typing */
              }
            }}
          />
        </div>
      );
  }
}

export default function AdminPageEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [sections, setSections] = useState<Section[]>([]);
  const [seoDescription, setSeoDescription] = useState("");
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<Array<{ id: string; created_at: string }>>([]);

  const fetchPage = useCallback(async () => {
    try {
      const data = await api.get<PageData>(`/admin/pages/${params.id}`);
      setPage(data);
      setTitle(data.title);
      setSlug(data.slug);
      setStatus(data.status);
      setSections(data.sections || []);
      setSeoDescription(((data.seo as Record<string, string>)?.description) || "");
    } catch {
      toast.error("Failed to load page");
      router.push("/admin/pages");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const fetchRevisions = useCallback(async () => {
    try {
      const data = await api.get<{ items: Array<{ id: string; created_at: string }> }>(
        `/admin/pages/${params.id}/revisions`
      );
      setRevisions(data.items);
    } catch {
      /* revisions unavailable for new pages */
    }
  }, [params.id]);

  useEffect(() => {
    if (!isNew) {
      fetchPage();
      fetchRevisions();
    } else {
      setLoading(false);
    }
  }, [fetchPage, fetchRevisions, isNew]);

  const addSection = (type: string) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      data: { ...(defaultSectionData[type] || {}) },
    };
    const updated = [...sections, newSection];
    setSections(updated);
    setActiveSectionIdx(updated.length - 1);
  };

  const updateSection = (idx: number, data: Record<string, unknown>) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], data };
    setSections(updated);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
    if (activeSectionIdx === idx) setActiveSectionIdx(null);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setSections(updated);
    setActiveSectionIdx(target);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title,
        slug,
        status,
        sections: sections.map((s) => ({ id: s.id, type: s.type, data: s.data })),
        seo: seoDescription ? { description: seoDescription } : null,
      };

      if (isNew) {
        const created = await api.post<PageData>("/admin/pages", body);
        toast.success("Page created");
        router.replace(`/admin/pages/${created.id}/edit`);
      } else {
        await api.put(`/admin/pages/${params.id}`, body);
        // Save a revision
        await api.post(`/admin/pages/${params.id}/revisions`);
        toast.success("Page saved");
        fetchRevisions();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const restoreRevision = async (revisionId: string) => {
    try {
      const restored = await api.post<PageData>(
        `/admin/pages/${params.id}/revisions/${revisionId}/restore`
      );
      setSections(restored.sections || []);
      toast.success("Revision restored");
      setShowRevisions(false);
    } catch {
      toast.error("Failed to restore revision");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 sticky top-0 bg-background z-10 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/pages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">
              {isNew ? "New Page" : `Edit: ${page?.title}`}
            </h1>
            <p className="text-xs text-muted-foreground">/{slug || "untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevisions(!showRevisions)}
            >
              <History className="mr-1 h-4 w-4" />
              Revisions
            </Button>
          )}
          <Link
            href={`/${slug}`}
            target="_blank"
            className="inline-flex items-center text-sm px-3 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            <Monitor className="mr-1 h-4 w-4" />
            View
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sections Sidebar */}
        <div className="w-72 shrink-0 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {sections.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No sections yet. Add one below.
                </p>
              )}
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                    activeSectionIdx === idx
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveSectionIdx(idx)}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}
                    </p>
                    <p className="text-muted-foreground truncate">
                      {String(section.data?.heading || section.data?.title || "") || "No heading"}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(idx, -1);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(idx, 1);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(idx);
                      }}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add Section */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Section</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-4">
                {SECTION_TYPES.map(({ value, label, icon: Icon }) => (
                  <DialogTrigger key={value} asChild onClick={() => addSection(value)}>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-1"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  </DialogTrigger>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 space-y-6">
          {/* Page Meta */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Slug</label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, "").toLowerCase())}
                    placeholder="page-slug"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  SEO Description
                </label>
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Section Editor */}
          {activeSectionIdx !== null && sections[activeSectionIdx] && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">
                  Edit:{" "}
                  {SECTION_TYPES.find((t) => t.value === sections[activeSectionIdx].type)?.label ||
                    sections[activeSectionIdx].type}
                </CardTitle>
                <Select
                  value={sections[activeSectionIdx].type}
                  onValueChange={(newType) => {
                    const updated = [...sections];
                    updated[activeSectionIdx] = {
                      ...updated[activeSectionIdx],
                      type: newType,
                      data: { ...(defaultSectionData[newType] || {}) },
                    };
                    setSections(updated);
                  }}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-4">
                <SectionEditor
                  section={sections[activeSectionIdx]}
                  onChange={(data) => updateSection(activeSectionIdx, data)}
                />
              </CardContent>
            </Card>
          )}

          {/* Revisions Panel */}
          {!isNew && showRevisions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Revisions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {revisions.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No revisions yet. Save the page to create one.
                  </p>
                ) : (
                  <div className="divide-y">
                    {revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {new Date(rev.created_at).toLocaleString()}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreRevision(rev.id)}
                        >
                          <Undo2 className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
