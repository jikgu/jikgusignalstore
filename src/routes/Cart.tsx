import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { CartItem } from '../types/database'
import type { User } from '@supabase/supabase-js'
import { useModal } from '../hooks/useModal'

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { Modal, showError, showSuccess, showConfirm, showWarning } = useModal()

  useEffect(() => {
    checkUserAndFetchCart()
  }, [])

  const checkUserAndFetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      await fetchCartItems(user.id)
    } else {
      setLoading(false)
    }
  }

  const fetchCartItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', userId)

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)

      if (error) throw error
      
      // Update local state
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (error) {
      console.error('Error updating quantity:', error)
      showError('수량 변경에 실패했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (itemId: number) => {
    showConfirm('상품을 삭제하시겠습니까?', async () => {
      setUpdating(true)
      try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      // Update local state
      setCartItems(items => items.filter(item => item.id !== itemId))
      showSuccess('상품이 삭제되었습니다.')
    } catch (error) {
      console.error('Error removing item:', error)
      showError('상품 삭제에 실패했습니다.')
    } finally {
      setUpdating(false)
    }
    })
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.price_krw * item.quantity), 0
    )
    const shipping = cartItems.length > 0 ? 15000 : 0
    const duty = Math.floor(subtotal * 0.1)
    const fee = cartItems.length > 0 ? 3000 : 0
    const total = subtotal + shipping + duty + fee

    return { subtotal, shipping, duty, fee, total }
  }

  const handleCheckout = () => {
    if (!user) {
      showWarning('로그인이 필요합니다.')
      setTimeout(() => navigate('/mypage'), 1500)
      return
    }
    
    if (cartItems.length === 0) {
      showWarning('장바구니가 비어있습니다.')
      return
    }

    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link to="/mypage" className="text-blue-600 hover:underline">로그인하기</Link>
        </div>
      </div>
    )
  }

  const totals = calculateTotals()

  return (
    <>
      <Modal />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">장바구니</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">장바구니가 비어있습니다</p>
          <Link to="/" className="text-blue-600 hover:underline">쇼핑 계속하기</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow">
              {cartItems.map(item => (
                <div key={item.id} className="p-6 border-b last:border-b-0">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded relative">
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name_ko}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        {item.products?.name_ko || '상품명'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.products?.brand}
                      </p>
                      <p className="text-gray-900 mb-2">
                        ₩ {item.price_krw.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating}
                          className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating}
                          className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updating}
                          className="ml-4 text-red-600 hover:underline disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₩ {(item.price_krw * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">주문 요약</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>상품 합계</span>
                  <span>₩ {totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>국제 배송비</span>
                  <span>₩ {totals.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>예상 관부가세</span>
                  <span>₩ {totals.duty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>서비스 수수료</span>
                  <span>₩ {totals.fee.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>총 결제금액</span>
                  <span>₩ {totals.total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                결제하기
              </button>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                관부가세는 예상 금액이며, 실제 부과액과 차이가 있을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}