import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const file_id = searchParams.get('file_id')
    const token = searchParams.get('token')

    if (!file_id || !token) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get file info
    const { data: file } = await supabase
      .from('files')
      .select('*')
      .eq('id', file_id)
      .single()

    if (!file) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 })
    }

    // Verify token for this project
    const { data: projectLink } = await supabase
      .from('project_links')
      .select('*')
      .eq('token_hash', token)
      .eq('project_id', file.project_id)
      .is('revoked_at', null)
      .single()

    if (!projectLink) {
      return NextResponse.json({ error: '链接无效或已失效' }, { status: 403 })
    }

    // Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('project-files')
      .download(file.storage_path)

    if (downloadError) {
      throw downloadError
    }

    // Return file
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.file_name)}"`,
      },
    })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error.message || '下载失败' },
      { status: 500 }
    )
  }
}
