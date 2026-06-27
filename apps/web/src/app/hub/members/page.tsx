"use client";

import { useState } from "react";
import { MemberDirectory } from "@/src/components/shared/member-directory";

const mockMembers = [
  {
    id: "1",
    fullName: "Alex Rivera",
    role: "innovator" as const,
    headline: "Building GreenGrid AI - AI-powered energy optimization",
    sectors: ["CleanTech", "AI/ML"],
    skills: ["Python", "Machine Learning", "Product Management"],
  },
  {
    id: "2",
    fullName: "Sarah Chen",
    role: "innovator" as const,
    headline: "Founder of HealthBridge - Telemedicine for rural areas",
    sectors: ["HealthTech"],
    skills: ["Healthcare", "Business Development", "UX Design"],
  },
  {
    id: "3",
    fullName: "Mike Johnson",
    role: "mentor" as const,
    headline: "20 years in SaaS | Helping founders scale",
    sectors: ["SaaS", "AI/ML"],
    skills: ["Fundraising", "Product Strategy", "Leadership"],
  },
  {
    id: "4",
    fullName: "Emily Davis",
    role: "investor" as const,
    headline: "Angel investor focused on climate tech",
    sectors: ["CleanTech"],
    skills: ["Venture Capital", "Impact Investing", "Due Diligence"],
  },
  {
    id: "5",
    fullName: "James Wilson",
    role: "innovator" as const,
    headline: "Founder of EduFuture - Personalized learning",
    sectors: ["EdTech", "AI/ML"],
    skills: ["Education", "AI", "Full Stack Development"],
  },
  {
    id: "6",
    fullName: "Lisa Thompson",
    role: "mentor" as const,
    headline: "Former CTO mentoring next-gen founders",
    sectors: ["FinTech", "SaaS"],
    skills: ["Engineering", "Team Building", "Technical Strategy"],
  },
];

export default function MembersPage() {
  const [members] = useState(mockMembers);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Member Directory</h1>
      <MemberDirectory members={members} />
    </div>
  );
}
