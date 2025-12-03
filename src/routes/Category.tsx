import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types/database'

export default function Category() {
  const { slug } = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [priceFilter, setPriceFilter] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    fetchProducts()
  }, [slug, priceFilter, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

      if (slug) {
        query = query.eq('category', slug)
      }

      // Apply price filters
      if (priceFilter.length > 0) {
        const conditions: string[] = []
        if (priceFilter.includes('0-50000')) {
          conditions.push('price_krw.lte.50000')
        }
        if (priceFilter.includes('50000-100000')) {
          conditions.push('price_krw.gte.50000,price_krw.lte.100000')
        }
        if (priceFilter.includes('100000+')) {
          conditions.push('price_krw.gte.100000')
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price_krw', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price_krw', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePriceFilterChange = (value: string) => {
    setPriceFilter((prev) =>
      prev.includes(value)
        ? prev.filter((f) => f !== value)
        : [...prev, value]
    )
  }

  const categoryNames: { [key: string]: string } = {
    electronics: '전자기기',
    fashion: '패션',
    beauty: '뷰티',
    sports: '스포츠',
    home: '홈/리빙',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">
        카테고리: {categoryNames[slug || ''] || slug}
      </h1>
      
      <div className="flex gap-8">
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">필터</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">가격대</h3>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value="0-50000"
                    checked={priceFilter.includes('0-50000')}
                    onChange={(e) => handlePriceFilterChange(e.target.value)}
                  />
                  <span>₩0 - ₩50,000</span>
                </label>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value="50000-100000"
                    checked={priceFilter.includes('50000-100000')}
                    onChange={(e) => handlePriceFilterChange(e.target.value)}
                  />
                  <span>₩50,000 - ₩100,000</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    value="100000+"
                    checked={priceFilter.includes('100000+')}
                    onChange={(e) => handlePriceFilterChange(e.target.value)}
                  />
                  <span>₩100,000 이상</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">전체 {products.length}개 상품</p>
            <select
              className="border rounded px-3 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">추천순</option>
              <option value="newest">최신순</option>
              <option value="price_asc">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
            </select>
          </div>
          
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
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">해당 카테고리에 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {products.map((product) => (
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
        </main>
      </div>
    </div>
  )
}