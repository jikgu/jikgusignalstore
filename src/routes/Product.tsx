import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types/database'
import type { User } from '@supabase/supabase-js'
import { useModal } from '../hooks/useModal'

export default function Product() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const { Modal, showSuccess, showError, showWarning } = useModal()

  useEffect(() => {
    fetchProduct()
    checkUser()
  }, [productId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchProduct = async () => {
    if (!productId) return
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', parseInt(productId))
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      showWarning('로그인이 필요합니다.')
      setTimeout(() => navigate('/mypage'), 1500)
      return
    }

    if (!product) return

    setAddingToCart(true)
    try {
      // First, ensure user profile exists in users table
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
        console.error('Error creating user profile:', profileError)
        throw profileError
      }

      // Get or create cart
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (cartError && cartError.code === 'PGRST116') {
        // Cart doesn't exist, create one
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (createError) throw createError
        cart = newCart
      } else if (cartError) {
        throw cartError
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', product.id)
        .single()

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            price_krw: product.price_krw
          })
          .eq('id', existingItem.id)

        if (updateError) throw updateError
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            price_krw: product.price_krw
          })

        if (insertError) throw insertError
      }

      showSuccess('장바구니에 추가되었습니다!')
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      if (error.code === '23505') {
        showWarning('이미 장바구니에 있는 상품입니다.')
      } else if (error.message) {
        showError(`장바구니 추가 실패: ${error.message}`)
      } else {
        showError('장바구니 추가에 실패했습니다.')
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-12">
            <div className="bg-gray-200 rounded-lg h-96"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">상품을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const estimatedDuty = Math.floor(product.price_krw * 0.1)
  const shippingFee = 15000
  const totalPrice = product.price_krw * quantity + estimatedDuty + shippingFee

  return (
    <>
      <Modal />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 gap-12">
        <div>
          <div className="bg-gray-200 rounded-lg h-96 mb-4 relative">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name_ko}
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name_ko}</h1>
          {product.name_original && (
            <p className="text-gray-500 mb-2">{product.name_original}</p>
          )}
          <p className="text-gray-600 mb-4">{product.brand}</p>
          
          <div className="border-t border-b py-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">판매가</span>
              <span className="text-2xl font-bold">₩ {product.price_krw.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">예상 관부가세</span>
              <span>₩ {estimatedDuty.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">배송비</span>
              <span>₩ {shippingFee.toLocaleString()}</span>
            </div>
            <div className="border-t mt-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">총 예상 금액</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩ {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">수량</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 text-center border rounded px-2 py-1"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleBuyNow}
              disabled={addingToCart}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              바로구매
            </button>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              {addingToCart ? '추가중...' : '장바구니'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">배송 정보</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 해외배송: 7-14일</li>
              <li>• 통관: 2-3일</li>
              <li>• 국내배송: 1-2일</li>
              <li>• 전체 예상 소요기간: 10-19일</li>
            </ul>
          </div>

          {product.stock_status === 'LIMITED' && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">⚠️ 한정 수량 상품입니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <div className="border-b">
          <nav className="flex gap-8">
            <button className="pb-4 border-b-2 border-blue-600 font-semibold">상품설명</button>
            <button className="pb-4 text-gray-600">리뷰 (0)</button>
            <button className="pb-4 text-gray-600">Q&A</button>
            <button className="pb-4 text-gray-600">배송/반품</button>
          </nav>
        </div>
        
        <div className="py-8">
          <h2 className="text-xl font-semibold mb-4">상품 상세정보</h2>
          <p className="text-gray-600 mb-4">
            {product.description_ko || '상품 설명이 준비 중입니다.'}
          </p>
          {product.description_original && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">{product.description_original}</p>
            </div>
          )}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 관부가세는 예상 금액이며, 실제 부과액과 차이가 있을 수 있습니다.
              통관시 실제 부과되는 금액을 기준으로 정산됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}