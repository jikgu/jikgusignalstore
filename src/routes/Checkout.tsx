import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('CARD')

  const handleCheckout = async () => {
    // TODO: Implement actual checkout logic
    alert('결제가 완료되었습니다!')
    navigate('/orders')
  }

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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">연락처</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="010-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">우편번호</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
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
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="상세 주소"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">개인통관고유부호</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="P123456789012"
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
                <span>₩ 349,700</span>
              </div>
              <div className="flex justify-between">
                <span>국제 배송비</span>
                <span>₩ 15,000</span>
              </div>
              <div className="flex justify-between">
                <span>예상 관부가세</span>
                <span>₩ 34,970</span>
              </div>
              <div className="flex justify-between">
                <span>서비스 수수료</span>
                <span>₩ 3,000</span>
              </div>
            </div>
            
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>총 결제금액</span>
                <span>₩ 402,670</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              402,670원 결제하기
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