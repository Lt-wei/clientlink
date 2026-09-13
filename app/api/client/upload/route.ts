import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const project_id = formData.get('project_id') as string
    const token = formData.get('token') as string

    if (!file || !project_id || !token) {
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

    // Check file size
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件大小超过限制（最大 20MB）' }, { status: 400 })
    }

    // Upload to storage
    const filePath = `${project_id}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Save to database
    const { data, error } = await supabase
      .from('files')
      .insert({
        project_id,
        storage_path: filePath,
        file_name: file.name,
        file_size: file.size,
        uploaded_by_role: 'client',
        uploaded_by_id: null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || '上传失败' },
      { status: 500 }
    )
  }
}
