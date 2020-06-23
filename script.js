const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameOver = document.querySelector('.game-over');
const gameScore = document.querySelector('.game-score');
const gamePoints = document.querySelector('.points');

let wizard = undefined;

const keys = {};
let upKeysQueue = [];
const scene = {
    get score() {
        return Number(gamePoints.textContent);
    },
    set score(v) {
        if (!wizardCoordinates.isInAir()) {
            return;
        }
        gamePoints.textContent = v;
    }
};

const game = {
    speed: 2,
    wizardMultiplier: 4,
    lastFireBall: 0
};

function onKeyDown(e) {
    keys[e.code] = true;
}

function onKeyUp(e) {
    upKeysQueue.push(upKeyMapping[e.code]);
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
        return (wizardCoordinates.y + wizard.offsetHeight) < gameArea.offsetHeight;
    }

};

const downKeyMapping = {
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
    },
    Space(timestamp) {
        wizard.classList.add('wizard-fire');
        if (timestamp - 1000 > game.lastFireBall) {
            game.lastFireBall = timestamp;
            addFireBall(wizardCoordinates);
        }
    }
};

const upKeyMapping = {
    Space() {
        wizard.classList.remove('wizard-fire');
    }
};

function processKeys(timestamp) {
    Object.keys(keys).forEach(key => {
        if (downKeyMapping.hasOwnProperty(key)) {
            downKeyMapping[key](timestamp);
        }
    });

    upKeysQueue = upKeysQueue.reduce((acc, current) => {
        if (current !== undefined) {
            current();
        }
        return acc.slice(-1);
    }, []);
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

function addFireBall(player) {
    const fireBall = document.createElement('div');
    fireBall.classList.add('fire-ball');
    fireBall.style.top = (player.y + wizard.offsetHeight / 3 - 5) + 'px';
    fireBall.x = player.x + wizard.offsetWidth;
    fireBall.style.left = fireBall.x + 'px';
    gameArea.appendChild(fireBall);
}


function gameAction(timestamp) {
    processKeys(timestamp);

    if (wizardCoordinates.isInAir()) {
        wizardCoordinates.y += game.speed;
    }
    scene.score++;


    const fireBalls = [...document.querySelectorAll('.fire-ball')];
    fireBalls.forEach(function (fireBall) {
        fireBall.x += (game.speed * 5);
        fireBall.style.left = `${fireBall.x}px`;
        if (fireBall.x + fireBall.offsetWidth > gameArea.offsetWidth) {
            fireBall.remove();
        }
    });
    window.requestAnimationFrame(gameAction);
}