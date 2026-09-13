import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectDetailClient from './ProjectDetailClient'
import type { Project, ProjectLink, ProgressUpdate, File as FileType, Message } from '@/lib/types'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single() as { data: Project | null, error: any }

  if (error || !project) {
    notFound()
  }

  // Get project link
  const { data: projectLink } = await supabase
    .from('project_links')
    .select('*')
    .eq('project_id', id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: ProjectLink | null }

  // Get progress updates
  const { data: progressUpdates } = await supabase
    .from('progress_updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false }) as { data: ProgressUpdate[] | null }

  // Get files
  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false }) as { data: FileType[] | null }

  // Get messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true }) as { data: Message[] | null }

  return (
    <ProjectDetailClient
      project={project}
      projectLink={projectLink}
      initialProgressUpdates={progressUpdates || []}
      initialFiles={files || []}
      initialMessages={messages || []}
    />
  )
}
