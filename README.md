# 카드 뒤집기 게임 (Memory Card Game)

가장 간단한 웹 기술(HTML, CSS, JavaScript)로 만든 카드 뒤집기 게임입니다.

## 기능

- 🎮 카드 뒤집기 게임 (16장, 8쌍)
- ⏱️ 타이머 및 시도 횟수 추적
- 🏆 Supabase 기반 리더보드
- ✨ 부드러운 카드 애니메이션

## 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (Vanilla)
- **데이터베이스**: Supabase (PostgreSQL)
- **배포**: 정적 호스팅

## 프로젝트 구조

```
/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # 게임 로직
├── supabase-config.js  # Supabase 클라이언트 설정
└── README.md           # 프로젝트 설명
```

## 설정 방법

**📖 상세한 설정 가이드는 [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)를 참고하세요.**

### 빠른 설정 가이드

### 1. Supabase 프로젝트 정보 확인

이미 Supabase 프로젝트가 있다면 다음 정보를 확인하세요:
1. Supabase 대시보드 > **Settings** > **API**에서:
   - **Project URL**: `https://xxxxx.supabase.co` 형식
   - **anon/public key**: `eyJhbGci...` 형식의 긴 문자열

### 2. leaderboard 테이블 생성

**중요**: 기존 `game_scores` 테이블과 별도로 `leaderboard` 테이블을 생성해야 합니다.

Supabase 대시보드의 **SQL Editor**에서 `supabase-setup.sql` 파일의 전체 내용을 실행:

```sql
-- leaderboard 테이블 생성
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    time_taken INTEGER,
    attempts INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (리더보드 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score ASC, time_taken ASC);

-- Row Level Security (RLS) 활성화
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 생성
CREATE POLICY "Anyone can read leaderboard"
    ON leaderboard
    FOR SELECT
    USING (true);

-- 모든 사용자가 쓰기 가능하도록 정책 생성 (익명 사용자 포함)
CREATE POLICY "Anyone can insert leaderboard"
    ON leaderboard
    FOR INSERT
    WITH CHECK (true);
```

### 3. Supabase 연결 정보 설정 (보안)

**⚠️ 중요**: Supabase 키는 보안을 위해 별도 파일로 관리됩니다.

1. `config.env.example.js` 파일을 복사하여 `config.env.js` 파일을 생성:
   ```bash
   # Windows PowerShell
   Copy-Item config.env.example.js config.env.js
   
   # macOS/Linux
   cp config.env.example.js config.env.js
   ```

2. `config.env.js` 파일을 열고 다음 값들을 실제 값으로 수정:
   ```javascript
   window.SUPABASE_URL = 'https://your-project.supabase.co';      // 본인의 프로젝트 URL
   window.SUPABASE_ANON_KEY = 'your-anon-key-here';               // 본인의 anon key
   ```

3. **보안 확인**:
   - ✅ `config.env.js` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
   - ✅ 실제 키는 `config.env.js`에만 저장되고, `supabase-config.js`는 이 파일에서 값을 읽어옵니다
   - ✅ `config.env.example.js`는 Git에 포함되지만 실제 키는 포함되지 않습니다

**참고**: 
- `SUPABASE_URL`은 프로젝트 대시보드의 Settings > API > Project URL에서 확인
- `SUPABASE_ANON_KEY`는 Settings > API > Project API keys > `anon` `public` 키에서 확인
- `config.env.js` 파일이 없으면 자동으로 로컬 스토리지 모드로 동작합니다

### 4. 문제 해결

**점수 저장 오류가 발생하는 경우:**

1. **Supabase 설정 확인**
   - `supabase-config.js`에서 URL과 API 키가 올바르게 설정되었는지 확인
   - 브라우저 콘솔(F12)에서 에러 메시지 확인

2. **데이터베이스 테이블 확인**
   - Supabase 대시보드 > Table Editor에서 `leaderboard` 테이블이 존재하는지 확인
   - 테이블이 없다면 `supabase-setup.sql` 실행

3. **RLS 정책 확인**
   - Supabase 대시보드 > Authentication > Policies에서 정책이 올바르게 설정되었는지 확인
   - "Anyone can read leaderboard"와 "Anyone can insert leaderboard" 정책이 있어야 함

4. **네트워크 확인**
   - 브라우저 개발자 도구 > Network 탭에서 API 요청이 실패하는지 확인
   - CORS 오류가 있다면 Supabase 프로젝트 설정 확인

## 게임 방법

1. 카드를 클릭하여 뒤집습니다
2. 같은 그림의 카드 두 장을 찾아 매칭합니다
3. 모든 카드를 매칭하면 게임 종료
4. 이름을 입력하여 리더보드에 등록할 수 있습니다

