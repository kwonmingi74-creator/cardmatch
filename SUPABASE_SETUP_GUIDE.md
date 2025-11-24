# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 정보 확인

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 (현재 프로젝트: kwonmingi74-creator's Project)
3. 왼쪽 메뉴에서 **Settings** > **API** 클릭

### 필요한 정보:
- **Project URL**: `https://xxxxx.supabase.co` 형식
- **anon public key**: `eyJhbGci...` 형식의 긴 문자열

## 2단계: supabase-config.js 파일 설정

`supabase-config.js` 파일을 열고 다음 값을 수정:

```javascript
const SUPABASE_URL = 'https://edvuhfpcqderflxmzzon.supabase.co';  // 본인의 Project URL
const SUPABASE_ANON_KEY = 'your-anon-key-here';                    // 본인의 anon public key
```

**참고**: 
- Project URL은 Settings > API > Project URL에서 확인
- anon public key는 Settings > API > Project API keys > `anon` `public` 키에서 확인

## 3단계: leaderboard 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** 클릭 (왼쪽 메뉴)
2. **New query** 버튼 클릭
3. `supabase-setup.sql` 파일의 전체 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)

### 테이블 생성 확인:
- 왼쪽 메뉴에서 **Table Editor** 클릭
- `leaderboard` 테이블이 목록에 나타나는지 확인
- 테이블을 클릭하여 다음 컬럼들이 있는지 확인:
  - `id` (uuid)
  - `player_name` (text)
  - `score` (integer)
  - `time_taken` (integer)
  - `attempts` (integer)
  - `created_at` (timestamp)

## 4단계: RLS 정책 확인

1. **Table Editor**에서 `leaderboard` 테이블 클릭
2. 상단의 **"RLS policies"** 버튼 클릭
3. 다음 정책들이 있는지 확인:
   - ✅ "Anyone can read leaderboard" (SELECT)
   - ✅ "Anyone can insert leaderboard" (INSERT)

정책이 없다면 `supabase-setup.sql`을 다시 실행하세요.

## 5단계: 테스트

1. `index.html` 파일을 브라우저로 열기
2. 브라우저 개발자 도구 열기 (F12)
3. **Console** 탭에서 다음 메시지 확인:
   - ✅ "Supabase 클라이언트가 성공적으로 초기화되었습니다."
4. 게임을 플레이하고 점수를 저장해보기
5. 리더보드에 점수가 표시되는지 확인

## 문제 해결

### 오류: "Supabase가 설정되지 않았습니다"
- `supabase-config.js`에서 URL과 API 키가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 설정 확인 메시지 확인

### 오류: "데이터베이스 테이블이 존재하지 않습니다"
- `supabase-setup.sql`이 정상적으로 실행되었는지 확인
- Table Editor에서 `leaderboard` 테이블 존재 여부 확인

### 오류: "권한이 없습니다"
- RLS 정책이 올바르게 설정되었는지 확인
- Table Editor > RLS policies에서 정책 확인

### 리더보드가 표시되지 않음
- 브라우저 콘솔에서 에러 메시지 확인
- Network 탭에서 API 요청이 실패하는지 확인


