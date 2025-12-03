import { useParams, Link } from 'react-router-dom'

export default function OrderDetail() {
  const { orderId } = useParams()
  console.log('Order ID:', orderId)

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
                <p className="font-medium">2024010001</p>
              </div>
              <div>
                <p className="text-gray-600">주문일시</p>
                <p className="font-medium">2024-01-15 14:23:45</p>
              </div>
              <div>
                <p className="text-gray-600">주문상태</p>
                <p className="font-medium">배송완료</p>
              </div>
              <div>
                <p className="text-gray-600">결제수단</p>
                <p className="font-medium">신용카드</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">배송 추적</h2>
            
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div className="flex-1">
                    <p className="font-medium">배송 완료</p>
                    <p className="text-sm text-gray-600">2024-01-25 15:30</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div className="flex-1">
                    <p className="font-medium">국내 배송 시작</p>
                    <p className="text-sm text-gray-600">2024-01-24 09:00</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div className="flex-1">
                    <p className="font-medium">통관 완료</p>
                    <p className="text-sm text-gray-600">2024-01-23 16:45</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div className="flex-1">
                    <p className="font-medium">한국 도착</p>
                    <p className="text-sm text-gray-600">2024-01-22 11:20</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div className="flex-1">
                    <p className="font-medium">해외 배송 시작</p>
                    <p className="text-sm text-gray-600">2024-01-16 08:00</p>
                    <p className="text-sm text-gray-500">운송장번호: ABC123456789</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div className="flex-1">
                    <p className="font-medium">주문 접수</p>
                    <p className="text-sm text-gray-600">2024-01-15 14:23</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 pb-4 border-b">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <h3 className="font-medium">상품명 1</h3>
                  <p className="text-sm text-gray-600">브랜드 | 수량: 1개</p>
                  <p className="font-medium mt-1">₩ 189,900</p>
                </div>
              </div>
              
              <div className="flex gap-4 pb-4">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <h3 className="font-medium">상품명 2</h3>
                  <p className="text-sm text-gray-600">브랜드 | 수량: 1개</p>
                  <p className="font-medium mt-1">₩ 159,800</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
            <div className="text-sm space-y-2">
              <p><span className="text-gray-600">받는분:</span> 홍길동</p>
              <p><span className="text-gray-600">연락처:</span> 010-1234-5678</p>
              <p><span className="text-gray-600">주소:</span> 서울시 강남구 테헤란로 123, 101동 202호</p>
              <p><span className="text-gray-600">통관번호:</span> P123456789012</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">결제 정보</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>상품 합계</span>
                <span>₩ 349,700</span>
              </div>
              <div className="flex justify-between">
                <span>국제 배송비</span>
                <span>₩ 15,000</span>
              </div>
              <div className="flex justify-between">
                <span>관부가세</span>
                <span>₩ 34,970</span>
              </div>
              <div className="flex justify-between">
                <span>서비스 수수료</span>
                <span>₩ 3,000</span>
              </div>
            </div>
            
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>결제 금액</span>
                <span>₩ 402,670</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}