# 직구 시그널 스토어 - 초보자를 위한 완벽 가이드

> 이 가이드는 프로그래밍 경험이 없는 초보자도 직구 시그널 스토어를 처음부터 배포까지 완료할 수 있도록 작성되었습니다.

## 📋 목차

1. [필요한 계정 생성](#1-필요한-계정-생성)
2. [개발 환경 설정](#2-개발-환경-설정)
3. [프로젝트 설치](#3-프로젝트-설치)
4. [Supabase 설정](#4-supabase-설정)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [로컬 테스트](#6-로컬-테스트)
7. [Vercel 배포](#7-vercel-배포)
8. [문제 해결](#8-문제-해결)

---

## 1. 필요한 계정 생성

### 1.1 GitHub 계정
1. [github.com](https://github.com) 접속
2. "Sign up" 클릭
3. Username, Email, Password 입력
4. 이메일 인증 완료

### 1.2 Supabase 계정
1. [supabase.com](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (위에서 만든 계정 사용)

### 1.3 Vercel 계정
1. [vercel.com](https://vercel.com) 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 선택
4. GitHub 계정으로 로그인

---

## 2. 개발 환경 설정

### 2.1 Node.js 설치

#### Windows
1. [nodejs.org](https://nodejs.org) 접속
2. LTS 버전 다운로드 (왼쪽 녹색 버튼)
3. 다운로드한 파일 실행
4. 모두 "Next" 클릭하여 설치

#### Mac
1. [nodejs.org](https://nodejs.org) 접속
2. LTS 버전 다운로드
3. .pkg 파일 실행
4. 지시에 따라 설치

### 2.2 Visual Studio Code 설치
1. [code.visualstudio.com](https://code.visualstudio.com) 접속
2. Download 클릭
3. 설치 파일 실행

### 2.3 Git 설치

#### Windows
1. [git-scm.com](https://git-scm.com) 접속
2. Download for Windows 클릭
3. 설치 (기본 설정 유지)

#### Mac
1. Terminal 앱 실행
2. 다음 명령어 입력:
```bash
git --version
```
3. 설치 안내가 나오면 "Install" 클릭

---

## 3. 프로젝트 설치

### 3.1 프로젝트 복사
1. VS Code 실행
2. Terminal 메뉴 → New Terminal 클릭
3. 다음 명령어 순서대로 입력:

```bash
# 프로젝트 다운로드
git clone https://github.com/jikgu/jikgusignalstore.git

# 프로젝트 폴더로 이동
cd jikgusignalstore

# 필요한 패키지 설치
npm install
```

---

## 4. Supabase 설정

### 4.1 새 프로젝트 생성
1. [app.supabase.com](https://app.supabase.com) 접속
2. "New Project" 클릭
3. 입력 사항:
   - Project name: `jikgusignalstore`
   - Database Password: 강력한 비밀번호 (꼭 메모해두세요!)
   - Region: Northeast Asia (Seoul)
4. "Create new project" 클릭 (2-3분 대기)

### 4.2 데이터베이스 설정
1. 왼쪽 메뉴에서 "SQL Editor" 클릭
2. "+ New query" 클릭
3. VS Code에서 `database.sql` 파일 열기
4. 전체 내용 복사 (Ctrl+A → Ctrl+C)
5. Supabase SQL Editor에 붙여넣기 (Ctrl+V)
6. "Run" 버튼 클릭

> ⚠️ 오류가 나면 한 번 더 "Run" 클릭 (기존 테이블 삭제 후 재생성)

### 4.3 인증 설정
1. 왼쪽 메뉴 "Authentication" → "Providers" 클릭
2. Email 항목 확인 (기본으로 활성화되어 있음)
3. "Confirm email" 끄기 (개발 중에는 편의를 위해)

### 4.4 API 키 확인
1. 왼쪽 메뉴 "Settings" → "API" 클릭
2. 다음 두 가지 복사해두기:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbG...` (긴 문자열)

---

## 5. 환경 변수 설정

### 5.1 .env 파일 생성
1. VS Code에서 프로젝트 루트에 `.env` 파일 생성
2. 다음 내용 입력 (위에서 복사한 값 사용):

```env
# Supabase 설정
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

> 📝 xxxxx 부분을 실제 값으로 교체하세요!

---

## 6. 로컬 테스트

### 6.1 개발 서버 실행
1. VS Code Terminal에서:
```bash
npm run dev
```

2. 브라우저에서 http://localhost:5173 접속
3. 정상 작동 확인

### 6.2 기능 테스트
1. **회원가입**: 우측 상단 "로그인" → 회원가입
2. **상품 보기**: 카테고리 클릭 → 상품 클릭
3. **장바구니**: 상품 페이지에서 "장바구니" 클릭
4. **주문하기**: 장바구니 → 결제하기
5. **주문 확인**: 주문내역 메뉴

### 6.3 개발 서버 종료
Terminal에서 Ctrl+C 누르기

---

## 7. Vercel 배포

### 7.1 GitHub에 코드 업로드
1. GitHub.com에서 "New repository" 클릭
2. Repository name: `my-jikgu-store` (원하는 이름)
3. "Create repository" 클릭
4. VS Code Terminal에서:

```bash
git remote set-url origin https://github.com/[your-username]/my-jikgu-store.git
git push -u origin main
```

> 📝 [your-username]을 실제 GitHub 아이디로 교체

### 7.2 Vercel 연결
1. [vercel.com/new](https://vercel.com/new) 접속
2. "Import Git Repository" 선택
3. 방금 만든 repository 선택
4. 설정:
   - Framework Preset: `Vite` 선택
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 7.3 환경 변수 설정
1. "Environment Variables" 섹션
2. 추가할 변수들:
```
VITE_SUPABASE_URL = [Supabase URL 값]
VITE_SUPABASE_ANON_KEY = [Supabase Anon Key 값]
```
3. "Add" 클릭

### 7.4 배포
1. "Deploy" 클릭
2. 2-3분 대기
3. 완료되면 제공된 URL로 접속 (예: `https://my-jikgu-store.vercel.app`)

---

## 8. 문제 해결

### 8.1 자주 발생하는 오류

#### "npm: command not found"
- Node.js가 제대로 설치되지 않음
- 컴퓨터 재시작 후 다시 시도

#### "장바구니 추가 실패"
1. Supabase Dashboard → SQL Editor
2. database.sql 내용 다시 실행
3. 브라우저 새로고침 (Ctrl+Shift+R)

#### "로그인이 안 돼요"
1. Supabase Dashboard → Authentication → Users 확인
2. 이메일 인증이 필요할 수 있음
3. 스팸 메일함 확인

#### "배포 후 화면이 안 나와요"
1. Vercel Dashboard → Functions 탭 → 로그 확인
2. 환경 변수가 제대로 설정되었는지 확인
3. Build 로그에서 오류 확인

### 8.2 도움 받기
- GitHub Issues: https://github.com/jikgu/jikgusignalstore/issues
- Supabase Discord: https://discord.supabase.com
- Vercel Discord: https://vercel.com/discord

---

## 9. 추가 설정 (선택사항)

### 9.1 커스텀 도메인 연결
1. Vercel Dashboard → Settings → Domains
2. 도메인 추가 (예: `myshop.com`)
3. DNS 설정 안내 따르기

### 9.2 이메일 인증 활성화
1. Supabase → Authentication → Providers → Email
2. "Confirm email" 활성화
3. Email Templates 커스터마이징

### 9.3 실제 결제 연동
- 토스페이먼츠, 아임포트 등 PG사 계약 필요
- `/api/index.py`에 결제 API 연동 코드 추가

---

## 10. 유지보수

### 10.1 코드 업데이트
```bash
git add .
git commit -m "업데이트 내용"
git push
```
→ Vercel이 자동으로 재배포

### 10.2 데이터베이스 백업
1. Supabase Dashboard → Settings → Database
2. "Backups" 탭
3. "Download backup" 클릭

### 10.3 모니터링
- Vercel Dashboard: 트래픽, 에러 확인
- Supabase Dashboard: 데이터베이스 사용량 확인

---

## 🎉 축하합니다!

직구 시그널 스토어를 성공적으로 배포했습니다. 이제 실제 상품을 등록하고 운영을 시작할 수 있습니다.

### 다음 단계
1. 상품 데이터 추가 (Supabase Table Editor 사용)
2. 카테고리 커스터마이징
3. 디자인 수정 (TailwindCSS 활용)
4. 기능 추가 개발

### 유용한 리소스
- [React 공식 문서](https://react.dev)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 공식 문서](https://vercel.com/docs)
- [TailwindCSS 공식 문서](https://tailwindcss.com/docs)

---

**작성자**: Jikgu Signal Store Team  
**최종 업데이트**: 2024-12-04  
**문의**: [GitHub Issues](https://github.com/jikgu/jikgusignalstore/issues)