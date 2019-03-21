class AudioController {
    constructor() {
        this.bgMusic = new Audio("./data/audio/dance.mp3");
        this.flipSound = new Audio('./data/audio/flamingoquack.mp3');
        this.matchSound = new Audio('./data/audio/match.mp3');
        this.victorySound = new Audio('./data/audio/dance.mp3');
        this.gameOverSound = new Audio('./data/audio/loser.mp3');
        
        this.bgMusic.volume = 0.05;
        this.flipSound.volume = 0.2;
        this.matchSound.volume = 0.2;
        this.victorySound.volume = 0.2;
        this.gameOverSound.volume = 0.2;

        this.bgMusic.loop = true;
    }
    startMusic() {
        if(!this.gameOverSound.paused)
            this.stopGameOverMusic() 
        if(!this.victorySound.paused)
            this.stopVictoryMusic() 
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    stopVictoryMusic() {
        this.victorySound.pause();
        this.victorySound.currentTime = 0;
    }
    stopGameOverMusic() {
        this.gameOverSound.pause();
        this.gameOverSound.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MemoryGame {
    //Constructor
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining')
        this.ticker = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    startGame() {
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.cardToCheck = null;
        this.matchedCards = [];
        this.busy = true;
        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards(this.cardsArray);
            this.countdown = this.startCountdown();
            this.busy = false;
        }, 500)
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }
    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }
    gameOver() {
        clearInterval(this.countdown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }
    victory() {
        clearInterval(this.countdown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
    }
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else 
            this.cardMismatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }
    cardMismatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
    shuffleCards(cardsArray) { // Fisher-Yates Shuffle Algorithm.
        for (let i = cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            let temp = cardsArray[randIndex].getElementsByClassName('front-cover')[0].src;
            cardsArray[randIndex].getElementsByClassName('front-cover')[0].src =
             cardsArray[i].getElementsByClassName('front-cover')[0].src;
            cardsArray[i].getElementsByClassName('front-cover')[0].src = temp;
        }
    }

    getCardType(card) {
        return card.getElementsByClassName('front-cover')[0].src;
    }

    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }

    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck) {
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }
}

//We first start here
// Wait until the page loads before the script runs.
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    // Get overlays, cards elemeents using their classes
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));

    let game = new MemoryGame(100, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            // we first want to remove the overlay visibility 
            //and then, we start the game
            overlay.classList.remove('visible');
            game.startGame();
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}