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
        showMemorizationPhase();
    }

    function showMemorizationPhase() {
        let memorizationText = 'Tiene 30 segundos para memorizar las palabras:\n\n';
        currentWords.forEach(pair => {
            memorizationText += `${pair.fr} - ${pair.es}\n`;
        });

        alert(memorizationText); // Muestra las palabras para que el usuario las memorice.

        setTimeout(() => {
            alert("¡El tiempo para memorizar ha terminado! El juego comienza ahora.");
            loadNextWord();
        }, 30000); // 30 segundos para memorizar
    }

    function loadNextWord() {
        if (currentIndex < 10) {
            const wordPair = currentWords[currentIndex];
            questionElement.textContent = currentTopic === 'Thème' ? wordPair.fr : wordPair.es;

            if (wordPair.img) {
                console.log("Intentando cargar la imagen desde:", wordPair.img);
                imageElement.src = wordPair.img;
                imageElement.style.display = 'block';

                // Verifica si la imagen se carga correctamente
                imageElement.onerror = () => {
                    console.log("No se pudo cargar la imagen desde la URL:", wordPair.img);
                    imageElement.style.display = 'none';
                };

            } else {
                console.log("No se encontró imagen para esta palabra.");
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
                console.log("Intentando cargar la imagen desde:", expressionPair.img);
                imageElement.src = expressionPair.img;
                imageElement.style.display = 'block';

                // Verifica si la imagen se carga correctamente
                imageElement.onerror = () => {
                    console.log("No se pudo cargar la imagen desde la URL:", expressionPair.img);
                    imageElement.style.display = 'none';
                };

            } else {
                console.log("No se encontró imagen para esta expresión.");
                imageElement.style.display = 'none';
            }

            startTimer();
        } else {
            checkFinalAnswer();
        }
    }

    function checkAnswer() {
        let correctAnswer;

        if (currentIndex < 10) {
            const wordPair = currentWords[currentIndex];
            correctAnswer = currentTopic === 'Thème' ? wordPair.es : wordPair.fr;
        } else {
            const expressionPair = currentExpressions[currentIndex - 10];
            correctAnswer = currentTopic === 'Thème' ? expressionPair.es : expressionPair.fr;
        }

        const userAnswer = answerInput.value.trim().toLowerCase(); // Convertir a minúsculas

        if (userAnswer === correctAnswer.toLowerCase()) { // Comparar en minúsculas
            feedbackElement.textContent = '¡Correcto!';
            score++;
            scoreElement.textContent = `Puntuación: ${score}`;
        } else {
            feedbackElement.textContent = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
        }

        answerInput.value = '';
        currentIndex++;

        if (currentIndex < 10) {
            loadNextWord();
        } else if (currentIndex < 13) {
            loadNextExpression();
        } else {
            checkFinalAnswer();
        }
    }

    function checkFinalAnswer() {
        const expressionPair = currentExpressions[currentIndex - 10];
        const correctAnswer = currentTopic === 'Thème' ? expressionPair.es : expressionPair.fr;
        const userAnswer = answerInput.value.trim().toLowerCase(); // Convertir a minúsculas

        if (userAnswer === correctAnswer.toLowerCase()) {
            feedbackElement.textContent = '¡Correcto!';
            score++;
            scoreElement.textContent = `Puntuación: ${score}`;
        } else {
            feedbackElement.textContent = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
        }

        // Mostrar la respuesta correcta por 5 segundos antes de mostrar el resultado final
        setTimeout(endGame, 5000); // Espera 5 segundos antes de mostrar el resultado final
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
    document.getElementById('submit-answer').addEventListener('click', () => {
        clearInterval(timer);
        checkAnswer();
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            clearInterval(timer); // Detener el temporizador si está en curso
            checkAnswer();
        }
    });

    replayButton.addEventListener('click', () => {
        topicSelection.style.display = 'block';
        resultSection.style.display = 'none';
    });
});

