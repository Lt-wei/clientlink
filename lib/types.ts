export type Plan = 'free' | 'pro'

export type ProjectStatus = '草稿筹备' | '进行中' | '等待客户' | '待确认' | '已完成' | '已归档'

export type UserRole = 'owner' | 'client'

export interface Profile {
  id: string
  display_name: string
  plan: Plan
  plan_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  owner_id: string
  name: string
  client_name: string
  client_email: string | null
  status: ProjectStatus
  is_archived: boolean
  brand_color: string
  created_at: string
  updated_at: string
}

export interface ProjectLink {
  id: string
  project_id: string
  token_hash: string
  expires_at: string | null
  revoked_at: string | null
  last_accessed_at: string | null
  created_at: string
}

export interface ProgressUpdate {
  id: string
  project_id: string
  title: string
  body: string | null
  visible_to_client: boolean
  created_by: string
  created_at: string
}

export interface File {
  id: string
  project_id: string
  storage_path: string
  file_name: string
  file_size: number
  uploaded_by_role: UserRole
  uploaded_by_id: string | null
  created_at: string
}

export interface Message {
  id: string
  project_id: string
  author_role: UserRole
  author_id: string | null
  body: string
  created_at: string
}

export interface Subscription {
  id: string
  owner_id: string
  provider: string | null
  provider_customer_id: string | null
  provider_sub_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  current_period_end: string | null
  created_at: string
  updated_at: string
}
