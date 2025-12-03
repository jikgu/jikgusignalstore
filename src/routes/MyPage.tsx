import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useModal } from '../hooks/useModal'

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { Modal, showSuccess, showError } = useModal()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        ensureUserProfile(session.user)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        ensureUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserProfile = async (user: User) => {
    try {
      // Ensure user profile exists in users table
      const { error: profileError } = await supabase
        .from('users')
        .upsert({ 
          id: user.id, 
          email: user.email || '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
      
      if (profileError) {
        console.error('Error ensuring user profile:', profileError)
      }

      // Ensure cart exists
      const { error: cartError } = await supabase
        .from('carts')
        .upsert({ 
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
      
      if (cartError) {
        console.error('Error ensuring cart:', cartError)
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        showError(error.message)
      } else {
        showSuccess('회원가입이 완료되었습니다! 이메일을 확인해주세요.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        showError(error.message)
      } else {
        showSuccess('로그인되었습니다!')
      }
    }
  }

  if (!user) {
    return (
      <>
        <Modal />
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
      </>
    )
  }

  return (
    <>
      <Modal />
      <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">내 정보</h2>
        <div className="space-y-2">
          <p><span className="text-gray-600">이메일:</span> {user.email}</p>
          <p><span className="text-gray-600">가입일:</span> {new Date(user.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">주문 관리</h3>
          <ul className="space-y-2">
            <li><a href="/orders" className="text-blue-600 hover:underline">주문 내역</a></li>
            <li><a href="/cart" className="text-blue-600 hover:underline">장바구니</a></li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">계정 설정</h3>
          <ul className="space-y-2">
            <li><button className="text-blue-600 hover:underline">배송지 관리</button></li>
            <li><button className="text-blue-600 hover:underline">비밀번호 변경</button></li>
          </ul>
        </div>
      </div>
    </div>
    </>
  )
}