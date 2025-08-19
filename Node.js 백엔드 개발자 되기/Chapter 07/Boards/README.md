# 게시판 API

Express.js와 MongoDB를 사용한 게시판 CRUD API입니다.

## 기능

- 게시글 생성, 조회, 수정, 삭제 (CRUD)
- 파일 업로드 (최대 5개, 5MB)
- 게시글 검색
- 페이지네이션
- 조회수 카운트

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. MongoDB 실행
```bash
mongod
```

3. 서버 실행
```bash
npm start
# 또는 개발 모드
npm run dev
```

## API 엔드포인트

### 게시글 목록 조회
- **GET** `/api/boards`
- 쿼리 파라미터: `page`, `limit`

### 게시글 상세 조회
- **GET** `/api/boards/:id`

### 게시글 생성
- **POST** `/api/boards`
- Content-Type: `multipart/form-data`
- 필드: `title`, `content`, `author`
- 파일: `files` (선택사항, 최대 5개)

### 게시글 수정
- **PUT** `/api/boards/:id`
- Content-Type: `multipart/form-data`
- 필드: `title`, `content`, `author`
- 파일: `files` (선택사항, 최대 5개)

### 게시글 삭제
- **DELETE** `/api/boards/:id`

### 게시글 검색
- **GET** `/api/boards/search/:keyword`
- 쿼리 파라미터: `page`, `limit`

## 파일 구조

```
.
├── app.js              # 메인 애플리케이션
├── config/
│   └── database.js     # MongoDB 연결 설정
├── models/
│   └── Board.js        # 게시판 모델
├── routes/
│   └── boards.js       # 게시판 라우터
├── middleware/
│   ├── upload.js       # 파일 업로드 미들웨어
│   └── errorHandler.js # 에러 처리 미들웨어
├── uploads/            # 업로드된 파일 저장
└── package.json
```

## 환경 변수

`.env` 파일에서 설정:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/board
NODE_ENV=development
```