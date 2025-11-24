// Supabase 설정
// 환경 변수는 config.env.js 파일에서 로드됩니다
// 
// 설정 방법:
// 1. config.env.example.js 파일을 참고하여 config.env.js 파일을 생성하세요
// 2. 실제 Supabase URL과 ANON_KEY를 입력하세요
// 3. config.env.js는 .gitignore에 포함되어 있어 Git에 커밋되지 않습니다

// 환경 변수 로드 (config.env.js에서 window 객체에 설정된 값 사용)
// config.env.js 파일이 없거나 로드되지 않은 경우 null로 유지
const SUPABASE_URL = (typeof window !== 'undefined' && window.SUPABASE_URL) || null;
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || null;

// Supabase 클라이언트 초기화
let supabase = null;

// Supabase 라이브러리 로드 확인 함수
function checkSupabaseLibrary() {
    if (!window.supabase) {
        console.error('❌ Supabase 라이브러리가 로드되지 않았습니다.');
        console.error('CDN에서 Supabase 스크립트를 로드하는지 확인하세요.');
        return false;
    }
    if (!window.supabase.createClient) {
        console.error('❌ Supabase createClient 함수를 찾을 수 없습니다.');
        console.error('Supabase 라이브러리 버전을 확인하세요.');
        return false;
    }
    return true;
}

// Supabase 클라이언트 초기화
try {
    // Supabase 라이브러리 확인
    if (!checkSupabaseLibrary()) {
        console.log('ℹ️ Supabase 라이브러리를 사용할 수 없습니다. 로컬 스토리지를 사용합니다.');
    } else {
        // Supabase 설정이 되어 있는지 확인
        if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
            SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase 클라이언트가 성공적으로 초기화되었습니다.');
        } else {
            console.log('ℹ️ Supabase 설정이 없습니다. 로컬 스토리지를 사용합니다.');
            console.log('💡 Supabase를 사용하려면 config.env.example.js를 참고하여 config.env.js 파일을 생성하고 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정하세요.');
        }
    }
} catch (error) {
    console.log('ℹ️ Supabase 초기화 오류, 로컬 스토리지를 사용합니다:', error.message);
}

// Supabase 연결 확인
function isSupabaseConfigured() {
    return supabase !== null;
}

// 로컬 스토리지에서 리더보드 가져오기
function getLocalLeaderboard() {
    try {
        const stored = localStorage.getItem('cardGameLeaderboard');
        if (!stored) return [];
        const leaderboard = JSON.parse(stored);
        // 점수(시도 횟수)와 시간으로 정렬
        return leaderboard.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return a.time_taken - b.time_taken;
        }).slice(0, 10); // 상위 10개만
    } catch (error) {
        console.error('로컬 리더보드 조회 오류:', error);
        return [];
    }
}

// 로컬 스토리지에 점수 저장하기
function saveLocalScore(playerName, score, timeTaken, attempts) {
    try {
        const leaderboard = getLocalLeaderboard();
        const newEntry = {
            id: Date.now().toString(),
            player_name: playerName,
            score: score,
            time_taken: timeTaken,
            attempts: attempts,
            created_at: new Date().toISOString()
        };
        leaderboard.push(newEntry);
        // 정렬 후 상위 50개만 저장 (용량 관리)
        leaderboard.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return a.time_taken - b.time_taken;
        });
        const top50 = leaderboard.slice(0, 50);
        localStorage.setItem('cardGameLeaderboard', JSON.stringify(top50));
        return [newEntry];
    } catch (error) {
        console.error('로컬 점수 저장 오류:', error);
        throw error;
    }
}

// 리더보드 데이터 가져오기 (Supabase 우선, 없으면 로컬 스토리지)
async function getLeaderboard() {
    // Supabase가 설정되어 있으면 Supabase 사용
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: true }) // 점수가 낮을수록 좋음 (시도 횟수)
                .order('time_taken', { ascending: true }) // 같은 점수면 시간이 짧은 순
                .limit(10);

            if (error) {
                console.warn('Supabase 리더보드 조회 실패, 로컬 스토리지 사용:', error.message);
                return getLocalLeaderboard();
            }
            return data || [];
        } catch (error) {
            console.warn('Supabase 리더보드 조회 오류, 로컬 스토리지 사용:', error);
            return getLocalLeaderboard();
        }
    }
    
    // Supabase가 없으면 로컬 스토리지 사용
    return getLocalLeaderboard();
}

// 점수 저장하기 (Supabase 우선, 없으면 로컬 스토리지)
async function saveScore(playerName, score, timeTaken, attempts) {
    // Supabase가 설정되어 있으면 Supabase 사용
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([
                    {
                        player_name: playerName,
                        score: score,
                        time_taken: timeTaken,
                        attempts: attempts
                    }
                ])
                .select();

            if (error) {
                console.warn('Supabase 점수 저장 실패, 로컬 스토리지로 저장:', error.message);
                // Supabase 실패 시 로컬 스토리지로 대체
                return saveLocalScore(playerName, score, timeTaken, attempts);
            }
            return data;
        } catch (error) {
            console.warn('Supabase 점수 저장 오류, 로컬 스토리지로 저장:', error);
            // Supabase 실패 시 로컬 스토리지로 대체
            return saveLocalScore(playerName, score, timeTaken, attempts);
        }
    }
    
    // Supabase가 없으면 로컬 스토리지 사용
    return saveLocalScore(playerName, score, timeTaken, attempts);
}

