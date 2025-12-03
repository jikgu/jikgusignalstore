# 직구 시그널 스토어 (Jikgu Signal Store)

해외 쇼핑몰의 상품을 한국 사용자에게 원스톱으로 제공하는 해외직구 통합 플랫폼

## 프로젝트 구조

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: FastAPI (Vercel Serverless Functions)
- **Database**: Supabase (Postgres + Auth)
- **Deployment**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 입력:

```bash
cp .env.example .env
```

### 3. 개발 서버 실행

Frontend:
```bash
npm run dev
```

Backend (별도 터미널):
```bash
pip install -r requirements.txt
uvicorn api.index:app --reload --port 8000
```

### 4. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `spec.md`의 데이터베이스 스키마를 참고하여 테이블 생성
3. Row Level Security (RLS) 정책 설정
4. 환경변수에 Supabase URL과 키 입력

## 배포

### Vercel 배포

1. GitHub 저장소를 Vercel과 연결
2. 프로젝트 이름: `jikgusignalstore`
3. Framework Preset: Vite
4. 환경변수 설정 (Vercel 대시보드에서)
5. Deploy

## 주요 기능

- 멀티 해외몰 통합 검색
- KRW 기준 최종 결제 금액 표시
- 원스톱 통관/배송/CS
- 실시간 배송 추적
- 개인통관고유부호 관리

## 문서

- [Product Requirements Document (PRD)](./prd.md)
- [Technical Specification](./spec.md)

## 라이선스

Private