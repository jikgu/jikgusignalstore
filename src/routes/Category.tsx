import { useParams } from 'react-router-dom'

export default function Category() {
  const { slug } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">카테고리: {slug}</h1>
      
      <div className="flex gap-8">
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">필터</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">가격대</h3>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>₩0 - ₩50,000</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>₩50,000 - ₩100,000</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>₩100,000 이상</span>
                </label>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">쇼핑몰</h3>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Amazon</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>eBay</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Rakuten</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">전체 24개 상품</p>
            <select className="border rounded px-3 py-2">
              <option>추천순</option>
              <option>최신순</option>
              <option>가격 낮은순</option>
              <option>가격 높은순</option>
            </select>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">상품명 {i}</h3>
                  <p className="text-gray-600 text-sm mb-2">브랜드명</p>
                  <p className="text-lg font-bold">₩ {(Math.random() * 200000).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}