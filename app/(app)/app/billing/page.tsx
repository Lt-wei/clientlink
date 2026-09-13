import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BillingPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)

  const activeProjectsCount = projects?.filter(
    p => !p.is_archived && p.status !== '已完成' && p.status !== '已归档'
  ).length || 0

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">订阅管理</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">当前方案</h2>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {profile?.plan === 'pro' ? 'Pro 版' : '免费版'}
              </span>
              {profile?.plan === 'pro' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  已订阅
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2">
              进行中项目：{activeProjectsCount} / {profile?.plan === 'pro' ? '50' : '1'}
            </p>
          </div>
          {profile?.plan === 'free' && (
            <Link
              href="#pricing"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              升级 Pro
            </Link>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm text-gray-500 mb-1">总项目数</div>
          <div className="text-2xl font-bold text-gray-900">{projects?.length || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm text-gray-500 mb-1">进行中</div>
          <div className="text-2xl font-bold text-gray-900">{activeProjectsCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm text-gray-500 mb-1">已完成</div>
          <div className="text-2xl font-bold text-gray-900">
            {projects?.filter(p => p.status === '已完成' || p.is_archived).length || 0}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div id="pricing">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">选择方案</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
            profile?.plan === 'free' ? 'border-blue-500' : 'border-gray-200'
          }`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">免费版</h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              ¥0<span className="text-lg font-normal text-gray-600">/月</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">1 个进行中项目</span>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Magic Link 分享</span>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">完整功能：进度+文件+留言</span>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">单文件最大 20MB</span>
              </li>
            </ul>
            {profile?.plan === 'free' && (
              <div className="text-sm text-gray-600 font-medium">当前方案</div>
            )}
          </div>

          <div className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
            profile?.plan === 'pro' ? 'border-blue-500' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">Pro 版</h3>
              {profile?.plan !== 'pro' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  推荐
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ¥68<span className="text-lg font-normal text-gray-600">/月</span>
            </div>
            <div className="text-sm text-gray-600 mb-4">或 ¥688/年（节省 2 个月）</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 font-medium">50 个进行中项目</span>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">自定义品牌色与 Logo</span>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">单文件最大 100MB</span>
              </li>
              <li className="flex items-start text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">优先支持</span>
              </li>
            </ul>
            {profile?.plan === 'pro' ? (
              <div className="text-sm text-gray-600 font-medium">当前方案</div>
            ) : (
              <button
                onClick={() => alert('支付功能开发中。\n\n请联系我们获取 Pro 订阅：\n邮箱：support@clientlink.example')}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                立即升级
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Note */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">关于支付</h3>
        <p className="text-blue-800 text-sm mb-4">
          支付功能正在对接中。如需立即升级到 Pro 版本，请通过以下方式联系我们：
        </p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 邮箱：support@clientlink.example</li>
          <li>• 微信：ClientLink_Support</li>
        </ul>
        <p className="text-sm text-blue-700 mt-4">
          我们将在 1 个工作日内为您手动开通 Pro 权限。
        </p>
      </div>
    </div>
  )
}
