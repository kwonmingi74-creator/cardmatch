-- ============================================
-- 카드 뒤집기 게임 리더보드 테이블 생성 SQL
-- ============================================
-- Supabase 대시보드 > SQL Editor에서 이 스크립트를 실행하세요
-- 실행 방법:
--   1. Supabase 대시보드 로그인
--   2. 왼쪽 메뉴에서 "SQL Editor" 클릭
--   3. "New query" 클릭
--   4. 아래 전체 SQL을 복사하여 붙여넣기
--   5. "Run" 버튼 클릭 또는 Ctrl+Enter

-- leaderboard 테이블 생성 (기존 테이블이 있으면 건너뜀)
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    time_taken INTEGER,
    attempts INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (리더보드 조회 최적화)
-- 점수가 낮을수록(시도 횟수가 적을수록), 시간이 짧을수록 좋은 점수
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score ASC, time_taken ASC);

-- Row Level Security (RLS) 활성화
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있으면 삭제 (중복 방지)
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON leaderboard;
DROP POLICY IF EXISTS "Anyone can insert leaderboard" ON leaderboard;

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

-- 테이블 생성 확인 (선택사항)
-- 아래 쿼리를 실행하면 테이블 구조를 확인할 수 있습니다
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'leaderboard';

-- 테이블이 정상적으로 생성되었는지 확인
SELECT * FROM leaderboard ORDER BY score ASC, time_taken ASC LIMIT 10;

