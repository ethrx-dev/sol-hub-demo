"use client";

import { create } from "zustand";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  section: string;
  icon?: string;
  highlight?: string;
}

const STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to SOL Hub",
    description:
      "SOL Hub is a community-powered incubation platform where innovators, mentors, and conscious investors come together to nurture dreams into successful businesses.",
    section: "Platform Overview",
    icon: "/sol-icon.svg",
  },
  {
    id: "three-pillars",
    title: "The Three Pillars",
    description:
      "SOL serves three core roles. Innovators submit ideas and build ventures. Mentors share expertise and guide founders. Conscious Investors fund vetted projects that align with their values.",
    section: "Platform Overview",
  },
  {
    id: "signup",
    title: "Creating Your Account",
    description:
      "Click 'Get Started' to begin. You'll review and accept the Private Membership Agreement, then fill in your name, email, and password. Choose your role: Innovator, Mentor, or Conscious Investor.",
    section: "Getting Started",
  },
  {
    id: "onboarding",
    title: "Complete Onboarding",
    description:
      "After signup, a 5-step wizard guides you through: a welcome overview, your role details, a 90-second intro video recording, profile completion with role-specific fields, and final links to key areas of the platform.",
    section: "Getting Started",
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description:
      "Each role has a tailored dashboard. Innovators manage projects and track milestones. Mentors browse projects and manage matches. Investors review opportunities and track their portfolio. Admins have full oversight.",
    section: "Using the Platform",
  },
  {
    id: "projects",
    title: "Projects & Matching",
    description:
      "Innovators submit project proposals with a 4-step wizard. The platform matches them with relevant mentors and investors. Track progress with milestone-based funding and timeline management.",
    section: "Using the Platform",
  },
  {
    id: "community",
    title: "Community Hub",
    description:
      "The Hub brings everyone together. Post updates in the feed, join groups around specific topics, participate in forums, attend events, share photos in galleries, and collaborate in shared workspaces.",
    section: "Using the Platform",
  },
  {
    id: "resources",
    title: "Resources & Learning",
    description:
      "Access a growing library of documents, templates, and guides. Read blog posts from the community, explore categorized resources, and download materials to support your journey.",
    section: "Using the Platform",
  },
  {
    id: "complete",
    title: "You're Ready to Go!",
    description:
      "You now have a full picture of SOL Hub. Start by exploring the Hub, visiting your dashboard, or browsing resources. The tour is always available from the navigation bar if you need a refresher.",
    section: "Next Steps",
  },
];

interface TourStore {
  isOpen: boolean;
  currentStep: number;
  steps: TourStep[];
  open: () => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export const useTourStore = create<TourStore>((set, get) => ({
  isOpen: false,
  currentStep: 0,
  steps: STEPS,
  open: () => set({ isOpen: true, currentStep: 0 }),
  close: () => set({ isOpen: false, currentStep: 0 }),
  next: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  prev: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  goTo: (index: number) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStep: index });
    }
  },
}));
