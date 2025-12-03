import { useState } from 'react'

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <form className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품명, 브랜드, 카테고리 검색..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      {searchQuery && (
        <div>
          <p className="mb-4 text-gray-600">'{searchQuery}' 검색 결과</p>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">검색 결과 {i}</h3>
                  <p className="text-gray-600 text-sm mb-2">브랜드명</p>
                  <p className="text-lg font-bold">₩ {(Math.random() * 200000).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500">검색어를 입력하여 상품을 찾아보세요</p>
        </div>
      )}
    </div>
  )
}