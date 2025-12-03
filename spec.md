# spec.md – 직구 시그널 스토어 (Jikgu Signal Store) 기술 스펙

> **문서 버전**: 1.0.0  
> **최종 업데이트**: 20XX-XX-XX  
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

## 6. Supabase 데이터베이스 설계 (요약)

### 6.1 주요 테이블

```sql
-- users
create table public.users (
  id            uuid primary key,      -- auth.users.id와 동일
  email         text unique not null,
  name          text,
  phone         text,
  created_at    timestamptz default now()
);

-- user_addresses
create table public.user_addresses (
  id            bigserial primary key,
  user_id       uuid references public.users(id),
  recipient     text not null,
  phone         text,
  postal_code   text,
  address_line1 text,
  address_line2 text,
  is_default    boolean default false,
  created_at    timestamptz default now()
);

-- products
create table public.products (
  id              bigserial primary key,
  external_id     text,
  mall_code       text,
  name_ko         text,
  name_original   text,
  description_ko  text,
  description_original text,
  image_url       text,
  currency        text,
  price_original  numeric(18,2),
  price_krw       numeric(18,2),
  stock_status    text,
  created_at      timestamptz default now()
);

-- carts
create table public.carts (
  id            bigserial primary key,
  user_id       uuid references public.users(id),
  created_at    timestamptz default now()
);

-- cart_items
create table public.cart_items (
  id            bigserial primary key,
  cart_id       bigint references public.carts(id),
  user_id       uuid references public.users(id),
  product_id    bigint references public.products(id),
  quantity      int not null,
  price_krw     numeric(18,2),
  created_at    timestamptz default now()
);

-- orders
create table public.orders (
  id                   bigserial primary key,
  order_number         text unique,
  user_id              uuid references public.users(id),
  status               text,
  total_product_krw    numeric(18,2),
  total_shipping_krw   numeric(18,2),
  total_duty_krw       numeric(18,2),
  total_fee_krw        numeric(18,2),
  total_pay_krw        numeric(18,2),
  created_at           timestamptz default now()
);

-- order_items
create table public.order_items (
  id              bigserial primary key,
  order_id        bigint references public.orders(id),
  product_id      bigint references public.products(id),
  mall_code       text,
  external_id     text,
  name_snapshot   text,
  quantity        int,
  unit_price_krw  numeric(18,2),
  subtotal_krw    numeric(18,2)
);

-- shipments
create table public.shipments (
  id              bigserial primary key,
  order_id        bigint references public.orders(id),
  tracking_number text,
  carrier_code    text,
  status          text,
  origin_country  text,
  destination_country text,
  last_updated_at timestamptz,
  raw_tracking    jsonb
);
```

### 6.2 RLS 개념

- `users`, `user_addresses`, `carts`, `cart_items`, `orders`, `order_items` 등:
  - RLS ON
  - 정책: `user_id = auth.uid()` 인 행만 SELECT/INSERT/UPDATE/DELETE 허용
- FastAPI:
  - `SUPABASE_SERVICE_ROLE_KEY` 사용 → RLS 우회 가능 (서버 전용 로직)

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
