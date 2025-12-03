# spec.md – 직구 시그널 스토어 (Jikgu Signal Store) 기술 스펙

> **문서 버전**: 2.0.0  
> **최종 업데이트**: 2024-12-04  
> **구현 상태**: 완료  
> **관련 문서**: `prd.md`, ERD, Swagger/OpenAPI 스펙  
> **Vercel 프로젝트명**: `jikgusignalstore`

---

## 1. 시스템 개요

직구 시그널 스토어는 단일 Vercel 프로젝트 `jikgusignalstore` 안에서 다음 구조로 동작한다.

- **프론트엔드**  
  - Vite + React + TypeScript  
  - 정적 빌드를 통해 `dist/` 디렉토리를 Vercel에서 서빙

- **백엔드**  
  - `/api/index.py`에 FastAPI 앱 정의  
  - Vercel Python Runtime 기반 Serverless Function으로 배포  
  - 모든 백엔드 HTTP 엔드포인트는 `/api/...` 경로를 사용

- **데이터/인증**  
  - Supabase(Postgres + Auth) 사용  
  - 프론트: `supabase-js` + **anon key** (RLS 기반)  
  - 백엔드: `supabase-py` + **service_role key** (민감 로직/배치/관리자)

---

## 2. 기술 스택 요약

### 2.1 프론트엔드

- 프레임워크: Vite + React + TypeScript
- 라우팅: React Router
- 스타일: TailwindCSS
- 상태 관리: React Query / Zustand (선택)
- API 호출:
  - Supabase JS SDK (`@supabase/supabase-js`)
  - 브라우저 `fetch` 를 이용해 `/api/...` FastAPI 호출

### 2.2 백엔드

- 언어: Python 3.11
- 프레임워크: FastAPI (ASGI)
- 배포: Vercel Python Runtime(Serverless Functions)
- 라이브러리:
  - `supabase-py` – Supabase Postgres 연동 (service_role)
  - `httpx` – 외부 API(PG, 환율, 배송사 등) 호출
  - `python-dotenv` – 로컬 개발 시 환경 변수 로딩

### 2.3 데이터 & 인프라

- Supabase Postgres (Managed)
- Supabase Auth (이메일/비밀번호, 추후 소셜 로그인 확장 가능)
- Row Level Security(RLS) 기반 권한 관리
- Vercel Edge Network를 통한 정적 자산 및 함수 서빙

---

## 3. 프로젝트 구조

```bash
jikgusignalstore/
├── package.json
├── vite.config.mts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/              # 페이지 컴포넌트 라우트
│   ├── api/                 # 프론트에서 사용하는 fetch 클라이언트 모듈
│   └── lib/
│       └── supabaseClient.ts
├── api/
│   └── index.py             # FastAPI 앱 (Vercel Serverless Function)
├── requirements.txt         # Python 의존성
└── vercel.json              # SPA + /api 라우팅 설정
```

### 3.1 vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- `/api/*` 요청은 FastAPI 서버리스 함수로 라우팅
- 그 외 경로는 모두 `index.html` 로 돌려 SPA 라우팅 유지

---

## 4. 프론트엔드 상세

### 4.1 주요 라우트

- `/` – 메인(추천/기획전)
- `/category/:slug` – 카테고리별 상품 목록
- `/search` – 검색 결과
- `/product/:productId` – 상품 상세
- `/cart` – 장바구니
- `/checkout` – 결제/주문 확인
- `/orders` – 주문 목록
- `/orders/:orderId` – 주문 상세 및 배송/통관 상태
- `/mypage` – 내 정보/주소/개인통관고유부호
- `/help` – 고객센터
- `/admin/*` – 관리자용 페이지(권한 필요)

### 4.2 Supabase 클라이언트

```ts
// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4.3 프론트 → Supabase 직접 호출 범위

- Auth:
  - 회원가입, 로그인, 로그아웃, 세션 유지
- 사용자 데이터:
  - `users` (profile), `user_addresses` – 내 정보/주소 CRUD
- 장바구니:
  - `carts`, `cart_items` – 장바구니 CRUD
- 주문 조회:
  - `orders`, `order_items` – **조회 전용** (본인 주문만, RLS)

### 4.4 프론트 → FastAPI (`/api`) 호출 범위

- `/api/checkout` – 결제 & 주문 생성 전체 플로우
- `/api/admin/*` – 관리자용 상품/주문 관리
- `/api/webhooks/*` – PG/배송사 webhook 수신 (서버 간 통신, 프론트 직접 호출 X)

---

## 5. 백엔드(FastAPI) 상세

### 5.1 requirements.txt

```txt
fastapi
uvicorn
python-dotenv
supabase-py
httpx
```

### 5.2 FastAPI 엔트리포인트 – `api/index.py`

```python
# api/index.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Supabase env vars not set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 초기 개발용, 운영 시 도메인 제한 예정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "jikgusignalstore"}
```

### 5.3 Checkout API 개략

```python
from pydantic import BaseModel
from typing import Optional, List


class CheckoutRequest(BaseModel):
    user_id: str
    address_id: int
    payment_method: str  # "CARD", "KAKAO_PAY" 등


class CheckoutResponse(BaseModel):
    order_id: int
    order_number: str
    payment_status: str
    payment_redirect_url: Optional[str] = None


@app.post("/api/checkout", response_model=CheckoutResponse)
def checkout(body: CheckoutRequest):
    # 1. 유저/주소 검증
    user = (
        supabase.table("users")
        .select("*")
        .eq("id", body.user_id)
        .single()
        .execute()
        .data
    )
    if not user:
        raise HTTPException(status_code=400, detail="Invalid user")

    address = (
        supabase.table("user_addresses")
        .select("*")
        .eq("id", body.address_id)
        .eq("user_id", body.user_id)
        .single()
        .execute()
        .data
    )
    if not address:
        raise HTTPException(status_code=400, detail="Invalid address")

    # 2. 장바구니 조회
    cart_items = (
        supabase.table("cart_items")
        .select("*, products(*)")
        .eq("user_id", body.user_id)
        .execute()
        .data
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 3. 가격 계산 (예시)
    total_product_krw = sum(
        item["price_krw"] * item["quantity"] for item in cart_items
    )
    shipping_krw = 10000  # TODO: 실제 로직으로 교체
    duty_krw = 0          # TODO: 관부가세 로직 반영
    fee_krw = 3000        # TODO: 서비스 수수료 정책 반영
    total_pay_krw = total_product_krw + shipping_krw + duty_krw + fee_krw

    # 4. PG 결제 요청 (TODO: httpx로 PG API 호출)
    payment_status = "PAID"  # 초기 MVP에서는 간소화

    # 5. 주문 생성
    order_res = (
        supabase.table("orders")
        .insert(
            {
                "user_id": body.user_id,
                "status": payment_status,
                "total_product_krw": total_product_krw,
                "total_shipping_krw": shipping_krw,
                "total_duty_krw": duty_krw,
                "total_fee_krw": fee_krw,
                "total_pay_krw": total_pay_krw,
            }
        )
        .execute()
    )
    order = order_res.data[0]
    order_id = order["id"]

    # TODO: order_items 생성, cart_items 삭제 로직 추가

    return CheckoutResponse(
        order_id=order_id,
        order_number=str(order_id),
        payment_status=payment_status,
    )
```

> 실제 구현 시: 예외 처리, PG 실패/재시도, 트랜잭션 보완 필요.

---

## 6. Supabase 데이터베이스 설계

### 6.1 주요 테이블 (9개)

#### 1. users - 사용자 프로필
```sql
create table public.users (
  id                       uuid primary key references auth.users(id),
  email                    text unique not null,
  name                     text,
  phone                    text,
  personal_customs_number  text,  -- 개인통관고유부호
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);
```

#### 2. user_addresses - 배송 주소
```sql
create table public.user_addresses (
  id            bigserial primary key,
  user_id       uuid references public.users(id) on delete cascade,
  recipient     text not null,
  phone         text not null,
  postal_code   text not null,
  address_line1 text not null,
  address_line2 text,
  is_default    boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

#### 3. categories - 상품 카테고리
```sql
create table public.categories (
  id            text primary key,
  name_ko       text not null,
  name_en       text,
  icon_color    text default 'bg-gray-100',
  display_order int default 0,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

#### 4. products - 상품
```sql
create table public.products (
  id                    bigserial primary key,
  external_id           text,
  mall_code             text,
  name_ko               text not null,
  name_original         text,
  description_ko        text,
  description_original  text,
  category              text,  -- categories.id 참조
  brand                 text,
  image_url             text,
  additional_images     jsonb default '[]',
  currency              text default 'USD',
  price_original        decimal(18,2),
  price_krw             decimal(18,2) not null,
  weight_kg             decimal(10,3),
  dimensions            jsonb,
  stock_status          text default 'IN_STOCK',
  is_active             boolean default true,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
```

#### 5. carts - 장바구니
```sql
create table public.carts (
  id         bigserial primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)  -- 사용자당 하나의 장바구니
);
```

#### 6. cart_items - 장바구니 항목
```sql
create table public.cart_items (
  id         bigserial primary key,
  cart_id    bigint not null references public.carts(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  product_id bigint not null references public.products(id),
  quantity   int not null check (quantity > 0),
  price_krw  decimal(18,2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(cart_id, product_id)  -- 중복 상품 방지
);
```

#### 7. orders - 주문
```sql
create table public.orders (
  id                  bigserial primary key,
  order_number        text unique not null default concat('ORD', to_char(now(), 'YYYYMMDD'), lpad(nextval('order_number_seq')::text, 6, '0')),
  user_id             uuid not null references public.users(id),
  status              text not null default 'PENDING',  -- PENDING, PAID, SHIPPING, DELIVERED, CANCELLED
  address_id          bigint references public.user_addresses(id),
  shipping_address    jsonb not null,  -- 스냅샷 저장
  payment_method      text,  -- CARD, KAKAO_PAY, NAVER_PAY
  payment_status      text default 'PENDING',  -- PENDING, PAID, FAILED, REFUNDED
  total_product_krw   decimal(18,2) not null,
  total_shipping_krw  decimal(18,2) not null default 0,
  total_duty_krw      decimal(18,2) not null default 0,
  total_fee_krw       decimal(18,2) not null default 0,
  total_pay_krw       decimal(18,2) not null,
  paid_at             timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
```

#### 8. order_items - 주문 상품
```sql
create table public.order_items (
  id             bigserial primary key,
  order_id       bigint not null references public.orders(id) on delete cascade,
  product_id     bigint not null references public.products(id),
  mall_code      text,
  external_id    text,
  name_snapshot  text not null,  -- 주문 시점 상품명
  price_snapshot jsonb,  -- 주문 시점 상품 정보
  quantity       int not null check (quantity > 0),
  unit_price_krw decimal(18,2) not null,
  subtotal_krw   decimal(18,2) not null,
  created_at     timestamptz default now()
);
```

#### 9. shipments - 배송 정보
```sql
create table public.shipments (
  id                  bigserial primary key,
  order_id            bigint not null references public.orders(id) on delete cascade,
  tracking_number     text,
  carrier_code        text,
  carrier_name        text,
  status              text default 'PREPARING',  -- PREPARING, SHIPPED, IN_TRANSIT, DELIVERED
  origin_country      text default 'US',
  destination_country text default 'KR',
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  last_updated_at     timestamptz,
  raw_tracking        jsonb,  -- 외부 API 원본 데이터
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
```

### 6.2 인덱스 전략

```sql
-- 검색 및 필터링 성능 최적화
CREATE INDEX idx_products_mall_external ON products(mall_code, external_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name_ko ON products USING gin(to_tsvector('simple', name_ko));
CREATE INDEX idx_products_price_range ON products(price_krw);

-- 사용자별 조회 최적화
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);

-- 카테고리 정렬
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_order ON categories(display_order);
```

### 6.3 Row Level Security (RLS) 정책

#### 사용자 데이터 보호
```sql
-- Users: 본인 데이터만 접근
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- User Addresses: 본인 주소만 관리
CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

-- Carts & Cart Items: 본인 장바구니만 관리
CREATE POLICY "Users can manage own cart" ON carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cart items" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders: 본인 주문만 조회 (생성은 서버에서만)
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can view own shipments" ON shipments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid()));
```

#### 공개 데이터
```sql
-- Products & Categories: 모든 사용자 조회 가능
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
```

#### 서버 권한
- FastAPI는 `SUPABASE_SERVICE_ROLE_KEY` 사용으로 RLS 우회
- 주문 생성, 재고 업데이트, 관리자 기능 등 서버에서만 수행

### 6.4 트리거 및 함수

#### updated_at 자동 업데이트
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (다른 테이블도 동일하게 적용)
```

#### 사용자 가입 시 자동 프로필 및 장바구니 생성
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 사용자 프로필 생성
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  
  -- 장바구니 자동 생성
  INSERT INTO public.carts (user_id, created_at, updated_at)
  VALUES (new.id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6.5 샘플 데이터

- **카테고리 5개**: 전자기기, 패션, 뷰티, 스포츠, 홈/리빙
- **상품 15개**: 각 카테고리별 3개씩 인기 상품
  - 전자기기: 에어팟 프로, 소니 헤드폰, 다이슨 에어랩
  - 패션: 나이키 조던, 노스페이스 눕시, 루이비통 네버풀
  - 뷰티: SK-II 에센스, 라메르 크림, YSL 립스틱
  - 스포츠: 가민 워치, 예티 텀블러, 룰루레몬 레깅스
  - 홈/리빙: 네스프레소, 르크루제, 다이슨 청소기

---

## 7. 환경 변수

### 7.1 프론트 (Vite)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 7.2 백엔드 (Vercel Project: jikgusignalstore)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

PG_API_KEY=...
PG_MERCHANT_ID=...
FX_API_KEY=...
SHIPPING_API_KEY=...
```

---

## 8. 로컬 개발 & 배포

### 8.1 로컬 개발

- Supabase:
  - 실제 Supabase 프로젝트 사용 또는 `supabase start` 로컬 개발 환경
- 프론트:
  - `npm install`
  - `npm run dev`
- 백엔드:
  - `uvicorn api.index:app --reload --port 8000` (직접 호출 테스트용)
  - Vercel Dev CLI 사용 시: `vercel dev`

### 8.2 Vercel 배포

- GitHub 레포를 Vercel 프로젝트 `jikgusignalstore` 에 연결
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- `/api/index.py` 는 자동으로 Python Serverless Function으로 배포
- `main` 브랜치 push 시 Production 배포, 기타 브랜치 push 시 Preview 배포

---

## 9. 로깅 & 모니터링

- Vercel 로그:
  - FastAPI 에러, 응답 시간, 요청량
- Supabase:
  - DB 쿼리/에러 로그
- 중요 이벤트:
  - 결제 실패, 주문 생성 실패, 배송 상태 업데이트 실패 → 추후 Slack/Webhook 알림 연동 고려

---

## 10. 향후 확장 포인트

- 다국어 UI(영어/일본어) 지원
- 판매자/셀러 포털 및 입점 시스템
- 추천/개인화(구매/조회 이력 기반)
- Supabase Edge Functions 또는 Vercel Cron Jobs로 일부 배치 로직 이전
