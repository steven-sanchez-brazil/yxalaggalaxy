const hexagons = document.querySelectorAll('.hexagon');
const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;
const hexagonSize = 40;

function randomSpeed() {
    return (Math.random() - 0.5) * 2.5; // Generamos velocidades aleatorias entre -2.5 y 2.5
}

const hexagonConfigs = [
    {
        element: hexagons[0],
        x: gameWidth / 3 - hexagonSize / 2,
        y: gameHeight / 2 - hexagonSize / 2,
        speedX: randomSpeed(),
        speedY: randomSpeed(),
    },
    {
        element: hexagons[1],
        x: (2 * gameWidth) / 3 - hexagonSize / 2,
        y: gameHeight / 2 - hexagonSize / 2,
        speedX: randomSpeed(),
        speedY: randomSpeed(),
    },
    {
        element: hexagons[2], // Nuevo hexágono
        x: gameWidth / 2 - hexagonSize / 2,
        y: gameHeight / 3 - hexagonSize / 2,
        speedX: randomSpeed(),
        speedY: randomSpeed(),
    },
    {
        element: hexagons[3], // Nuevo hexágono
        x: gameWidth / 2 - hexagonSize / 2,
        y: (2 * gameHeight) / 3 - hexagonSize / 2,
        speedX: randomSpeed(),
        speedY: randomSpeed(),
    },
    {
        element: hexagons[4], // Nuevo hexágono
        x: gameWidth / 4 - hexagonSize / 2,
        y: gameHeight / 4 - hexagonSize / 2,
        speedX: randomSpeed(),
        speedY: randomSpeed(),
    },
    {
        element: hexagons[5], // Nuevo hexágono
        x: (3 * gameWidth) / 4 - hexagonSize / 2,
        y: gameHeight / 4 - hexagonSize / 2,
        speedX: randomSpeed(),
        speedY: randomSpeed(),
    },
];

function update() {
    hexagonConfigs.forEach((config) => {
        config.x += config.speedX;
        config.y += config.speedY;

        if (config.y <= 0 || config.y >= gameHeight - hexagonSize) {
            config.speedY *= -1;
        }

        if (config.x <= 0 || config.x >= gameWidth - hexagonSize) {
            config.speedX *= -1;
        }

        config.element.style.left = config.x + 'px';
        config.element.style.top = config.y + 'px';
    });

    requestAnimationFrame(update);
}

update();
