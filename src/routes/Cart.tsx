import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: '상품 1', price: 89900, quantity: 1 },
    { id: 2, name: '상품 2', price: 129900, quantity: 2 },
  ])

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 15000
  const duty = Math.floor(subtotal * 0.1)
  const fee = 3000
  const total = subtotal + shipping + duty + fee

  return (
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
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-2">₩ {item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-4 text-red-600 hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">주문 요약</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>상품 합계</span>
                  <span>₩ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>국제 배송비</span>
                  <span>₩ {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>예상 관부가세</span>
                  <span>₩ {duty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>서비스 수수료</span>
                  <span>₩ {fee.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>총 결제금액</span>
                  <span>₩ {total.toLocaleString()}</span>
                </div>
              </div>

              <Link 
                to="/checkout"
                className="block w-full mt-6 px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
              >
                결제하기
              </Link>
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
  )
}