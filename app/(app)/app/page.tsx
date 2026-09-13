import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Project, Profile } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  // Get projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false }) as { data: Project[] | null }

  // Calculate active projects count
  const activeProjectsCount = projects?.filter(
    p => !p.is_archived && p.status !== '已完成' && p.status !== '已归档'
  ).length || 0

  const canCreateProject = profile?.plan === 'pro' || activeProjectsCount < 1

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的项目</h1>
            <p className="mt-2 text-gray-600">
              进行中项目：{activeProjectsCount} / {profile?.plan === 'pro' ? '50' : '1'}
              {profile?.plan === 'free' && (
                <span className="ml-2 text-sm text-blue-600">
                  <Link href="/app/billing" className="hover:underline">
                    升级 Pro 解锁更多
                  </Link>
                </span>
              )}
            </p>
          </div>
          <Link
            href="/app/projects/new"
            className={`px-6 py-3 rounded-lg font-medium ${
              canCreateProject
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!canCreateProject) {
                e.preventDefault()
                alert('免费版仅支持 1 个进行中项目。请归档现有项目或升级到 Pro 版本。')
              }
            }}
          >
            + 新建项目
          </Link>
        </div>
      </div>

      {/* Projects List */}
      {!projects || projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">还没有项目</h2>
          <p className="text-gray-600 mb-6">创建您的第一个项目，开始与客户协作</p>
          <Link
            href="/app/projects/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/app/projects/${project.id}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {project.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {project.client_name}
                </div>
                <div className="flex items-center text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(project.updated_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Plan limit warning */}
      {profile?.plan === 'free' && activeProjectsCount >= 1 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                已达到免费版项目限制
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  您可以归档现有项目来创建新项目，或者{' '}
                  <Link href="/app/billing" className="font-medium underline">
                    升级到 Pro 版本
                  </Link>
                  {' '}获得最多 50 个项目。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
