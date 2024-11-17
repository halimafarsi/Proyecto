document.addEventListener('DOMContentLoaded', async function () {
    const btnTheme = document.getElementById('btnTheme');
    const btnVersion = document.getElementById('btnVersion');
    const topicSelection = document.getElementById('topic-selection');
    const topicsList = document.getElementById('topics-list');
    const gameSection = document.getElementById('game');
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const feedbackElement = document.getElementById('feedback');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const topicTitle = document.getElementById('topic-title');
    const imageElement = document.getElementById('question-image');
    const resultSection = document.getElementById('result-section');
    const finalScoreElement = document.getElementById('final-score');
    const replayButton = document.getElementById('replay-button');
    const memorizationSection = document.getElementById('memorization-section');
    const memorizationWords = document.getElementById('memorization-words');

    let currentTopic = '';
    let currentWords = [];
    let currentExpressions = [];
    let currentIndex = 0;
    let score = 0;
    let timer;
    let db = {};

    async function loadDatabase() {
        try {
            const response = await fetch('db.json');
            db = await response.json();
        } catch (error) {
            console.error('Error al cargar la base de datos:', error);
        }
    }

    await loadDatabase();

    function startGame(themeOrVersion) {
        currentTopic = themeOrVersion === 'theme' ? 'Thème' : 'Version';
        const topics = Object.keys(db.themes);
        topicsList.innerHTML = '';
        topics.forEach(topic => {
            const div = document.createElement('div');
            div.classList.add('memorization-item');
            div.textContent = topic;
            div.addEventListener('click', () => startTopic(topic));
            topicsList.appendChild(div);
        });
        topicSelection.style.display = 'block';
        gameSection.style.display = 'none';
        resultSection.style.display = 'none';
        memorizationSection.style.display = 'none';
        replayButton.style.display = 'none';
    }

    function startTopic(topic) {
        currentWords = db.themes[topic].sort(() => Math.random() - 0.5).slice(0, 10);
        currentExpressions = db.expressions.sort(() => Math.random() - 0.5).slice(0, 3);
        currentIndex = 0;
        score = 0;
        topicTitle.textContent = topic;
        topicSelection.style.display = 'none';
        gameSection.style.display = 'none';
        resultSection.style.display = 'none';
        memorizationSection.style.display = 'block';
        showMemorizationWords();
    }

    function showMemorizationWords() {
        memorizationWords.innerHTML = '';

        currentWords.forEach(wordPair => {
            const div = document.createElement('div');
            div.classList.add('memorization-item');
            div.innerHTML = `<strong>${wordPair.fr}</strong> - ${wordPair.es}`;
            memorizationWords.appendChild(div);
        });

        setTimeout(() => {
            memorizationSection.style.display = 'none';
            gameSection.style.display = 'block';
            loadNextWord();
        }, 20000);
    }

    function loadNextWord() {
        if (currentIndex < 10) {
            const wordPair = currentWords[currentIndex];
            questionElement.textContent = currentTopic === 'Thème' ? wordPair.fr : wordPair.es;

            if (wordPair.img) {
                imageElement.src = wordPair.img;
                imageElement.style.display = 'block';
                imageElement.onerror = () => {
                    imageElement.style.display = 'none';
                };
            } else {
                imageElement.style.display = 'none';
            }
            startTimer();
        } else {
            loadNextExpression();
        }
    }

    function loadNextExpression() {
        if (currentIndex < 13) {
            const expressionPair = currentExpressions[currentIndex - 10];
            questionElement.textContent = currentTopic === 'Thème' ? expressionPair.fr : expressionPair.es;

            if (expressionPair.img) {
                imageElement.src = expressionPair.img;
                imageElement.style.display = 'block';
                imageElement.onerror = () => {
                    imageElement.style.display = 'none';
                };
            } else {
                imageElement.style.display = 'none';
            }

            startTimer();
        } else {
            checkFinalAnswer();
        }
    }

    function checkAnswer() {
        let correctAnswers, userAnswer;

        if (currentIndex < 10) {
            const wordPair = currentWords[currentIndex];
            correctAnswers = (currentTopic === 'Thème' ? wordPair.es : wordPair.fr).toLowerCase().split(',').map(ans => ans.trim());
            userAnswer = answerInput.value.trim().toLowerCase();
        } else {
            const expressionPair = currentExpressions[currentIndex - 10];
            correctAnswers = (currentTopic === 'Thème' ? expressionPair.es : expressionPair.fr).toLowerCase().split(',').map(ans => ans.trim());
            userAnswer = answerInput.value.trim().toLowerCase();
        }

        if (correctAnswers.includes(userAnswer)) {
            feedbackElement.textContent = '¡Correcto!';
            score++;
            scoreElement.textContent = `Puntuación: ${score}`;
        } else {
            feedbackElement.textContent = `Incorrecto. Las respuestas correctas son: ${correctAnswers.join(', ')}`;
        }

        answerInput.value = '';
        currentIndex++;

        if (currentIndex < 10) {
            loadNextWord();
        } else if (currentIndex < 13) {
            loadNextExpression();
        } else {
            endGame();
        }
    }

    function startTimer() {
        let timeLeft = 60;
        timerElement.textContent = `Tiempo: ${timeLeft}s`;
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Tiempo: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                checkAnswer();
            }
        }, 1000);
    }

    function endGame() {
        gameSection.style.display = 'none';
        resultSection.style.display = 'block';
        finalScoreElement.textContent = `Tu puntuación final es: ${score} de 13`;
        replayButton.style.display = 'block'; // Mostrar el botón "Jugar de nuevo" en la sección de resultados
    }

    btnTheme.addEventListener('click', () => startGame('theme'));
    btnVersion.addEventListener('click', () => startGame('version'));
    document.getElementById('submit-answer').addEventListener('click', () => {
        clearInterval(timer);
        checkAnswer();
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            clearInterval(timer);
            checkAnswer();
        }
    });

    replayButton.addEventListener('click', () => {
        startGame(currentTopic === 'Thème' ? 'theme' : 'version');
    });

    replayButton.addEventListener('click', () => {
        startGame(currentTopic === 'Thème' ? 'theme' : 'version');
    });
}); 
