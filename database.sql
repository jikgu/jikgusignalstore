-- =====================================================
-- 직구 시그널 스토어 (Jikgu Signal Store) Database Schema
-- =====================================================

-- =====================================================
-- 0. 기존 테이블 삭제 (의존성 순서 고려)
-- =====================================================

-- 먼저 외래키 의존성이 있는 테이블부터 삭제
DROP TABLE IF EXISTS public.shipments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.user_addresses CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 시퀀스도 삭제
DROP SEQUENCE IF EXISTS order_number_seq CASCADE;

-- =====================================================
-- 1. 테이블 생성
-- =====================================================

-- 1.1 Users 테이블 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  personal_customs_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users 테이블 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1.2 User Addresses 테이블
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- RLS 활성화
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 1.3 Products 테이블
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT,
  mall_code TEXT,
  name_ko TEXT NOT NULL,
  name_original TEXT,
  description_ko TEXT,
  description_original TEXT,
  category TEXT,
  brand TEXT,
  image_url TEXT,
  additional_images JSONB DEFAULT '[]',
  currency TEXT DEFAULT 'USD',
  price_original DECIMAL(18,2),
  price_krw DECIMAL(18,2) NOT NULL,
  weight_kg DECIMAL(10,3),
  dimensions JSONB,
  stock_status TEXT DEFAULT 'IN_STOCK',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_products_mall_external ON public.products(mall_code, external_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

-- RLS 활성화
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1.4 Carts 테이블
CREATE TABLE IF NOT EXISTS public.carts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS 활성화
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- 1.5 Cart Items 테이블
CREATE TABLE IF NOT EXISTS public.cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id BIGINT NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  price_krw DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- RLS 활성화
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 주문번호 시퀀스 생성
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- 1.6 Orders 테이블
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL DEFAULT CONCAT('ORD', TO_CHAR(NOW(), 'YYYYMMDD'), LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0')),
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  address_id BIGINT REFERENCES public.user_addresses(id),
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'PENDING',
  total_product_krw DECIMAL(18,2) NOT NULL,
  total_shipping_krw DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_duty_krw DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_fee_krw DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_pay_krw DECIMAL(18,2) NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- RLS 활성화
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 1.7 Order Items 테이블
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id),
  mall_code TEXT,
  external_id TEXT,
  name_snapshot TEXT NOT NULL,
  price_snapshot JSONB,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price_krw DECIMAL(18,2) NOT NULL,
  subtotal_krw DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- RLS 활성화
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 1.8 Shipments 테이블
CREATE TABLE IF NOT EXISTS public.shipments (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_number TEXT,
  carrier_code TEXT,
  carrier_name TEXT,
  status TEXT DEFAULT 'PREPARING',
  origin_country TEXT DEFAULT 'US',
  destination_country TEXT DEFAULT 'KR',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  raw_tracking JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);

-- RLS 활성화
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 1.9 Categories 테이블
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  icon_color TEXT DEFAULT 'bg-gray-100',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

-- RLS 활성화 (읽기는 모두 가능, 쓰기는 service_role만)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Row Level Security (RLS) 정책
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

-- 2.1 Users 테이블 정책
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2.2 User Addresses 테이블 정책
CREATE POLICY "Users can view own addresses" 
  ON public.user_addresses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" 
  ON public.user_addresses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" 
  ON public.user_addresses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" 
  ON public.user_addresses FOR DELETE 
  USING (auth.uid() = user_id);

-- 2.3 Products 테이블 정책
CREATE POLICY "Anyone can view products" 
  ON public.products FOR SELECT 
  USING (true);

-- 2.4 Carts 테이블 정책
CREATE POLICY "Users can manage own cart" 
  ON public.carts FOR ALL 
  USING (auth.uid() = user_id);

-- 2.5 Cart Items 테이블 정책
CREATE POLICY "Users can manage own cart items" 
  ON public.cart_items FOR ALL 
  USING (auth.uid() = user_id);

-- 2.6 Orders 테이블 정책
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

-- 2.7 Order Items 테이블 정책
CREATE POLICY "Users can view own order items" 
  ON public.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- 2.8 Shipments 테이블 정책
CREATE POLICY "Users can view own shipments" 
  ON public.shipments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = shipments.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- 2.9 Categories 테이블 정책
CREATE POLICY "Anyone can view categories" 
  ON public.categories FOR SELECT 
  USING (true);

-- =====================================================
-- 3. 트리거 및 함수
-- =====================================================

-- 3.1 updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.2 사용자 생성 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  
  -- 장바구니도 자동 생성
  INSERT INTO public.carts (user_id, created_at, updated_at)
  VALUES (new.id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 4. 샘플 데이터
-- =====================================================

-- 카테고리 데이터
INSERT INTO public.categories (id, name_ko, name_en, icon_color, display_order, is_active) VALUES
('electronics', '전자기기', 'Electronics', 'bg-blue-100', 1, true),
('fashion', '패션', 'Fashion', 'bg-pink-100', 2, true),
('beauty', '뷰티', 'Beauty', 'bg-green-100', 3, true),
('sports', '스포츠', 'Sports', 'bg-yellow-100', 4, true),
('home', '홈/리빙', 'Home & Living', 'bg-purple-100', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 전자기기 카테고리
INSERT INTO public.products (
  name_ko, name_original, description_ko, category, brand,
  price_krw, mall_code, external_id, image_url, stock_status
) VALUES 
(
  '애플 에어팟 프로 2세대',
  'Apple AirPods Pro (2nd generation)',
  '액티브 노이즈 캔슬링과 적응형 오디오 기능을 갖춘 프리미엄 무선 이어폰',
  'electronics',
  'Apple',
  329000,
  'AMAZON',
  'B0D1XD1ZV3',
  'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
  'IN_STOCK'
),
(
  '소니 WH-1000XM5 헤드폰',
  'Sony WH-1000XM5',
  '업계 최고 수준의 노이즈 캔슬링 무선 헤드폰',
  'electronics',
  'Sony',
  459000,
  'AMAZON',
  'B09XS7JWHH',
  'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500',
  'IN_STOCK'
),
(
  '다이슨 에어랩 스타일러',
  'Dyson Airwrap Styler',
  '열 손상 없이 스타일링하는 혁신적인 헤어 스타일러',
  'electronics',
  'Dyson',
  689000,
  'AMAZON',
  'B09QQ6KYLB',
  'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500',
  'IN_STOCK'
);

-- 패션 카테고리
INSERT INTO public.products (
  name_ko, name_original, description_ko, category, brand,
  price_krw, mall_code, external_id, image_url, stock_status
) VALUES 
(
  '나이키 에어 조던 1 레트로 하이',
  'Nike Air Jordan 1 Retro High OG',
  '클래식 농구화 디자인의 아이콘',
  'fashion',
  'Nike',
  239000,
  'STOCKX',
  'DZ5485-410',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500',
  'IN_STOCK'
),
(
  '노스페이스 눕시 자켓',
  'The North Face 1996 Retro Nuptse Jacket',
  '겨울 필수템 레트로 다운 자켓',
  'fashion',
  'The North Face',
  389000,
  'AMAZON',
  'NF0A3C8D',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
  'IN_STOCK'
),
(
  '루이비통 네버풀 MM',
  'Louis Vuitton Neverfull MM',
  '타임리스한 디자인의 토트백',
  'fashion',
  'Louis Vuitton',
  2150000,
  'LV_OFFICIAL',
  'M40156',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
  'LIMITED'
);

-- 뷰티 카테고리
INSERT INTO public.products (
  name_ko, name_original, description_ko, category, brand,
  price_krw, mall_code, external_id, image_url, stock_status
) VALUES 
(
  'SK-II 페이셜 트리트먼트 에센스',
  'SK-II Facial Treatment Essence',
  '피테라™ 90% 이상 함유한 베스트셀러 에센스',
  'beauty',
  'SK-II',
  289000,
  'SEPHORA',
  'P375853',
  'https://images.unsplash.com/photo-1570194065650-d99fb4b38e39?w=500',
  'IN_STOCK'
),
(
  '라메르 크렘 드 라 메르',
  'La Mer Crème de la Mer',
  '미라클 브로스™가 함유된 럭셔리 보습 크림',
  'beauty',
  'La Mer',
  485000,
  'SEPHORA',
  'P417155',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
  'IN_STOCK'
),
(
  '입생로랑 루쥬 볼립떼 샤인',
  'YSL Rouge Volupté Shine',
  '촉촉한 발색의 럭셔리 립스틱',
  'beauty',
  'YSL',
  58000,
  'SEPHORA',
  'P377710',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
  'IN_STOCK'
);

-- 스포츠/아웃도어 카테고리
INSERT INTO public.products (
  name_ko, name_original, description_ko, category, brand,
  price_krw, mall_code, external_id, image_url, stock_status
) VALUES 
(
  '가민 피닉스 7 프로',
  'Garmin Fenix 7 Pro',
  '프리미엄 GPS 멀티스포츠 스마트워치',
  'sports',
  'Garmin',
  989000,
  'AMAZON',
  'B0B8KQXVS2',
  'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=500',
  'IN_STOCK'
),
(
  '예티 텀블러 30oz',
  'YETI Rambler 30oz Tumbler',
  '진공 단열 스테인리스 텀블러',
  'sports',
  'YETI',
  65000,
  'AMAZON',
  'B07VMGVZ9Y',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
  'IN_STOCK'
),
(
  '룰루레몬 얼라인 레깅스',
  'Lululemon Align High-Rise Pant',
  '부드러운 착용감의 요가 레깅스',
  'sports',
  'Lululemon',
  148000,
  'LULULEMON',
  'LW5BWLS',
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500',
  'IN_STOCK'
);

-- 홈/리빙 카테고리
INSERT INTO public.products (
  name_ko, name_original, description_ko, category, brand,
  price_krw, mall_code, external_id, image_url, stock_status
) VALUES 
(
  '네스프레소 버츄오 넥스트',
  'Nespresso Vertuo Next',
  '원터치 커피 & 에스프레소 머신',
  'home',
  'Nespresso',
  259000,
  'AMAZON',
  'B084GTH187',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
  'IN_STOCK'
),
(
  '르크루제 시그니처 더치오븐',
  'Le Creuset Signature Dutch Oven',
  '프랑스 전통 주철 냄비 5.5쿼트',
  'home',
  'Le Creuset',
  459000,
  'WILLIAMS_SONOMA',
  'LC-21177255902430',
  'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500',
  'IN_STOCK'
),
(
  '다이슨 V15 디텍트 무선청소기',
  'Dyson V15 Detect',
  '레이저로 먼지를 감지하는 최신 무선청소기',
  'home',
  'Dyson',
  899000,
  'AMAZON',
  'B09FXKBMFP',
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500',
  'IN_STOCK'
);

-- =====================================================
-- 5. 추가 인덱스 및 최적화 (선택사항)
-- =====================================================

-- 전문 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_products_name_ko ON public.products USING gin(to_tsvector('simple', name_ko));
CREATE INDEX IF NOT EXISTS idx_products_price_range ON public.products(price_krw);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(user_id, created_at DESC);

-- 통계 업데이트
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;