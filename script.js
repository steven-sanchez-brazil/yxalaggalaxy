const hexagons = document.querySelectorAll('.hexagon');
const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;
const hexagonSize = 40;
let score = 0;
let cubesLeft = 10;
let gameEnded = false;
let gameStarted = false;
let startTime;
let timerInterval;

// Crear contexto de audio para sonido de explosión
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playExplosionSound() {
    try {
        initAudio();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar sonido de explosión
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.type = 'sawtooth';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Audio no disponible:', error);
    }
}

// Inicializar audio con la primera interacción del usuario
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('mouseenter', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

// Agregar event listeners para explosión al tocar
hexagons.forEach(hexagon => {
    hexagon.addEventListener('mouseenter', explodeCube);
});

// Referencias a los elementos de la UI
const scoreElement = document.getElementById('scoreValue');
const cubesLeftElement = document.getElementById('cubesLeftValue');
const timerElement = document.getElementById('timerValue');

// Botón de start
const startButton = document.getElementById('startButton');
const startScreen = document.getElementById('startScreen');

startButton.addEventListener('click', startGame);

function startGame() {
    gameStarted = true;
    startTime = Date.now();
    startScreen.style.display = 'none';
    
    // Iniciar timer
    timerInterval = setInterval(() => {
        if (!gameEnded) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = elapsed;
        }
    }, 1000);
    
    // Iniciar el loop de animación
    update();
}

function resetGame() {
    // Resetear variables del juego
    score = 0;
    cubesLeft = 10;
    gameEnded = false;
    gameStarted = false;
    
    // Resetear UI
    scoreElement.textContent = '0';
    cubesLeftElement.textContent = '10';
    timerElement.textContent = '0';
    
    // Mostrar pantalla de inicio
    startScreen.style.display = 'flex';
    
    // Recrear todos los cubos
    recreateCubes();
}

function recreateCubes() {
    const gameContainer = document.querySelector('.game');
    
    // Limpiar cubos existentes
    gameContainer.innerHTML = '';
    
    // Recrear 10 cubos
    for (let i = 1; i <= 10; i++) {
        const cube = document.createElement('div');
        cube.className = 'hexagon';
        cube.id = `ball${i}`;
        
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(face => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `cube-face ${face}`;
            cube.appendChild(faceDiv);
        });
        
        cube.addEventListener('mouseenter', explodeCube);
        gameContainer.appendChild(cube);
    }
    
    // Recrear configuraciones
    const newHexagons = document.querySelectorAll('.hexagon');
    hexagonConfigs.length = 0;
    
    for (let i = 0; i < newHexagons.length; i++) {
        hexagonConfigs.push({
            element: newHexagons[i],
            x: Math.random() * (gameWidth - hexagonSize),
            y: Math.random() * (gameHeight - hexagonSize),
            speedX: randomSpeed(),
            speedY: randomSpeed(),
        });
    }
}

function explodeCube(event) {
    const cube = event.currentTarget;
    
    // Evitar múltiples explosiones o si el juego no ha empezado/terminado
    if (cube.classList.contains('exploding') || gameEnded || !gameStarted) return;
    
    // Reproducir sonido de explosión
    playExplosionSound();
    
    // Agregar clase de explosión
    cube.classList.add('exploding');
    
    // Incrementar score y decrementar cubos restantes
    score++;
    cubesLeft--;
    scoreElement.textContent = score;
    cubesLeftElement.textContent = cubesLeft;
    
    // Verificar si el juego terminó
    if (cubesLeft <= 0) {
        gameEnded = true;
        clearInterval(timerInterval);
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        setTimeout(() => {
            alert(`¡Juego Terminado!\nPuntuación Final: ${score}\nTiempo: ${finalTime} segundos`);
            resetGame();
        }, 500);
    }
    
    console.log('Score:', score, 'Cubes Left:', cubesLeft);
    
    // Remover el cubo permanentemente después de la animación
    setTimeout(() => {
        cube.remove();
        
        // Remover la configuración del cubo del array
        const configIndex = hexagonConfigs.findIndex(c => c.element === cube);
        if (configIndex !== -1) {
            hexagonConfigs.splice(configIndex, 1);
        }
    }, 500);
}



function randomSpeed() {
    return (Math.random() - 0.5) * 2.5; // Generamos velocidades aleatorias entre -2.5 y 2.5
}

// Crear configuraciones para todos los 20 cubos
const hexagonConfigs = [];
for (let i = 0; i < hexagons.length; i++) {
    hexagonConfigs.push({
        element: hexagons[i],
        x: Math.random() * (gameWidth - hexagonSize),
        y: Math.random() * (gameHeight - hexagonSize),
        speedX: randomSpeed(),
        speedY: randomSpeed(),
    });
}

function checkCollision(hex1, hex2) {
    const dx = hex1.x - hex2.x;
    const dy = hex1.y - hex2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < hexagonSize; // Check if the distance is less than the hexagon size
}

function update() {
    // Iterar sobre una copia del array para evitar problemas al eliminar elementos
    [...hexagonConfigs].forEach((config, index) => {
        // Solo mover cubos que no están explotando
        if (!config.element.classList.contains('exploding')) {
            config.x += config.speedX;
            config.y += config.speedY;

            if (config.y <= 0 || config.y >= gameHeight - hexagonSize) {
                config.speedY *= -1;
            }

            if (config.x <= 0 || config.x >= gameWidth - hexagonSize) {
                config.speedX *= -1;
            }

            // Collision detection with other hexagons
            for (let i = index + 1; i < hexagonConfigs.length; i++) {
                const otherConfig = hexagonConfigs[i];
                if (!otherConfig.element.classList.contains('exploding') &&
                    checkCollision(config, otherConfig)) {
                    // Swap speeds for a simple bounce effect
                    const tempSpeedX = config.speedX;
                    const tempSpeedY = config.speedY;
                    config.speedX = otherConfig.speedX;
                    config.speedY = otherConfig.speedY;
                    otherConfig.speedX = tempSpeedX;
                    otherConfig.speedY = tempSpeedY;
                }
            }

            config.element.style.left = config.x + 'px';
            config.element.style.top = config.y + 'px';
        }
    });

    requestAnimationFrame(update);
}

// El juego se inicia solo cuando se presiona el botón START