import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1).max(255),
  role: z.enum(['innovator', 'mentor', 'investor']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectCreateSchema = z.object({
  title: z.string().min(1).max(255),
  tagline: z.string().max(255).optional(),
  description: z.string().min(10),
  sector: z.array(z.enum(['wellness', 'education', 'housing', 'elder_care', 'climate_adaptation', 'mental_health'])).min(1),
  stage: z.enum(['idea', 'validation', 'early', 'growth']),
  funding_goal: z.number().positive().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const milestoneCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  due_date: z.string().optional(),
  funding_allocated: z.number().positive().optional(),
});

export const postCreateSchema = z.object({
  content: z.string().min(1),
  media_urls: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'members_only', 'project_only']).default('members_only'),
});

export const groupCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private']).default('public'),
});

export const resourceCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.enum(['article', 'video', 'course', 'template', 'case_study']),
  content_url: z.string().url(),
  sector_tags: z.array(z.enum(['wellness', 'education', 'housing', 'elder_care', 'climate_adaptation', 'mental_health'])).optional(),
  visibility: z.enum(['public', 'members_only']).default('members_only'),
});

export const messageCreateSchema = z.object({
  content: z.string().min(1).max(10000),
  recipient_id: z.string().uuid().optional(),
});

export const investmentCreateSchema = z.object({
  project_id: z.string().uuid(),
  amount: z.number().positive(),
  notes: z.string().optional(),
});
