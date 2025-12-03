import { useState } from 'react'

export default function Help() {
  const [activeTab, setActiveTab] = useState('faq')

  const faqs = [
    {
      question: '해외직구 시 관부가세는 어떻게 계산되나요?',
      answer: '관부가세는 상품가격과 배송비를 합한 금액이 15만원을 초과할 경우 부과됩니다. 일반적으로 과세가격의 약 10% 정도가 부과되며, 정확한 금액은 통관 시 결정됩니다.'
    },
    {
      question: '배송 기간은 얼마나 걸리나요?',
      answer: '해외배송 7-14일, 통관 2-3일, 국내배송 1-2일로 총 10-19일 정도 소요됩니다. 다만 통관 상황에 따라 지연될 수 있습니다.'
    },
    {
      question: '환불/반품은 가능한가요?',
      answer: '단순 변심에 의한 반품은 왕복 국제배송비를 부담하셔야 합니다. 상품 하자의 경우 판매자와 협의 후 무료 반품이 가능합니다.'
    },
    {
      question: '개인통관고유부호는 어떻게 발급받나요?',
      answer: '관세청 홈페이지 또는 모바일 앱에서 본인인증 후 무료로 발급받을 수 있습니다. 한 번 발급받으면 평생 사용 가능합니다.'
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">고객센터</h1>

      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">고객센터 운영시간</h2>
        <p className="text-gray-700">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
        <p className="text-gray-700">전화: 1588-0000 | 이메일: help@jikgusignal.com</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'faq'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              자주 묻는 질문
            </button>
            <button
              onClick={() => setActiveTab('inquiry')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'inquiry'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1:1 문의
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'guide'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              이용가이드
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="border rounded-lg">
                  <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                    <span className="font-medium">Q. {faq.question}</span>
                  </summary>
                  <div className="px-4 py-3 border-t bg-gray-50">
                    <p className="text-gray-700">A. {faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'inquiry' && (
            <div className="max-w-2xl">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">문의 유형</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>주문/결제</option>
                    <option>배송</option>
                    <option>환불/반품</option>
                    <option>회원정보</option>
                    <option>기타</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">제목</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="문의 제목을 입력해주세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">내용</label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="문의 내용을 자세히 입력해주세요"
                  />
                </div>
                
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  문의 등록
                </button>
              </form>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">직구 시그널 스토어 이용 가이드</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">1. 회원가입 및 로그인</h4>
                  <p className="text-gray-700">이메일 주소로 간편하게 회원가입이 가능합니다. 개인통관고유부호는 마이페이지에서 등록해주세요.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">2. 상품 검색 및 선택</h4>
                  <p className="text-gray-700">카테고리별 브라우징 또는 검색 기능을 통해 원하는 상품을 찾을 수 있습니다. 모든 가격은 원화로 표시됩니다.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">3. 장바구니 및 결제</h4>
                  <p className="text-gray-700">장바구니에서 예상 관부가세와 배송비를 포함한 최종 금액을 확인할 수 있습니다. 다양한 결제수단을 지원합니다.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">4. 배송 추적</h4>
                  <p className="text-gray-700">주문 내역 페이지에서 해외배송부터 국내배송까지 실시간으로 추적할 수 있습니다.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">5. 수령 및 A/S</h4>
                  <p className="text-gray-700">상품 수령 후 문제가 있을 경우 고객센터를 통해 문의해주세요. 상품별 A/S 정책을 안내해드립니다.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}