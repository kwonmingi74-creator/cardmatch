// 게임 상태
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let attempts = 0;
let startTime = null;
let timerInterval = null;
let isProcessing = false;

// 카드 이모지 (8쌍)
const cardEmojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝', '🍑', '🍒'];

// 게임 초기화
function initGame() {
    // 게임 상태 리셋
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    attempts = 0;
    isProcessing = false;
    startTime = null;
    
    // 타이머 리셋
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    document.getElementById('attempts').textContent = '0';
    document.getElementById('timer').textContent = '0초';
    
    // 카드 생성
    createCards();
    
    // 리더보드 로드
    loadLeaderboard();
}

// 카드 생성 및 섞기
function createCards() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // 카드 쌍 생성
    const cardPairs = [...cardEmojis, ...cardEmojis];
    
    // Fisher-Yates 알고리즘으로 섞기
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    // 카드 DOM 요소 생성
    cards = cardPairs.map((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = emoji;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', () => handleCardClick(index));
        
        gameBoard.appendChild(card);
        return { element: card, emoji, index, isFlipped: false, isMatched: false };
    });
}

// 카드 클릭 처리
function handleCardClick(index) {
    const card = cards[index];
    
    // 이미 뒤집혔거나 매칭된 카드, 또는 처리 중이면 무시
    if (card.isFlipped || card.isMatched || isProcessing) {
        return;
    }
    
    // 게임 시작 시 타이머 시작
    if (startTime === null) {
        startTime = Date.now();
        startTimer();
    }
    
    // 카드 뒤집기
    flipCard(index);
    
    // 두 번째 카드인 경우
    if (flippedCards.length === 2) {
        isProcessing = true;
        attempts++;
        document.getElementById('attempts').textContent = attempts;
        
        setTimeout(() => {
            checkMatch();
            isProcessing = false;
        }, 1000);
    }
}

// 카드 뒤집기
function flipCard(index) {
    const card = cards[index];
    card.isFlipped = true;
    card.element.classList.add('flipped');
    flippedCards.push(index);
}

// 카드 다시 뒤집기
function unflipCard(index) {
    const card = cards[index];
    card.isFlipped = false;
    card.element.classList.remove('flipped');
}

// 매칭 확인
function checkMatch() {
    const [firstIndex, secondIndex] = flippedCards;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];
    
    if (firstCard.emoji === secondCard.emoji) {
        // 매칭 성공 - 카드는 뒤집힌 상태로 유지
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        firstCard.element.classList.add('matched');
        secondCard.element.classList.add('matched');
        firstCard.element.classList.remove('mismatch');
        secondCard.element.classList.remove('mismatch');
        matchedPairs++;
        
        // 게임 종료 확인
        if (matchedPairs === cardEmojis.length) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    } else {
        // 매칭 실패 - 시각적 피드백 후 카드 다시 뒤집기
        firstCard.element.classList.add('mismatch');
        secondCard.element.classList.add('mismatch');
        
        // 1초 후 카드 다시 뒤집기
        setTimeout(() => {
            firstCard.element.classList.remove('mismatch');
            secondCard.element.classList.remove('mismatch');
            unflipCard(firstIndex);
            unflipCard(secondIndex);
        }, 1000);
    }
    
    // flippedCards 초기화 (다음 매칭을 위해)
    flippedCards = [];
}

// 타이머 시작
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').textContent = `${elapsed}초`;
    }, 1000);
}

// 게임 종료
function endGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    document.getElementById('final-attempts').textContent = attempts;
    document.getElementById('final-time').textContent = `${timeTaken}초`;
    
    // 모달 표시
    const modal = document.getElementById('game-over-modal');
    modal.classList.add('show');
    
    // 점수 저장 (게임 상태에 저장)
    window.gameScore = {
        attempts: attempts,
        timeTaken: timeTaken,
        score: attempts // 점수는 시도 횟수로 계산
    };
}

// 리더보드 로드
async function loadLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = '<p class="loading">리더보드를 불러오는 중...</p>';
    
    try {
        const data = await getLeaderboard();
        
        if (data.length === 0) {
            leaderboardDiv.innerHTML = '<p class="loading">아직 기록이 없습니다. 게임을 완료하면 기록이 표시됩니다!</p>';
            return;
        }
        
        leaderboardDiv.innerHTML = data.map((item, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            return `
                <div class="leaderboard-item ${rankClass}">
                    <span class="leaderboard-rank">${rank}</span>
                    <span class="leaderboard-name">${item.player_name}</span>
                    <span class="leaderboard-score">${item.attempts}회 / ${item.time_taken}초</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        leaderboardDiv.innerHTML = '<p class="loading">리더보드를 불러올 수 없습니다. 콘솔을 확인하세요.</p>';
        console.error('리더보드 로드 오류:', error);
    }
}

// 점수 제출
async function submitScore() {
    const playerName = document.getElementById('player-name').value.trim();
    
    if (!playerName) {
        alert('이름을 입력해주세요.');
        return;
    }
    
    if (!window.gameScore) {
        alert('점수 정보를 찾을 수 없습니다.');
        return;
    }
    
    const submitBtn = document.getElementById('submit-score-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';
    
    try {
        await saveScore(
            playerName,
            window.gameScore.score,
            window.gameScore.timeTaken,
            window.gameScore.attempts
        );
        
        alert('리더보드에 등록되었습니다!');
        closeModal();
        loadLeaderboard();
    } catch (error) {
        // 에러 메시지 표시 (로컬 스토리지 사용 시 거의 실패하지 않음)
        const errorMessage = error.message || '점수 저장에 실패했습니다. 다시 시도해주세요.';
        alert(errorMessage);
        console.error('점수 저장 오류:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '리더보드에 등록';
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('game-over-modal');
    modal.classList.remove('show');
    document.getElementById('player-name').value = '';
}

// 이벤트 리스너
document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('submit-score-btn').addEventListener('click', submitScore);
document.getElementById('close-modal-btn').addEventListener('click', closeModal);

// Enter 키로 점수 제출
document.getElementById('player-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitScore();
    }
});

// 게임 시작
initGame();

