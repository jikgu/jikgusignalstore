import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Order } from '../types/database'
import type { User } from '@supabase/supabase-js'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAndFetchOrders()
  }, [])

  const checkUserAndFetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/mypage')
        return
      }
      setUser(user)

      // Fetch orders with item count
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!inner (
            id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Process orders to include item count
      const processedOrders = ordersData?.map(order => ({
        ...order,
        itemCount: order.order_items?.length || 0
      })) || []

      setOrders(processedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'SHIPPING':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMS':
        return 'bg-yellow-100 text-yellow-800'
      case 'PREPARING':
        return 'bg-gray-100 text-gray-800'
      case 'PAID':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '결제 대기'
      case 'PAID': return '결제 완료'
      case 'PREPARING': return '상품 준비중'
      case 'SHIPPING': return '배송중'
      case 'CUSTOMS': return '통관중'
      case 'DELIVERED': return '배송완료'
      case 'CANCELLED': return '주문취소'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">주문 내역</h1>
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link to="/mypage" className="text-blue-600 hover:underline">로그인하기</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">주문 내역이 없습니다</p>
          <Link to="/" className="text-blue-600 hover:underline">쇼핑 시작하기</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    주문번호: {order.order_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at || '').toLocaleDateString('ko-KR')} | {order.itemCount || 0}개 상품
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <div>상품 금액: ₩ {order.total_product_krw.toLocaleString()}</div>
                    <div>배송비: ₩ {order.total_shipping_krw.toLocaleString()}</div>
                    <div>관부가세: ₩ {order.total_duty_krw.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold mb-2">
                      총 ₩ {order.total_pay_krw.toLocaleString()}
                    </p>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      주문 상세보기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}