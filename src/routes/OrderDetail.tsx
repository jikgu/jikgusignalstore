import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Order, OrderItem, Shipment } from '../types/database'

interface OrderDetailData extends Order {
  order_items: (OrderItem & {
    products: any
  })[]
  shipments: Shipment[]
  users: {
    personal_customs_number: string | null
  }
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAndFetchOrder()
  }, [orderId])

  const checkUserAndFetchOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/mypage')
        return
      }

      if (!orderId) return

      // Fetch order with related data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          shipments (*),
          users!inner (
            personal_customs_number
          )
        `)
        .eq('id', parseInt(orderId))
        .eq('user_id', user.id)
        .single()

      if (orderError) {
        console.error('Error fetching order:', orderError)
        if (orderError.code === 'PGRST116') {
          alert('주문을 찾을 수 없습니다.')
          navigate('/orders')
        }
        return
      }

      setOrder(orderData as OrderDetailData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-500'
      case 'SHIPPING':
      case 'IN_TRANSIT':
        return 'bg-blue-500'
      case 'CUSTOMS':
        return 'bg-yellow-500'
      case 'PREPARING':
      case 'PAID':
        return 'bg-purple-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '결제 대기'
      case 'PAID': return '결제 완료'
      case 'PREPARING': return '상품 준비중'
      case 'SHIPPED': return '해외 배송 시작'
      case 'IN_TRANSIT': return '배송중'
      case 'CUSTOMS': return '통관중'
      case 'DELIVERED': return '배송완료'
      case 'CANCELLED': return '주문취소'
      default: return status
    }
  }

  const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
      case 'CARD': return '신용/체크카드'
      case 'KAKAO_PAY': return '카카오페이'
      case 'NAVER_PAY': return '네이버페이'
      default: return '카드'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6 h-32"></div>
              <div className="bg-white rounded-lg shadow p-6 h-64"></div>
              <div className="bg-white rounded-lg shadow p-6 h-48"></div>
            </div>
            <div>
              <div className="bg-white rounded-lg shadow p-6 h-48 mb-4"></div>
              <div className="bg-white rounded-lg shadow p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">주문을 찾을 수 없습니다.</p>
          <Link to="/orders" className="text-blue-600 hover:underline">주문 목록으로</Link>
        </div>
      </div>
    )
  }

  const shipment = order.shipments?.[0]
  const shippingAddress = order.shipping_address as any

  // Create shipping timeline
  const shippingSteps = [
    {
      status: 'ORDERED',
      label: '주문 접수',
      date: formatDate(order.created_at),
      completed: true
    },
    {
      status: 'PAID',
      label: '결제 완료',
      date: formatDate(order.paid_at),
      completed: !!order.paid_at
    },
    {
      status: 'PREPARING',
      label: '상품 준비중',
      date: shipment?.status === 'PREPARING' ? formatDate(shipment?.created_at) : null,
      completed: ['PREPARING', 'SHIPPED', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED'].includes(shipment?.status || '')
    },
    {
      status: 'SHIPPED',
      label: '해외 배송 시작',
      date: formatDate(shipment?.shipped_at),
      completed: !!shipment?.shipped_at,
      trackingNumber: shipment?.tracking_number
    },
    {
      status: 'IN_TRANSIT',
      label: '한국 도착',
      date: null,
      completed: ['IN_TRANSIT', 'CUSTOMS', 'DELIVERED'].includes(shipment?.status || '')
    },
    {
      status: 'CUSTOMS',
      label: '통관중',
      date: null,
      completed: ['CUSTOMS', 'DELIVERED'].includes(shipment?.status || '')
    },
    {
      status: 'DELIVERED',
      label: '배송 완료',
      date: formatDate(shipment?.delivered_at),
      completed: shipment?.status === 'DELIVERED'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link to="/orders" className="text-blue-600 hover:underline">← 주문 목록으로</Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">주문 상세</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">주문 정보</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">주문번호</p>
                <p className="font-medium">{order.order_number}</p>
              </div>
              <div>
                <p className="text-gray-600">주문일시</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">주문상태</p>
                <p className="font-medium">{getStatusLabel(order.status)}</p>
              </div>
              <div>
                <p className="text-gray-600">결제수단</p>
                <p className="font-medium">{getPaymentMethodLabel(order.payment_method)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">배송 추적</h2>
            
            <div className="relative">
              {/* Timeline line */}
              {shippingSteps.length > 1 && (
                <div 
                  className="absolute left-4 w-0.5 bg-gray-300" 
                  style={{ 
                    top: '2rem', 
                    bottom: '2rem',
                    height: `${(shippingSteps.length - 1) * 6}rem`
                  }}
                />
              )}
              
              <div className="space-y-6 relative">
                {shippingSteps.map((step, index) => (
                  <div key={index} className="flex gap-4 relative">
                    <div className={`w-8 h-8 ${step.completed ? getStatusColor(step.status) : 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-sm z-10 flex-shrink-0`}>
                      {step.completed ? '✓' : ''}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`font-medium ${!step.completed ? 'text-gray-400' : ''}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-gray-600">{step.date}</p>
                      )}
                      {step.trackingNumber && (
                        <p className="text-sm text-gray-500">운송장번호: {step.trackingNumber}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
            
            <div className="space-y-4">
              {order.order_items?.map((item, index) => (
                <div key={item.id} className={`flex gap-4 pb-4 ${index < order.order_items.length - 1 ? 'border-b' : ''}`}>
                  <div className="w-20 h-20 bg-gray-200 rounded relative">
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.name_snapshot}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name_snapshot}</h3>
                    <p className="text-sm text-gray-600">
                      {item.products?.brand || '브랜드'} | 수량: {item.quantity}개
                    </p>
                    <p className="font-medium mt-1">₩ {item.subtotal_krw.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
            <div className="text-sm space-y-2">
              <p><span className="text-gray-600">받는분:</span> {shippingAddress?.recipient || '정보 없음'}</p>
              <p><span className="text-gray-600">연락처:</span> {shippingAddress?.phone || '정보 없음'}</p>
              <p>
                <span className="text-gray-600">주소:</span> 
                {shippingAddress ? ` ${shippingAddress.address_line1} ${shippingAddress.address_line2 || ''}` : '정보 없음'}
              </p>
              <p><span className="text-gray-600">통관번호:</span> {order.users?.personal_customs_number || '정보 없음'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">결제 정보</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>상품 합계</span>
                <span>₩ {order.total_product_krw.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>국제 배송비</span>
                <span>₩ {order.total_shipping_krw.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>관부가세</span>
                <span>₩ {order.total_duty_krw.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>서비스 수수료</span>
                <span>₩ {order.total_fee_krw.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>결제 금액</span>
                <span>₩ {order.total_pay_krw.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}