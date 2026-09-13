import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ClientLink</span>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">功能</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">定价</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
            <Link 
              href="/login"
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              登录
            </Link>
            <Link 
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              免费开始
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          客户一页通
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
          专为设计师、独立开发者和顾问打造的轻量级客户门户
        </p>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          三分钟创建项目，一键分享进度。客户无需注册，即可查看项目、上传文件、实时沟通
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/login"
            className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg"
          >
            免费试用
          </Link>
          <a 
            href="#demo"
            className="px-8 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            查看演示
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          免费 1 个项目 · 无需信用卡 · 3 分钟上手
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">核心功能</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Magic Link 分享</h3>
            <p className="text-gray-600">
              生成专属链接，客户点击即可查看。无需注册、无需记密码，微信里直接打开
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">进度时间线</h3>
            <p className="text-gray-600">
              实时更新项目进展，让客户清楚知道每一步。告别反复询问"做到哪了"
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">文件与留言</h3>
            <p className="text-gray-600">
              双向上传文件，实时留言沟通。所有资料集中管理，不再散落微信群
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">简单透明的定价</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">免费版</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                ¥0<span className="text-lg font-normal text-gray-600">/月</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">1 个进行中项目</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Magic Link 分享</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">进度 + 文件 + 留言</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">单文件最大 20MB</span>
                </li>
              </ul>
              <Link 
                href="/login"
                className="block w-full text-center px-6 py-3 text-base font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                免费开始
              </Link>
            </div>

            <div className="bg-blue-600 p-8 rounded-lg shadow-lg border-2 border-blue-700 relative">
              <div className="absolute top-0 right-6 transform -translate-y-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                  推荐
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro 版</h3>
              <div className="text-4xl font-bold text-white mb-2">
                ¥68<span className="text-lg font-normal text-blue-200">/月</span>
              </div>
              <div className="text-sm text-blue-200 mb-6">或 ¥688/年（节省 2 个月）</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-200 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">50 个进行中项目</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-200 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">自定义品牌色与 Logo</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-200 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">单文件最大 100MB</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-200 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">优先支持</span>
                </li>
              </ul>
              <Link 
                href="/login"
                className="block w-full text-center px-6 py-3 text-base font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-50"
              >
                立即升级
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">常见问题</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">客户需要注册账号吗？</h3>
            <p className="text-gray-600">
              不需要！客户只需要点击您分享的 Magic Link，就能直接查看项目。非常适合在微信里分享给客户。
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">免费版的限制是什么？</h3>
            <p className="text-gray-600">
              免费版可以创建 1 个进行中项目。已完成或归档的项目不占用名额，您随时可以归档旧项目来创建新项目。
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">数据安全吗？</h3>
            <p className="text-gray-600">
              我们使用 Supabase 企业级数据库，所有数据加密传输和存储。Magic Link 无法被枚举，每个项目数据完全隔离。
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">可以取消订阅吗？</h3>
            <p className="text-gray-600">
              当然可以！您可以随时取消 Pro 订阅。取消后，现有项目和数据依然保留，只是新建项目会回到免费版限制。
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">支持哪些支付方式？</h3>
            <p className="text-gray-600">
              支持微信支付、支付宝等主流支付方式。年付可享受约 8.3 折优惠。
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            三分钟搭建您的客户门户
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            专业、简洁、高效。今天就开始吧
          </p>
          <Link 
            href="/login"
            className="inline-block px-8 py-3 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-50 shadow-lg"
          >
            免费开始使用
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2026 ClientLink. 保留所有权利
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">隐私政策</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">服务条款</a>
              <a href="https://github.com/Lt-wei" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-900">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
