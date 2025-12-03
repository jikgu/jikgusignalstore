import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types/database'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(6)

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: '전자기기', slug: 'electronics', color: 'bg-blue-100' },
    { name: '패션', slug: 'fashion', color: 'bg-pink-100' },
    { name: '뷰티', slug: 'beauty', color: 'bg-green-100' },
    { name: '스포츠', slug: 'sports', color: 'bg-yellow-100' },
  ]

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
          <Link 
            to="/search"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            지금 시작하기
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">인기 카테고리</h2>
        <div className="grid grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className={`w-16 h-16 ${category.color} rounded-lg mb-4`}></div>
              <h3 className="font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">추천 상품</h2>
        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="w-full h-48 bg-gray-200 relative">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name_ko}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name_ko}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                  <p className="text-lg font-bold">₩ {product.price_krw.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
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