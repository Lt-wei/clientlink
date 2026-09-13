'use client'

import { useState } from 'react'
import { formatDate, formatFileSize, getStatusColor } from '@/lib/utils'
import type { Project, ProgressUpdate, File as FileType, Message } from '@/lib/types'

interface Props {
  project: Project
  token: string
  initialProgressUpdates: ProgressUpdate[]
  initialFiles: FileType[]
  initialMessages: Message[]
}

export default function ClientPortalView({
  project,
  token,
  initialProgressUpdates,
  initialFiles,
  initialMessages,
}: Props) {
  const [activeSection, setActiveSection] = useState<'progress' | 'files' | 'messages'>('progress')
  const [progressUpdates] = useState(initialProgressUpdates)
  const [files] = useState(initialFiles)
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      alert('文件大小超过限制（最大 20MB）')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', project.id)
      formData.append('token', token)

      const response = await fetch('/api/client/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      alert('文件上传成功！')
      window.location.reload()
    } catch (error: any) {
      alert(error.message || '上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = async (file: FileType) => {
    try {
      const response = await fetch(`/api/client/download?file_id=${file.id}&token=${token}`)
      
      if (!response.ok) {
        throw new Error('下载失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.file_name
      a.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      alert(error.message || '下载失败，请重试')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch('/api/client/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          token,
          body: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('发送失败')
      }

      const data = await response.json()
      setMessages([...messages, data])
      setNewMessage('')
    } catch (error: any) {
      alert(error.message || '发送失败，请重试')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Friendly */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: project.brand_color }}
              >
                <span className="text-white font-bold text-lg">
                  {project.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {project.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {project.client_name}
                </p>
              </div>
            </div>
            <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Section Navigation - Mobile Friendly */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            {[
              { id: 'progress', label: '进度', icon: '📋' },
              { id: 'files', label: '文件', icon: '📁' },
              { id: 'messages', label: '留言', icon: '💬' },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex-1 px-4 sm:px-6 py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        {activeSection === 'progress' && (
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">项目进度</h2>
            {progressUpdates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <p className="text-gray-500">还没有进度更新</p>
              </div>
            ) : (
              <div className="space-y-4">
                {progressUpdates.map((update) => (
                  <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <h3 className="font-medium text-gray-900">{update.title}</h3>
                      <span className="text-xs text-gray-500 mt-1 sm:mt-0 sm:ml-4 whitespace-nowrap">
                        {formatDate(update.created_at)}
                      </span>
                    </div>
                    {update.body && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{update.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Files Section */}
        {activeSection === 'files' && (
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">上传文件</h2>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">最大 20MB</p>
            </div>

            {/* File List */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">文件列表</h2>
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-2">📁</div>
                  <p className="text-gray-500">还没有文件</p>
                  <p className="text-sm text-gray-400 mt-2">上传您的需求资料吧</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-lg">
                      <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                        <p className="font-medium text-gray-900 break-all">{file.file_name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatFileSize(file.file_size)} · {formatDate(file.created_at)}
                          {file.uploaded_by_role === 'owner' && ' · 服务方上传'}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="w-full sm:w-auto px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
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

        {/* Messages Section */}
        {activeSection === 'messages' && (
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">留言沟通</h2>
            
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-2">💬</div>
                  <p className="text-gray-500">还没有留言</p>
                  <p className="text-sm text-gray-400 mt-2">有任何问题随时沟通</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.author_role === 'owner'
                        ? 'bg-blue-50 sm:mr-12'
                        : 'bg-gray-100 sm:ml-12'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {message.author_role === 'owner' ? '服务方' : project.client_name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {message.body}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="输入留言..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? '发送中...' : '发送'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>由 <a href="/" className="text-blue-600 hover:text-blue-700">ClientLink</a> 提供技术支持</p>
      </div>
    </div>
  )
}
