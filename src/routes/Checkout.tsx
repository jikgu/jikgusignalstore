import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { CartItem, UserAddress } from '../types/database'
import type { User } from '@supabase/supabase-js'

export default function Checkout() {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [user, setUser] = useState<User | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    recipient: '',
    phone: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: '',
    customsNumber: ''
  })

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  const checkUserAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/mypage')
        return
      }
      setUser(user)

      // Fetch cart items
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id)

      if (cartError) throw cartError
      if (!cartData || cartData.length === 0) {
        alert('장바구니가 비어있습니다.')
        navigate('/cart')
        return
      }
      setCartItems(cartData)

      // Fetch user addresses
      const { data: addressData } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (addressData && addressData.length > 0) {
        setAddresses(addressData)
        const defaultAddr = addressData.find(a => a.is_default) || addressData[0]
        setSelectedAddressId(defaultAddr.id)
        setFormData({
          recipient: defaultAddr.recipient,
          phone: defaultAddr.phone,
          postalCode: defaultAddr.postal_code,
          addressLine1: defaultAddr.address_line1,
          addressLine2: defaultAddr.address_line2 || '',
          customsNumber: ''
        })
      }

      // Fetch user customs number
      const { data: userData } = await supabase
        .from('users')
        .select('personal_customs_number')
        .eq('id', user.id)
        .single()

      if (userData?.personal_customs_number) {
        setFormData(prev => ({ ...prev, customsNumber: userData.personal_customs_number }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
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

  const handleCheckout = async () => {
    if (!user || !formData.recipient || !formData.phone || !formData.postalCode || !formData.addressLine1) {
      alert('배송지 정보를 모두 입력해주세요.')
      return
    }

    if (!formData.customsNumber) {
      alert('개인통관고유부호를 입력해주세요.')
      return
    }

    setProcessing(true)
    const totals = calculateTotals()

    try {
      // Generate order number
      const orderDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      const orderNumber = `ORD${orderDate}${randomNum}`

      // Save or update address if needed
      let addressId = selectedAddressId
      if (!addressId) {
        const { data: newAddress, error: addressError } = await supabase
          .from('user_addresses')
          .insert({
            user_id: user.id,
            recipient: formData.recipient,
            phone: formData.phone,
            postal_code: formData.postalCode,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            is_default: addresses.length === 0
          })
          .select()
          .single()

        if (addressError) throw addressError
        addressId = newAddress.id
      }

      // Update user's customs number
      await supabase
        .from('users')
        .update({ personal_customs_number: formData.customsNumber })
        .eq('id', user.id)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'PAID',
          address_id: addressId,
          shipping_address: {
            recipient: formData.recipient,
            phone: formData.phone,
            postal_code: formData.postalCode,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2
          },
          payment_method: paymentMethod,
          payment_status: 'PAID',
          total_product_krw: totals.subtotal,
          total_shipping_krw: totals.shipping,
          total_duty_krw: totals.duty,
          total_fee_krw: totals.fee,
          total_pay_krw: totals.total,
          paid_at: new Date().toISOString()
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        mall_code: item.products?.mall_code || null,
        external_id: item.products?.external_id || null,
        name_snapshot: item.products?.name_ko || '',
        price_snapshot: {
          original: item.products?.price_original,
          krw: item.price_krw
        },
        quantity: item.quantity,
        unit_price_krw: item.price_krw,
        subtotal_krw: item.price_krw * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Create shipment record
      const { error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          order_id: order.id,
          status: 'PREPARING'
        })

      if (shipmentError) throw shipmentError

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (clearError) throw clearError

      alert('주문이 완료되었습니다!')
      navigate('/orders')
    } catch (error: any) {
      console.error('Error creating order:', error)
      alert(`주문 처리 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6 h-96"></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 h-64"></div>
          </div>
        </div>
      </div>
    )
  }

  const totals = calculateTotals()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">결제하기</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">받는 분</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="홍길동"
                  value={formData.recipient}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">연락처</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">우편번호</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    required
                  />
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    우편번호 찾기
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">주소</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder="기본 주소"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="상세 주소"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">개인통관고유부호</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="P123456789012"
                  value={formData.customsNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, customsNumber: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">결제 수단</h2>
            
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>신용/체크카드</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="KAKAO_PAY"
                  checked={paymentMethod === 'KAKAO_PAY'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>카카오페이</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="NAVER_PAY"
                  checked={paymentMethod === 'NAVER_PAY'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>네이버페이</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">최종 결제금액</h2>
            
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
              disabled={processing}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? '처리중...' : `${totals.total.toLocaleString()}원 결제하기`}
            </button>

            <div className="mt-4 text-xs text-gray-600">
              <p>위 버튼을 클릭하면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}