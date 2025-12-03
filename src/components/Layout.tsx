import { Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export default function Layout() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                직구 시그널 스토어
              </Link>
              <nav className="ml-10 flex space-x-8">
                <Link to="/search" className="text-gray-600 hover:text-gray-900">
                  검색
                </Link>
                <Link to="/category/electronics" className="text-gray-600 hover:text-gray-900">
                  전자기기
                </Link>
                <Link to="/category/fashion" className="text-gray-600 hover:text-gray-900">
                  패션
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="text-gray-600 hover:text-gray-900">
                장바구니
              </Link>
              {user ? (
                <>
                  <Link to="/orders" className="text-gray-600 hover:text-gray-900">
                    주문내역
                  </Link>
                  <Link to="/mypage" className="text-gray-600 hover:text-gray-900">
                    마이페이지
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link to="/mypage" className="text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">회사소개</h3>
              <ul className="space-y-2 text-gray-300">
                <li>회사 소개</li>
                <li>이용약관</li>
                <li>개인정보처리방침</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">고객센터</h3>
              <ul className="space-y-2 text-gray-300">
                <li>FAQ</li>
                <li>1:1 문의</li>
                <li>배송조회</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">쇼핑가이드</h3>
              <ul className="space-y-2 text-gray-300">
                <li>직구 가이드</li>
                <li>관부가세 안내</li>
                <li>환불/반품 정책</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">연락처</h3>
              <p className="text-gray-300">고객센터: 1588-0000</p>
              <p className="text-gray-300">평일 09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}