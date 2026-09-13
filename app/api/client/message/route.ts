import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { project_id, token, body } = await request.json()

    if (!project_id || !token || !body) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify token
    const { data: projectLink } = await supabase
      .from('project_links')
      .select('*')
      .eq('token_hash', token)
      .eq('project_id', project_id)
      .is('revoked_at', null)
      .single()

    if (!projectLink) {
      return NextResponse.json({ error: '链接无效或已失效' }, { status: 403 })
    }

    // Check if expired
    if (projectLink.expires_at && new Date(projectLink.expires_at) < new Date()) {
      return NextResponse.json({ error: '链接已过期' }, { status: 403 })
    }

    // Create message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        project_id,
        author_role: 'client',
        author_id: null,
        body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Message error:', error)
    return NextResponse.json(
      { error: error.message || '发送失败' },
      { status: 500 }
    )
  }
}
