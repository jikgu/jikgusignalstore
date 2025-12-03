import { Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import type { Category } from '../types/database'

export default function Layout() {
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Get user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Fetch categories
    fetchCategories()

    return () => subscription.unsubscribe()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to default categories if fetch fails
      setCategories([
        { id: 'electronics', name_ko: '전자기기', name_en: 'Electronics', icon_color: 'bg-blue-100', display_order: 1, is_active: true, created_at: null, updated_at: null },
        { id: 'fashion', name_ko: '패션', name_en: 'Fashion', icon_color: 'bg-pink-100', display_order: 2, is_active: true, created_at: null, updated_at: null },
        { id: 'beauty', name_ko: '뷰티', name_en: 'Beauty', icon_color: 'bg-green-100', display_order: 3, is_active: true, created_at: null, updated_at: null },
        { id: 'sports', name_ko: '스포츠', name_en: 'Sports', icon_color: 'bg-yellow-100', display_order: 4, is_active: true, created_at: null, updated_at: null },
        { id: 'home', name_ko: '홈/리빙', name_en: 'Home & Living', icon_color: 'bg-purple-100', display_order: 5, is_active: true, created_at: null, updated_at: null },
      ])
    }
  }

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
                {categories.map((category) => (
                  <Link 
                    key={category.id}
                    to={`/category/${category.id}`} 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {category.name_ko}
                  </Link>
                ))}
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