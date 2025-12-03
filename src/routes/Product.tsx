import { useParams } from 'react-router-dom'
import { useState } from 'react'

export default function Product() {
  const { productId } = useParams()
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 gap-12">
        <div>
          <div className="bg-gray-200 rounded-lg h-96 mb-4"></div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded h-20"></div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">상품명 {productId}</h1>
          <p className="text-gray-600 mb-4">브랜드명</p>
          
          <div className="border-t border-b py-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">판매가</span>
              <span className="text-2xl font-bold">₩ 129,900</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">예상 관부가세</span>
              <span>₩ 12,990</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">배송비</span>
              <span>₩ 15,000</span>
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
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              바로구매
            </button>
            <button className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
              장바구니
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">배송 정보</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 해외배송: 7-14일</li>
              <li>• 통관: 2-3일</li>
              <li>• 국내배송: 1-2일</li>
              <li>• 전체 예상 소요기간: 10-19일</li>
            </ul>
          </div>
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
          <p className="text-gray-600">
            이 상품은 해외에서 직접 배송되는 상품입니다. 
            관부가세는 예상 금액이며, 실제 부과액과 차이가 있을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}