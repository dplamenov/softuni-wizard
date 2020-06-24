const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameOver = document.querySelector('.game-over');
const gamePoints = document.querySelector('.points');

let wizard = undefined;
let id = 0;
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
    lastFireBall: 0,
    lastCloud: 0,
    lastBug: 0
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

function isCollision(first, second) {
    const firstRect = first.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();

    return !(
        firstRect.top > secondRect.bottom ||
        firstRect.bottom < secondRect.top ||
        firstRect.right < secondRect.left ||
        firstRect.left > secondRect.right
    );
}

function gameOverFunc() {
    window.cancelAnimationFrame(id);
    gameOver.classList.remove('hide');
}

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
    id = window.requestAnimationFrame(gameAction);
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


    if (timestamp - game.lastCloud > 2000 + 20000 * Math.random()) {
        let cloud = document.createElement('div');
        cloud.classList.add('cloud');
        cloud.style.left = `${gameArea.offsetWidth - 200}px`;
        cloud.style.top = `${(gameArea.offsetHeight - 200) * Math.random()}px`;
        gameArea.appendChild(cloud);
        game.lastCloud = timestamp;
    }

    const clouds = [...document.querySelectorAll('.cloud')];
    clouds.forEach(cloud => {
        cloud.style.left = utils.numberToPx(utils.pxToNumber(cloud.style.left) - game.speed);

        if (utils.pxToNumber(cloud.style.left) <= 0) {
            cloud.remove();
        }
    });

    if (timestamp - game.lastBug > 1500 + 5000 * Math.random()) {
        let bug = document.createElement('div');
        bug.classList.add('bug');
        bug.style.left = `${gameArea.offsetWidth - 60}px`;
        bug.style.top = `${(gameArea.offsetHeight - 60) * Math.random()}px`;
        gameArea.appendChild(bug);
        game.lastBug = timestamp;
    }

    let bugs = [...document.querySelectorAll('.bug')];
    bugs.forEach(bug => {
        bug.style.left = `${utils.pxToNumber(bug.style.left) - game.speed * 3}px`;


        if (isCollision(wizard, bug)) {
            return gameOverFunc();
        }

        fireBalls.forEach(function (fireBall) {
            if(isCollision(fireBall, bug)){
                bug.remove();
                fireBall.remove();
                scene.score += 1000;
            }
        });

        if (utils.pxToNumber(bug.style.left) <= 0) {
            bug.remove();
        }
    });
}