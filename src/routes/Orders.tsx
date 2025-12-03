import { Link } from 'react-router-dom'

export default function Orders() {
  const orders = [
    {
      id: 1,
      orderNumber: '2024010001',
      date: '2024-01-15',
      status: '배송완료',
      total: 402670,
      items: 2,
    },
    {
      id: 2,
      orderNumber: '2024010002',
      date: '2024-01-20',
      status: '통관중',
      total: 189900,
      items: 1,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case '배송완료':
        return 'bg-green-100 text-green-800'
      case '통관중':
        return 'bg-yellow-100 text-yellow-800'
      case '배송중':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
                    주문번호: {order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.date} | {order.items}개 상품
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    {order.items > 1 && (
                      <div className="flex items-center text-gray-500">
                        +{order.items - 1}개 더
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold mb-2">
                      ₩ {order.total.toLocaleString()}
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