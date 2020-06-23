const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameOver = document.querySelector('.game-over');
const gameScore = document.querySelector('.game-score');
const gamePoints = document.querySelector('.points');

let wizard = undefined;

const keys = {};
const scene = {
    get score() {
        return Number(gamePoints.textContent);
    },
    set score(v) {
        console.log(wizardCoordinates.isInAir());
        if (!wizardCoordinates.isInAir()) {
            return;
        }
        gamePoints.textContent = v;
    }
};

const game = {
    speed: 2,
    wizardMultiplier: 4
};

function onKeyDown(e) {
    keys[e.code] = true;
}

function onKeyUp(e) {
    delete keys[e.code];
}

const utils = {
    pxToNumber(px) {
        return Number(px.replace('px', ''));
    },
    numberToPx(n) {
        return `${n}px`;
    }
};

const wizardCoordinates = {
    init(wizard) {
        this.wizard = wizard;
    },
    get x() {
        return utils.pxToNumber(this.wizard.style.left);
    },
    get y() {
        return utils.pxToNumber(this.wizard.style.top);
    },
    set y(newValue) {
        if (newValue < 0) {
            newValue = 0;
        } else if (newValue + wizard.offsetHeight >= gameArea.offsetHeight) {
            newValue = gameArea.offsetHeight - wizard.offsetHeight;
        }
        this.wizard.style.top = utils.numberToPx(newValue);
    },
    set x(newValue) {
        if (newValue < 0) {
            newValue = 0;
        } else if (newValue + wizard.offsetWidth >= gameArea.offsetWidth) {
            newValue = gameArea.offsetWidth - wizard.offsetWidth;
        }
        this.wizard.style.left = utils.numberToPx(newValue);
    },
    isInAir() {
        return (wizardCoordinates.y  +wizard.offsetHeight) < gameArea.offsetHeight;
    }

};

const keyMapping = {
    ArrowUp() {
        wizardCoordinates.y -= game.speed * game.wizardMultiplier;
    },
    ArrowDown() {
        wizardCoordinates.y += game.speed * game.wizardMultiplier;
    },
    ArrowLeft() {
        wizardCoordinates.x -= game.speed * game.wizardMultiplier;
    },
    ArrowRight() {
        wizardCoordinates.x += game.speed * game.wizardMultiplier;
    }
};

function processKeys() {
    Object.keys(keys).forEach(key => {
        if (keyMapping.hasOwnProperty(key)) {
            keyMapping[key]();
        }
    });
}

gameStart.addEventListener('click', function gameStartHandler() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    gameStart.classList.add('hide');

    wizard = document.createElement('div');
    wizard.classList.add('wizard');
    wizard.style.top = '200px';
    wizard.style.left = '200px';

    gameArea.appendChild(wizard);
    wizardCoordinates.init(wizard);

    window.requestAnimationFrame(gameAction);
});


function gameAction(timestamp) {
    processKeys();

    if (wizardCoordinates.isInAir()) {
        wizardCoordinates.y += game.speed;
    }
    scene.score++;
    window.requestAnimationFrame(gameAction);
}