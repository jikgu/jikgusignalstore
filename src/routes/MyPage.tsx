import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        alert(error.message)
      } else {
        alert('회원가입이 완료되었습니다! 이메일을 확인해주세요.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        alert(error.message)
      }
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isSignUp ? '회원가입' : '로그인'}
          </h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isSignUp ? '회원가입' : '로그인'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">내 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">이메일</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">전화번호</label>
                <input
                  type="tel"
                  placeholder="010-1234-5678"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">개인통관고유부호</label>
                <input
                  type="text"
                  placeholder="P123456789012"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  관세청에서 발급받은 개인통관고유부호를 입력해주세요.
                </p>
              </div>
              
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                정보 수정
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">배송지 관리</h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">기본 배송지</span>
                  <div className="space-x-2">
                    <button className="text-sm text-gray-600 hover:underline">수정</button>
                    <button className="text-sm text-red-600 hover:underline">삭제</button>
                  </div>
                </div>
                <p className="font-medium">홍길동</p>
                <p className="text-sm text-gray-600">010-1234-5678</p>
                <p className="text-sm text-gray-600">서울시 강남구 테헤란로 123, 101동 202호</p>
              </div>
              
              <button className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600">
                + 새 배송지 추가
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">나의 쇼핑 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">총 주문</span>
                <span className="font-medium">2건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">진행중인 주문</span>
                <span className="font-medium">1건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 구매금액</span>
                <span className="font-medium">₩ 592,570</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">빠른 메뉴</h2>
            <div className="space-y-2">
              <a href="/orders" className="block p-2 hover:bg-gray-50 rounded">주문 내역</a>
              <a href="/cart" className="block p-2 hover:bg-gray-50 rounded">장바구니</a>
              <a href="/help" className="block p-2 hover:bg-gray-50 rounded">고객센터</a>
              <button className="block w-full text-left p-2 hover:bg-gray-50 rounded text-red-600">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}