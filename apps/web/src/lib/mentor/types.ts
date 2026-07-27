export type MentorType = "psych" | "prof" | "coach";

export const MENTOR_TYPES: { value: MentorType; label: string; description: string }[] = [
  {
    value: "psych",
    label: "Psychological Mentor",
    description:
      "You guide others through inner transformation, helping them navigate mindset shifts, emotional resilience, and personal growth.",
  },
  {
    value: "prof",
    label: "Professional Mentor",
    description:
      "You support career and professional development, sharing expertise in strategy, execution, and industry knowledge.",
  },
  {
    value: "coach",
    label: "Coach",
    description:
      "You focus on skill-building and actionable growth, helping others develop capabilities through structured guidance.",
  },
];

export const MENTOR_GUIDED_QUESTIONS: Record<MentorType, string[]> = {
  psych: [
    "What draws you to supporting others in their inner transformation?",
    "How do you help someone navigate uncertainty or resistance?",
    "What practices or frameworks do you use to foster emotional resilience?",
  ],
  prof: [
    "What is your core philosophy when mentoring someone professionally?",
    "How do you approach helping someone identify their career path?",
    "What is one key lesson you share with every mentee?",
  ],
  coach: [
    "How do you structure your coaching sessions?",
    "What methods do you use to track a mentee's progress?",
    "How do you adapt your coaching style to different learning needs?",
  ],
};

export const MENTOR_VIDEO_QUESTIONS: Record<MentorType, string[]> = {
  psych: [
    "What does psychological mentorship mean to you?",
    "Share a story of guiding someone through a breakthrough.",
    "What inner quality do you most help others cultivate?",
  ],
  prof: [
    "What professional achievement are you most proud of guiding?",
    "How do you approach mentoring someone at a crossroads?",
    "What is the most important professional lesson you share?",
  ],
  coach: [
    "What coaching philosophy guides your practice?",
    "Describe a time your coaching made a lasting impact.",
    "What skill do you most enjoy helping others build?",
  ],
};

const MENTOR_TYPE_LABELS: Record<MentorType, string> = {
  psych: "Psychological Mentor",
  prof: "Professional Mentor",
  coach: "Coach",
};

export function getMentorTypeLabel(type: MentorType): string {
  return MENTOR_TYPE_LABELS[type] || type;
}
