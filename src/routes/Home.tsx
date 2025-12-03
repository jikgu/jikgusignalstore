export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">
            해외직구, 이제 쉽고 간편하게!
          </h1>
          <p className="text-xl mb-6">
            여러 해외 쇼핑몰을 한 번에 검색하고, 원화로 간편 결제하세요
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            지금 시작하기
          </button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">인기 카테고리</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <div className="w-16 h-16 bg-blue-100 rounded-lg mb-4"></div>
            <h3 className="font-semibold">전자기기</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <div className="w-16 h-16 bg-pink-100 rounded-lg mb-4"></div>
            <h3 className="font-semibold">패션</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <div className="w-16 h-16 bg-green-100 rounded-lg mb-4"></div>
            <h3 className="font-semibold">뷰티</h3>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <div className="w-16 h-16 bg-yellow-100 rounded-lg mb-4"></div>
            <h3 className="font-semibold">스포츠</h3>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">추천 상품</h2>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">상품명 {i}</h3>
                <p className="text-gray-600 text-sm mb-2">브랜드명</p>
                <p className="text-lg font-bold">₩ 99,900</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 bg-gray-100 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">직구 시그널 스토어만의 특별함</h2>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-2 text-lg">원화 결제</h3>
            <p className="text-gray-600">
              환율 걱정 없이 원화로 최종 금액을 확인하고 결제하세요
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-lg">통합 배송 추적</h3>
            <p className="text-gray-600">
              해외배송부터 국내배송까지 한눈에 확인 가능합니다
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-lg">관부가세 대행</h3>
            <p className="text-gray-600">
              복잡한 통관 절차를 대신 처리해드립니다
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}