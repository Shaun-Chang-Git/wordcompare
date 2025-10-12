# WordCompare - 문서 비교 프로그램

MS Word의 '검토 - 비교' 기능과 동일한 문서 비교 기능을 제공하는 웹 애플리케이션입니다.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/idonn/WordCompare)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 주요 기능

- 📄 **2개의 Word 문서(.docx) 비교**: 원본과 수정된 문서를 정밀하게 비교
- 🎨 **차이점 시각화**: 추가, 삭제, 수정, 이동, 서식 변경을 색상으로 구분
- 📋 **변경사항 상세 분석**: 통계 정보와 함께 모든 변경사항을 리스트로 제공
- ⚙️ **세밀한 비교 옵션**: 문자/단어/문장/단락 단위 비교, 서식/표/머리글 비교 지원
- 💾 **다양한 내보내기 형식**: PDF, HTML, CSV, JSON 형식으로 결과 저장
- 🎯 **직관적인 UI/UX**: 나란히 보기와 통합 보기 모드 지원

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript 5.6
- **UI Framework**: Material-UI (MUI) 6.3
- **Build Tool**: Vite 6.0
- **Document Parsing**: mammoth.js 1.8
- **Diff Algorithm**: diff-match-patch 1.0
- **File Upload**: react-dropzone 14.3
- **Testing**: Vitest 3.2 + React Testing Library 16.3
- **Export**: jsPDF 2.5, PapaParse 5.4

## 📦 설치 및 실행

### 필수 요구사항

- Node.js >= 18.0.0
- npm >= 9.0.0

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

### 테스트 실행

```bash
# 단위 테스트 실행
npm run test

# 테스트 UI 모드
npm run test:ui

# 테스트 커버리지 확인
npm run test:coverage
```

## 📁 프로젝트 구조

```
WordCompare/
├── docs/                   # 문서
│   ├── USER_GUIDE.md      # 사용자 가이드 (한글)
│   └── USER_GUIDE_EN.md   # 사용자 가이드 (영문)
├── public/                 # 정적 파일
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── FileUpload/    # 파일 업로드
│   │   ├── ComparisonSettings/  # 비교 옵션 설정
│   │   ├── DiffViewer/    # 문서 비교 뷰어
│   │   ├── StatisticsPanel/  # 통계 패널
│   │   └── ExportPanel/   # 내보내기 패널
│   ├── services/           # 비즈니스 로직
│   │   ├── documentParser.ts   # 문서 파싱 서비스
│   │   ├── diffEngine.ts       # 문서 비교 엔진
│   │   └── exportService.ts    # 내보내기 서비스
│   ├── test/               # 테스트 설정
│   │   └── setup.ts       # 테스트 환경 설정
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 유틸리티 함수
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── main.tsx            # 진입점
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts        # Vitest 설정
├── plan.md                 # 프로젝트 진행 계획
└── README.md
```

## 🎨 주요 화면

### 1. 파일 업로드
- 드래그 앤 드롭 또는 파일 탐색기로 문서 선택
- 지원 형식: .docx
- 파일 크기 제한: 50MB

### 2. 비교 옵션 설정
- **비교 세부 수준**: 문자/단어/문장/단락 단위 선택
- **비교 옵션**: 서식, 대소문자, 공백, 표, 머리글/바닥글, 각주, 필드, 텍스트 상자, 주석

### 3. 비교 결과
- **나란히 보기**: 원본과 수정본을 좌우로 나란히 표시
- **통합 보기**: 하나의 뷰에서 모든 변경사항 확인
- **색상 코드**로 차이점 표시:
  - 🟢 **녹색**: 추가된 내용
  - 🔴 **빨간색**: 삭제된 내용
  - 🟡 **노란색**: 수정된 내용
  - 🔵 **파란색**: 이동된 내용
  - 🟣 **보라색**: 서식 변경

### 4. 통계 패널
- 총 변경사항 수
- 변경 유형별 분류 (추가/삭제/수정/이동/서식 변경)
- 변경 비율 및 유사도 계산

### 5. 내보내기
- **PDF**: 인쇄용 리포트
- **HTML**: 웹 페이지 형식
- **CSV**: 스프레드시트 분석용
- **JSON**: 프로그래밍/데이터 처리용

## 📊 성능 목표

- ⚡ 10MB 문서 비교: 5초 이내
- ⚡ 100페이지 렌더링: 3초 이내
- 💾 메모리 사용량: 500MB 이하
- 📦 최대 파일 크기: 50MB

## 🔒 보안

- 클라이언트 측 처리로 문서 외부 유출 방지
- 파일 형식 및 크기 검증
- 임시 파일 자동 삭제

## 📝 개발 로드맵

자세한 개발 계획은 [plan.md](plan.md)를 참고하세요.

### 완료된 단계
- ✅ Phase 0: 프로젝트 초기화
- ✅ Phase 1: 기본 UI/UX 구현
- ✅ Phase 2: 문서 파싱 기능
- ✅ Phase 3: 문서 비교 알고리즘
- ✅ Phase 4: 비교 결과 시각화
- ✅ Phase 5: 내보내기 기능
- ✅ Phase 6: 추가 기능 구현
- ✅ Phase 7: 테스트 및 최적화
- 🚧 Phase 8: 배포 준비 (진행 중)

### 다음 단계
- 📦 배포 환경 구성 (Vercel/Netlify)
- 🌐 프로덕션 배포

## 📖 문서

- [사용자 가이드 (한글)](docs/USER_GUIDE.md)
- [User Guide (English)](docs/USER_GUIDE_EN.md)
- [개발 계획](plan.md)

## 🧪 테스트

프로젝트는 25개의 단위 테스트를 포함하고 있으며, 모든 테스트가 통과했습니다.

- **diffEngine.test.ts**: 14개 테스트 (문서 비교 엔진)
- **exportService.test.ts**: 8개 테스트 (내보내기 서비스)
- **FileUpload.test.tsx**: 3개 테스트 (파일 업로드 컴포넌트)

테스트 실행 시간: ~38초

## 📄 라이선스

MIT License

## 👥 기여

이슈와 PR은 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
