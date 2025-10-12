# WordCompare 배포 가이드

## 목차
1. [배포 준비](#배포-준비)
2. [Vercel 배포](#vercel-배포)
3. [Netlify 배포](#netlify-배포)
4. [환경 변수 설정](#환경-변수-설정)
5. [도메인 연결](#도메인-연결)
6. [배포 후 검증](#배포-후-검증)

---

## 배포 준비

### 1. 프로덕션 빌드 테스트

배포하기 전에 로컬에서 프로덕션 빌드를 테스트합니다.

```bash
# 프로덕션 빌드 생성
npm run build

# 빌드 결과 미리보기
npm run preview
```

빌드가 성공하면 `dist` 디렉토리가 생성됩니다.

### 2. 테스트 실행

모든 테스트가 통과하는지 확인합니다.

```bash
npm run test
```

### 3. 린트 검사

코드 품질을 확인합니다.

```bash
npm run lint
```

---

## Vercel 배포

Vercel은 자동 배포와 프리뷰 환경을 제공하는 플랫폼입니다.

### 방법 1: Vercel CLI 사용

#### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

#### 2단계: Vercel 로그인

```bash
vercel login
```

#### 3단계: 프로젝트 배포

```bash
# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 2: Vercel 웹 인터페이스 사용

#### 1단계: Vercel 계정 생성
- [vercel.com](https://vercel.com)에 접속
- GitHub 계정으로 로그인

#### 2단계: 프로젝트 가져오기
1. "New Project" 클릭
2. GitHub 저장소 선택
3. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3단계: 환경 변수 설정
- Settings → Environment Variables에서 설정
- `.env.example` 파일을 참고하여 필요한 변수 추가

#### 4단계: 배포
- "Deploy" 버튼 클릭
- 자동 배포 시작 (약 2-3분 소요)

### Vercel 자동 배포 설정

GitHub 저장소에 푸시할 때마다 자동으로 배포됩니다:
- `main` 브랜치 → 프로덕션 배포
- 다른 브랜치 → 프리뷰 배포

---

## Netlify 배포

Netlify는 정적 사이트 호스팅 플랫폼입니다.

### 방법 1: Netlify CLI 사용

#### 1단계: Netlify CLI 설치

```bash
npm install -g netlify-cli
```

#### 2단계: Netlify 로그인

```bash
netlify login
```

#### 3단계: 프로젝트 초기화

```bash
netlify init
```

프롬프트에서 다음 정보를 입력:
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### 4단계: 배포

```bash
# 프리뷰 배포
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

### 방법 2: Netlify 웹 인터페이스 사용

#### 1단계: Netlify 계정 생성
- [netlify.com](https://www.netlify.com)에 접속
- GitHub 계정으로 로그인

#### 2단계: 새 사이트 추가
1. "Add new site" → "Import an existing project" 클릭
2. GitHub 저장소 선택
3. 빌드 설정:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### 3단계: 환경 변수 설정
- Site settings → Environment variables에서 설정
- `.env.example` 파일을 참고하여 필요한 변수 추가

#### 4단계: 배포
- "Deploy site" 버튼 클릭
- 자동 배포 시작 (약 2-3분 소요)

### Netlify 자동 배포 설정

GitHub 저장소에 푸시할 때마다 자동으로 배포됩니다.

---

## 환경 변수 설정

### 필수 환경 변수

현재 프로젝트는 필수 환경 변수가 없지만, 향후 확장을 위해 다음 변수를 설정할 수 있습니다:

```bash
# 애플리케이션 정보
VITE_APP_NAME=WordCompare
VITE_APP_VERSION=1.0.0

# 기능 플래그
VITE_ENABLE_PDF_EXPORT=true
VITE_ENABLE_HTML_EXPORT=true
VITE_ENABLE_CSV_EXPORT=true
VITE_ENABLE_JSON_EXPORT=true

# 파일 업로드 제한
VITE_MAX_FILE_SIZE=52428800
VITE_ALLOWED_FILE_TYPES=.docx
```

### Vercel에서 환경 변수 설정

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Environment Variables
3. 변수 추가:
   - **Name**: 변수 이름 (예: `VITE_APP_NAME`)
   - **Value**: 변수 값 (예: `WordCompare`)
   - **Environments**: Production, Preview, Development 선택
4. "Save" 클릭

### Netlify에서 환경 변수 설정

1. Netlify 대시보드에서 사이트 선택
2. Site settings → Environment variables
3. "Add a variable" 클릭
4. 변수 추가:
   - **Key**: 변수 이름 (예: `VITE_APP_NAME`)
   - **Values**: 변수 값 (예: `WordCompare`)
5. "Create variable" 클릭

---

## 도메인 연결

### Vercel에서 커스텀 도메인 설정

1. 프로젝트 설정 → Domains
2. "Add Domain" 클릭
3. 도메인 이름 입력 (예: `wordcompare.com`)
4. DNS 레코드 설정:
   - Vercel이 제공하는 DNS 설정 지침 따르기
   - 일반적으로 A 레코드 또는 CNAME 레코드 추가
5. DNS 전파 대기 (최대 48시간)

### Netlify에서 커스텀 도메인 설정

1. Site settings → Domain management
2. "Add custom domain" 클릭
3. 도메인 이름 입력 (예: `wordcompare.com`)
4. DNS 설정:
   - Netlify DNS 사용 (권장)
   - 또는 외부 DNS 제공자에서 CNAME 레코드 설정
5. HTTPS 자동 활성화 대기 (Let's Encrypt 사용)

---

## 배포 후 검증

### 1. 기능 테스트

배포된 사이트에서 다음 기능을 테스트합니다:

- ✅ 파일 업로드 (드래그 앤 드롭, 파일 선택)
- ✅ 문서 비교 실행
- ✅ 비교 결과 표시 (나란히 보기/통합 보기)
- ✅ 변경사항 탐색 (이전/다음 버튼)
- ✅ 통계 패널 표시
- ✅ 내보내기 기능 (PDF, HTML, CSV, JSON)

### 2. 성능 테스트

#### Lighthouse 테스트

1. Chrome DevTools 열기 (F12)
2. Lighthouse 탭 선택
3. "Generate report" 클릭
4. 결과 확인:
   - **Performance**: 90+ 목표
   - **Accessibility**: 90+ 목표
   - **Best Practices**: 90+ 목표
   - **SEO**: 80+ 목표

#### 로드 시간 테스트

- [WebPageTest](https://www.webpagetest.org/) 사용
- [GTmetrix](https://gtmetrix.com/) 사용

### 3. 보안 테스트

#### Security Headers 확인

다음 헤더가 설정되었는지 확인:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer`

확인 방법:
```bash
curl -I https://your-domain.com
```

또는 [securityheaders.com](https://securityheaders.com/) 사용

### 4. 브라우저 호환성 테스트

다음 브라우저에서 테스트:
- ✅ Chrome (최신 버전)
- ✅ Firefox (최신 버전)
- ✅ Safari (최신 버전)
- ✅ Edge (최신 버전)

### 5. 모바일 반응형 테스트

다음 디바이스에서 테스트:
- 📱 iPhone (Safari)
- 📱 Android (Chrome)
- 💻 태블릿 (iPad, Android)

---

## 문제 해결

### 빌드 실패

**증상**: Vercel 또는 Netlify에서 빌드 실패

**해결 방법**:
1. 로컬에서 `npm run build` 실행하여 오류 확인
2. `package.json`의 의존성이 올바른지 확인
3. Node.js 버전이 호환되는지 확인 (18.0.0 이상)
4. 배포 로그에서 오류 메시지 확인

### 환경 변수가 작동하지 않음

**증상**: 환경 변수가 애플리케이션에서 인식되지 않음

**해결 방법**:
1. 환경 변수 이름이 `VITE_`로 시작하는지 확인
2. 배포 플랫폼에서 환경 변수가 올바르게 설정되었는지 확인
3. 환경 변수 변경 후 재배포 필요
4. 브라우저 캐시 삭제

### 도메인 연결 문제

**증상**: 커스텀 도메인이 작동하지 않음

**해결 방법**:
1. DNS 전파 대기 (최대 48시간)
2. DNS 레코드가 올바르게 설정되었는지 확인
3. `nslookup` 또는 `dig` 명령어로 DNS 확인:
   ```bash
   nslookup your-domain.com
   ```
4. 배포 플랫폼의 도메인 설정 재확인

### 파일 업로드 실패

**증상**: 배포된 사이트에서 파일 업로드가 작동하지 않음

**해결 방법**:
1. 브라우저 콘솔에서 오류 메시지 확인
2. 파일 크기 제한 확인 (50MB 이하)
3. 파일 형식 확인 (.docx만 지원)
4. CORS 설정 확인 (필요한 경우)

---

## 모니터링 및 분석

### Vercel Analytics

Vercel Pro 플랜 이상에서 사용 가능:
1. 프로젝트 설정 → Analytics
2. "Enable Analytics" 클릭
3. 대시보드에서 트래픽, 성능 지표 확인

### Google Analytics 연동 (선택사항)

1. [Google Analytics](https://analytics.google.com/) 계정 생성
2. 추적 ID 발급 (예: `UA-XXXXXXXXX-X`)
3. 환경 변수에 추가:
   ```bash
   VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
   ```
4. `src/main.tsx`에 Google Analytics 스크립트 추가

### Sentry 오류 추적 (선택사항)

1. [Sentry](https://sentry.io/) 계정 생성
2. 프로젝트 생성 및 DSN 발급
3. 환경 변수에 추가:
   ```bash
   VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```
4. Sentry SDK 설치 및 초기화

---

## 배포 체크리스트

배포 전 다음 사항을 확인하세요:

- [ ] 모든 테스트 통과 (`npm run test`)
- [ ] 린트 검사 통과 (`npm run lint`)
- [ ] 로컬 프로덕션 빌드 성공 (`npm run build`)
- [ ] 환경 변수 설정 완료
- [ ] 배포 설정 파일 확인 (vercel.json 또는 netlify.toml)
- [ ] README.md 업데이트
- [ ] 사용자 가이드 작성 완료
- [ ] 보안 헤더 설정 확인
- [ ] 브라우저 호환성 테스트 완료
- [ ] 모바일 반응형 테스트 완료

---

**버전**: 1.0.0
**최종 업데이트**: 2025-10-11
**문의**: WordCompare 지원팀
