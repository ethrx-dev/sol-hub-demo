export type MentorType = "psychologist" | "professor" | "coach";

export const MENTOR_TYPES: { value: MentorType; label: string; description: string }[] = [
  {
    value: "psychologist",
    label: "Psychologist",
    description: "Help innovators navigate mindset, purpose, and emotional resilience",
  },
  {
    value: "professor",
    label: "Professor",
    description: "Provide structured frameworks, research-backed guidance, and academic rigor",
  },
  {
    value: "coach",
    label: "Coach",
    description: "Drive accountability, execution, and practical skill-building",
  },
];

export const MENTOR_TYPE_QUESTIONS: Record<MentorType, string[]> = {
  psychologist: [
    "What emotional patterns do you notice holding innovators back?",
    "How do you help someone reconnect with their core purpose?",
    "What practices do you use to build psychological safety in relationships?",
    "How do you work with fear of failure or imposter syndrome?",
    "Describe a time you helped someone through a major identity shift",
    "What boundaries do you maintain in deep mentoring relationships?",
    "How do you measure progress in inner work?",
    "What's your approach when an innovator's values conflict with their strategy?",
    "How do you sustain your own wellbeing while holding space for others?",
  ],
  professor: [
    "What frameworks or models do you rely on most for early-stage ventures?",
    "How do you structure a research-backed validation process?",
    "What academic principles translate best to real-world innovation?",
    "Describe how you teach systems thinking to first-time founders",
    "What metrics do you track to assess venture viability?",
    "How do you balance theoretical rigor with startup speed?",
    "What's your approach to curriculum design for mentor-led learning?",
    "How do you evaluate whether a problem is worth solving?",
    "What literatures or disciplines most inform your mentoring?",
  ],
  coach: [
    "What accountability structures work best for your clients?",
    "How do you break down a 90-day plan into weekly actions?",
    "Describe your approach when someone consistently misses commitments",
    "What tools or templates do you provide for execution tracking?",
    "How do you handle scope creep or shiny object syndrome?",
    "What's your process for skill-gap identification and closure?",
    "How do you measure and celebrate incremental wins?",
    "Describe a coaching engagement that transformed someone's trajectory",
    "How do you maintain momentum through the messy middle?",
  ],
};

export const VIDEO_QUESTIONS: Record<MentorType, string[]> = {
  psychologist: [
    "What emotional patterns do you see holding innovators back?",
    "How do you create psychological safety in mentoring relationships?",
    "What's your approach when someone's values conflict with their strategy?",
  ],
  professor: [
    "What frameworks do you use to validate early-stage ventures?",
    "How do you teach systems thinking to first-time innovators?",
    "What metrics matter most for assessing venture viability?",
  ],
  coach: [
    "What accountability structures drive consistent execution?",
    "How do you handle scope creep and maintain focus?",
    "What's your process for identifying and closing skill gaps?",
  ],
};

export function getMentorTypeLabel(type: MentorType): string {
  return MENTOR_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getMentorTypeDescription(type: MentorType): string {
  return MENTOR_TYPES.find((t) => t.value === type)?.description ?? "";
}