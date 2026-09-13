import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClientPortalView from './ClientPortalView'
import type { Project, ProgressUpdate, File as FileType, Message } from '@/lib/types'

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Find project by token
  const { data: projectLink } = await supabase
    .from('project_links')
    .select('*, projects(*)')
    .eq('token_hash', token)
    .is('revoked_at', null)
    .single()

  if (!projectLink || !projectLink.projects) {
    notFound()
  }

  // Check if link is expired
  if (projectLink.expires_at && new Date(projectLink.expires_at) < new Date()) {
    notFound()
  }

  const project = projectLink.projects as unknown as Project

  // Update last accessed time
  await supabase
    .from('project_links')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', projectLink.id)

  // Get visible progress updates
  const { data: progressUpdates } = await supabase
    .from('progress_updates')
    .select('*')
    .eq('project_id', project.id)
    .eq('visible_to_client', true)
    .order('created_at', { ascending: false }) as { data: ProgressUpdate[] | null }

  // Get files
  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false }) as { data: FileType[] | null }

  // Get messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true }) as { data: Message[] | null }

  return (
    <ClientPortalView
      project={project}
      token={token}
      initialProgressUpdates={progressUpdates || []}
      initialFiles={files || []}
      initialMessages={messages || []}
    />
  )
}
