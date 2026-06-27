export type UserRole = 'innovator' | 'mentor' | 'investor' | 'admin';
export type MembershipTier = 'free' | 'basic' | 'premium';
export type ProjectStatus = 'draft' | 'submitted' | 'reviewing' | 'matched' | 'active' | 'completed' | 'archived';
export type ProjectStage = 'idea' | 'validation' | 'early' | 'growth';
export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'active' | 'completed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type InvestmentStatus = 'committed' | 'disbursed' | 'refunded';
export type Visibility = 'public' | 'members_only' | 'project_only';
export type ResourceType = 'article' | 'video' | 'course' | 'template' | 'case_study';
export type Sector = 'wellness' | 'education' | 'housing' | 'elder_care' | 'climate_adaptation' | 'mental_health';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  skills: string[];
  sectors_of_interest: Sector[];
  onboarding_completed: boolean;
  membership_tier: MembershipTier;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role_specific_data: Record<string, unknown>;
  video_submission_url?: string;
  onboarding_responses: Record<string, unknown>;
}

export interface Project {
  id: string;
  innovator_id: string;
  title: string;
  tagline?: string;
  description: string;
  sector: Sector[];
  stage: ProjectStage;
  funding_goal?: number;
  funding_raised: number;
  status: ProjectStatus;
  video_pitch_url?: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  project_id: string;
  mentor_id?: string;
  investor_id?: string;
  status: MatchStatus;
  matched_by: 'algorithm' | 'admin' | 'self';
  matched_at?: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: MilestoneStatus;
  funding_allocated?: number;
  completed_at?: string;
}

export interface Investment {
  id: string;
  project_id: string;
  investor_id: string;
  amount: number;
  status: InvestmentStatus;
  notes?: string;
  committed_at: string;
  disbursed_at?: string;
}

export interface Post {
  id: string;
  author_id: string;
  author?: User;
  content: string;
  media_urls: string[];
  visibility: Visibility;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  visibility: 'public' | 'private';
  member_count: number;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  project_id?: string;
  content: string;
  read_at?: string;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  content_url: string;
  sector_tags: Sector[];
  author_id?: string;
  visibility: 'public' | 'members_only';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
