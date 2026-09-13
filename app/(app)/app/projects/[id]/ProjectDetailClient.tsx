'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatFileSize, getStatusColor, generateToken, hashToken } from '@/lib/utils'
import type { Project, ProjectLink, ProgressUpdate, File as FileType, Message, ProjectStatus } from '@/lib/types'

const statuses: ProjectStatus[] = ['草稿筹备', '进行中', '等待客户', '待确认', '已完成', '已归档']

interface Props {
  project: Project
  projectLink: ProjectLink | null
  initialProgressUpdates: ProgressUpdate[]
  initialFiles: FileType[]
  initialMessages: Message[]
}

export default function ProjectDetailClient({
  project: initialProject,
  projectLink: initialProjectLink,
  initialProgressUpdates,
  initialFiles,
  initialMessages,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'files' | 'messages' | 'settings'>('overview')
  const [project, setProject] = useState(initialProject)
  const [projectLink, setProjectLink] = useState(initialProjectLink)
  const [progressUpdates, setProgressUpdates] = useState(initialProgressUpdates)
  const [files, setFiles] = useState(initialFiles)
  const [messages, setMessages] = useState(initialMessages)
  
  const [newProgress, setNewProgress] = useState({ title: '', body: '', visible_to_client: true })
  const [newMessage, setNewMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)

  const clientLink = projectLink 
    ? `${window.location.origin}/p/${projectLink.token_hash}`
    : null

  const generateLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // Generate token
      const token = generateToken()
      const token_hash = hashToken(token)

      // Revoke old links
      if (projectLink) {
        await supabase
          .from('project_links')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', projectLink.id)
      }

      // Create new link
      const { data, error } = await supabase
        .from('project_links')
        .insert({
          project_id: project.id,
          token_hash: token,
        })
        .select()
        .single()

      if (error) throw error

      setProjectLink(data)
      alert('客户链接已生成！')
    } catch (error: any) {
      alert(error.message || '生成链接失败')
    }
  }

  const copyLink = async () => {
    if (clientLink) {
      await navigator.clipboard.writeText(clientLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const revokeLink = async () => {
    if (!projectLink) return
    if (!confirm('确定要吊销此链接吗？客户将无法再访问项目页面。')) return

    try {
      const { error } = await supabase
        .from('project_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', projectLink.id)

      if (error) throw error

      setProjectLink(null)
      alert('链接已吊销')
    } catch (error: any) {
      alert(error.message || '吊销失败')
    }
  }

  const addProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProgress.title.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { data, error } = await supabase
        .from('progress_updates')
        .insert({
          project_id: project.id,
          title: newProgress.title,
          body: newProgress.body || null,
          visible_to_client: newProgress.visible_to_client,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setProgressUpdates([data, ...progressUpdates])
      setNewProgress({ title: '', body: '', visible_to_client: true })
    } catch (error: any) {
      alert(error.message || '添加失败')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (20MB for free, 100MB for pro)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      alert('文件大小超过限制（最大 20MB）')
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // Upload to storage
      const filePath = `${project.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save to database
      const { data, error } = await supabase
        .from('files')
        .insert({
          project_id: project.id,
          storage_path: filePath,
          file_name: file.name,
          file_size: file.size,
          uploaded_by_role: 'owner',
          uploaded_by_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setFiles([data, ...files])
      alert('文件上传成功！')
    } catch (error: any) {
      alert(error.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = async (file: FileType) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(file.storage_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.file_name
      a.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error.message || '下载失败')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          project_id: project.id,
          author_role: 'owner',
          author_id: user.id,
          body: newMessage,
        })
        .select()
        .single()

      if (error) throw error

      setMessages([...messages, data])
      setNewMessage('')
    } catch (error: any) {
      alert(error.message || '发送失败')
    }
  }

  const updateProjectStatus = async (status: ProjectStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', project.id)

      if (error) throw error

      setProject({ ...project, status })
    } catch (error: any) {
      alert(error.message || '更新失败')
    }
  }

  const archiveProject = async () => {
    if (!confirm('确定要归档此项目吗？归档后客户仍可查看，但项目将不占用进行中名额。')) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_archived: true, status: '已归档' })
        .eq('id', project.id)

      if (error) throw error

      router.push('/app')
      router.refresh()
    } catch (error: any) {
      alert(error.message || '归档失败')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/app" className="text-blue-600 hover:text-blue-700 text-sm">
          ← 返回项目列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">客户：{project.client_name}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '概览' },
            { id: 'progress', label: '进度' },
            { id: 'files', label: '文件' },
            { id: 'messages', label: '留言' },
            { id: 'settings', label: '设置' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">客户链接</h2>
              {clientLink ? (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="text"
                      value={clientLink}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={copyLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {copied ? '已复制！' : '复制'}
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={revokeLink}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      吊销链接
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">还没有生成客户链接</p>
                  <button
                    onClick={generateLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    生成链接
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">项目信息</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">客户邮箱</dt>
                  <dd className="text-sm text-gray-900">{project.client_email || '未填写'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">创建时间</dt>
                  <dd className="text-sm text-gray-900">{formatDate(project.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">最后更新</dt>
                  <dd className="text-sm text-gray-900">{formatDate(project.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">添加进度更新</h2>
              <form onSubmit={addProgress} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="进度标题"
                    value={newProgress.title}
                    onChange={(e) => setNewProgress({ ...newProgress, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="详细说明（可选）"
                    value={newProgress.body}
                    onChange={(e) => setNewProgress({ ...newProgress, body: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProgress.visible_to_client}
                      onChange={(e) => setNewProgress({ ...newProgress, visible_to_client: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">客户可见</span>
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">进度时间线</h2>
              {progressUpdates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">还没有进度更新</p>
              ) : (
                <div className="space-y-4">
                  {progressUpdates.map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{update.title}</h3>
                        <span className="text-xs text-gray-500">{formatDate(update.created_at)}</span>
                      </div>
                      {update.body && (
                        <p className="text-sm text-gray-600 mt-1">{update.body}</p>
                      )}
                      <div className="mt-1">
                        <span className={`text-xs ${update.visible_to_client ? 'text-green-600' : 'text-gray-500'}`}>
                          {update.visible_to_client ? '✓ 客户可见' : '仅自己可见'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">上传文件</h2>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">最大 20MB</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">文件列表</h2>
              {files.length === 0 ? (
                <p className="text-gray-500 text-center py-8">还没有文件</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)} · {formatDate(file.created_at)} · {file.uploaded_by_role === 'owner' ? '我' : '客户'}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        下载
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">留言</h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">还没有留言</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.author_role === 'owner'
                        ? 'bg-blue-50 ml-12'
                        : 'bg-gray-50 mr-12'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {message.author_role === 'owner' ? '我' : project.client_name}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.body}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="输入留言..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                发送
              </button>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">项目状态</h2>
              <select
                value={project.status}
                onChange={(e) => updateProjectStatus(e.target.value as ProjectStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">归档项目</h2>
              <p className="text-gray-600 mb-4">
                归档后，项目将不占用进行中名额，但客户仍可以只读方式查看。
              </p>
              <button
                onClick={archiveProject}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                归档项目
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
