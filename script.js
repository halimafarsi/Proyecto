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

    let currentTopic = '';
    let currentWords = [];
    let currentExpressions = [];
    let currentIndex = 0;
    let score = 0;
    let timer;
    let db = {};

    // Cargar el JSON al iniciar
    async function loadDatabase() {
        try {
            const response = await fetch('db.json'); // Ruta del archivo JSON
            db = await response.json();
        } catch (error) {
            console.error('Error al cargar la base de datos:', error);
        }
    }

    // Llamar a la función para cargar la base de datos
    await loadDatabase();

    function startGame(themeOrVersion) {
        currentTopic = themeOrVersion === 'theme' ? 'Thème' : 'Version';
        const topics = Object.keys(db.themes);
        topicsList.innerHTML = '';
        topics.forEach(topic => {
            const li = document.createElement('li');
            li.textContent = topic;
            li.addEventListener('click', () => startTopic(topic));
            topicsList.appendChild(li);
        });
        topicSelection.style.display = 'block';
        gameSection.style.display = 'none';
        resultSection.style.display = 'none';
    }

    function startTopic(topic) {
        currentWords = db.themes[topic].sort(() => Math.random() - 0.5).slice(0, 10);  // Selección aleatoria de 10 palabras
        currentExpressions = db.expressions.sort(() => Math.random() - 0.5).slice(0, 3); // Selección aleatoria de 3 expresiones
        currentIndex = 0;
        score = 0;
        topicTitle.textContent = topic;
        topicSelection.style.display = 'none';
        gameSection.style.display = 'block';
        scoreElement.textContent = `Puntuación: ${score}`;
        loadNextWord();
        answerInput.focus(); // Foco automático en el campo de entrada
    }

    function loadNextWord() {
        if (currentIndex < 10) {
            const wordPair = currentWords[currentIndex];
            questionElement.textContent = currentTopic === 'Thème' ? wordPair.fr : wordPair.es;

            if (wordPair.img) {
                console.log("Intentando cargar la imagen desde:", wordPair.img); // Log de depuración
                imageElement.src = wordPair.img;
                imageElement.style.display = 'block';
            } else {
                console.log("No se encontró imagen para esta palabra."); // Log de depuración
                imageElement.style.display = 'none';
            }

            startTimer();
        } else {
            loadNextExpression();
        }
    }

    function loadNextExpression() {
        if (currentIndex < 13) { // 10 palabras + 3 expresiones
            const expressionPair = currentExpressions[currentIndex - 10];
            questionElement.textContent = currentTopic === 'Thème' ? expressionPair.fr : expressionPair.es;

            if (expressionPair.img) {
                console.log("Intentando cargar la imagen desde:", expressionPair.img); // Log de depuración
                imageElement.src = expressionPair.img;
                imageElement.style.display = 'block';
            } else {
                console.log("No se encontró imagen para esta expresión."); // Log de depuración
                imageElement.style.display = 'none';
            }

            startTimer();
        } else {
            endGame();
        }
    }

    function checkAnswer() {
        if (currentIndex < 10) {
            const wordPair = currentWords[currentIndex];
            const correctAnswer = currentTopic === 'Thème' ? wordPair.es : wordPair.fr;
            if (answerInput.value.trim().toLowerCase() === correctAnswer.toLowerCase()) {
                feedbackElement.textContent = 'Correcto!';
                score++;
                scoreElement.textContent = `Puntuación: ${score}`;
            } else {
                feedbackElement.textContent = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
            }
        } else {
            const expressionPair = currentExpressions[currentIndex - 10];
            const correctAnswer = currentTopic === 'Thème' ? expressionPair.es : expressionPair.fr;
            if (answerInput.value.trim().toLowerCase() === correctAnswer.toLowerCase()) {
                feedbackElement.textContent = 'Correcto!';
                score++;
                scoreElement.textContent = `Puntuación: ${score}`;
            } else {
                feedbackElement.textContent = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
            }
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
    }

    btnTheme.addEventListener('click', () => startGame('theme'));
    btnVersion.addEventListener('click', () => startGame('version'));

    // Enviar respuesta con el botón o con la tecla "Enter"
    answerInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            clearInterval(timer);
            checkAnswer();
        }
    });

    document.getElementById('submit-answer').addEventListener('click', () => {
        clearInterval(timer);
        checkAnswer();
    });

    replayButton.addEventListener('click', () => {
        topicSelection.style.display = 'block';
        resultSection.style.display = 'none';
    });
});


