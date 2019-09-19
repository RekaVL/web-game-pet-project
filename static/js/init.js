import {deal} from "./dealLogic.js";

export let init = {
    init: function () {
        let startButton = document.querySelector('#start-btn');
        startButton.addEventListener('click', function () {
            let deckStyle = document.querySelector('input[name="deck"]:checked').value;
            localStorage.setItem("deckType", `${deckStyle}`);

            init.initGameField();
            init.initGame();
        });
    },

    initGameField: function () {
        let body = document.querySelector('body');
        body.innerHTML = '';

        let dealButton = document.createElement('button');
        dealButton.textContent = 'Deal';
        dealButton.classList.add('deal-btn');
        body.appendChild(dealButton);

        let container = document.createElement('div');
        container.classList.add('container');
        body.appendChild(container);

        let hitButton = document.createElement('button');
        hitButton.classList.add('hit-btn');
        hitButton.textContent = 'Hit';
        container.appendChild(hitButton);

        let standButton = document.createElement('button');
        standButton.classList.add('stand-btn');
        standButton.textContent = 'Stand';
        container.appendChild(standButton);

        let dealerCards = document.createElement('div');
        dealerCards.classList.add('dealer-cards');
        container.appendChild(dealerCards);

        let cards = document.createElement('div');
        cards.classList.add('cards');
        container.appendChild(cards);
    },

    initGame: function () {
        const fullDeck = deal.createDeck(2);
        let newDeck = [];
        const hands = {dealer: [], player: []};
        let payOut = 0;

        let cards = document.querySelector('.cards');
        let dealerCards = document.querySelector('.dealer-cards');

        const btnDeal = document.querySelector('.deal-btn');
        const btnStand = document.querySelector('.stand-btn');
        const btnHit = document.querySelector('.hit-btn');
        const buttons = [btnStand, btnHit];

        btnDeal.addEventListener('click', function () {
            newDeck = [];
            init.nextRound(cards, dealerCards, buttons);
            init.startRound(newDeck, fullDeck, hands, buttons, payOut);

            if (init.checkForBlackjack()) {
            init.toggleButtons(buttons, 'hide');
            init.flipDealerCards(hands, dealerCards);
            payOut = init.checkScore();
            }
        });

        btnStand.addEventListener('click', function () {
            init.flipDealerCards(hands, dealerCards);
            while (init.cardCounter('dealer') < 17 && (init.cardCounter('dealer') <= init.cardCounter('player'))) {
                init.dealerHit(newDeck, fullDeck, hands, dealerCards);
            }
            if (init.checkForBust('dealer')) {
                payOut = 2;
            } else {
                payOut = init.checkScore();
            }
        });

        btnHit.addEventListener('click', function () {
            let hit = (deal.dealCards(1, newDeck, fullDeck)[0]);
            hands.player.push(hit[0]);
            init.addCard(hit, cards, 'player');
            init.showCardSum(init.cardCounter('player'));
            if (init.checkForBust('player')) {
                init.toggleButtons(buttons, 'hide');
                payOut = 0;
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                console.log(payOut);
                console.log(newDeck);
            }
        });
    },

    addCard: function (card, cardContainer, playerClass) {
        let newCard = document.createElement('img');
        newCard.classList.add(`${playerClass}-card`);
        if (cardContainer.childElementCount + 1 > 1) {
            newCard.style.position = "relative";
            let leftPosition = 40 * cardContainer.childElementCount;
            newCard.style.left = `${leftPosition}px`
        }

        const deckType = localStorage.getItem("deckType");
        let loadFile;
        if (deckType === 'art') {
            loadFile = ['art', 'jpg'];
            newCard.classList.add("art-deck");
        } else {
            loadFile = ['classic', 'png']
        }


        newCard.setAttribute('src', `../static/images/${loadFile[0]}/${card.slice(0, 2)}.${loadFile[1]}`);
        newCard.dataset.value = `${card.slice(0, 1)}`;
        cardContainer.appendChild(newCard);
    },

    addCardFaceDown: function (card, cardContainer) {

        let newCard = document.createElement('img');
        newCard.classList.add("dealer-card");
        if (cardContainer.childElementCount + 1 > 1) {
            newCard.style.position = "relative";
            let leftPosition = 40 * cardContainer.childElementCount;
            newCard.style.left = `${leftPosition}px`;
        }

        const deckType = localStorage.getItem("deckType");
        let loadFile;
        if (deckType === 'art') {
            loadFile = ['art', 'jpg'];
            newCard.classList.add("art-deck")
        } else {
            loadFile = ['classic', 'png']
        }

        if (cardContainer.childElementCount + 1 <= 1) {
            newCard.setAttribute('src', `../static/images/${loadFile[0]}/${card.slice(0, 2)}.${loadFile[1]}`)
        } else {
            let randomBackCard = Math.random();
            if (randomBackCard > 0.5 && deckType === 'classic') {
                newCard.setAttribute('src', `../static/images/${loadFile[0]}/redback.${loadFile[1]}`);
            } else {
                newCard.setAttribute('src', `../static/images/${loadFile[0]}/back.${loadFile[1]}`);
            }
        }

        if (`${cardContainer.childElementCount + 1}` > 3 && `${card.slice(0, 1)}` === "A" && init.cardCounter() > 10) {
            newCard.dataset.value = '1';
        } else {
            newCard.dataset.value = `${card.slice(0, 1)}`;
        }
        cardContainer.appendChild(newCard);
    },

    initCards: function (newDeck, fullDeck, hands) {
        let cardContainer = document.querySelector('.cards');
        hands.player = deal.dealCards(2, newDeck, fullDeck);
        for (let card of hands.player) {
            init.addCard(`${card}`, cardContainer, 'player');
        }

        let dealerCardContainer = document.querySelector('.dealer-cards');
        hands.dealer = deal.dealCards(2, newDeck, fullDeck);
        init.addCard(`${hands.dealer[0]}`, dealerCardContainer, 'dealer');
        init.addCardFaceDown(`${hands.dealer[1]}`, dealerCardContainer);
    },

    cardCounter: function (handToCheck) {
        // handToCheck will be 'player' or 'dealer'
        let cardSum = 0;
        let asCounter = 0;
        let cards = document.querySelectorAll(`.${handToCheck}-card`);
        for (let card of cards) {
            let value = card.dataset.value;
            if (value === "0") {
                value = 10;
            } else if (value === "K") {
                value = 10;
            } else if (value === "Q") {
                value = 10;
            } else if (value === "J") {
                value = 10;
            } else if (value === "A") {
                asCounter++;
                value = 0;
            }
            cardSum = cardSum + parseInt(value)
        }

        for (let card of cards) {
            let value = card.dataset.value;
            if (value === "A" && cardSum < 11) {
                if (asCounter > 1 && cardSum === 10) {
                    value = 1;
                } else {
                    value = 11;
                }
                cardSum = value + cardSum;
            } else if (value === "A" && cardSum > 10) {
                value = 1;
                cardSum = value + cardSum;
            }
        }
        return cardSum
    },

    showCardSum: function (value) {
        try {
            let counterDiv = document.querySelector('#cardCount');
            counterDiv.innerText = value;
        } catch (e) {
            let container = document.querySelector(".container");
            let counterDiv = document.createElement("div");
            counterDiv.setAttribute("id", "cardCount");
            counterDiv.innerText = value;
            container.appendChild(counterDiv);
        }
    },

    checkForBlackjack: function () {
        return (
            (init.cardCounter('player') === 21 || init.cardCounter('dealer') === 21) &&
            document.querySelectorAll('.player-card').length === 2);
    },

    checkForBust: function (handToCheck) {
        return (init.cardCounter(handToCheck) > 21);
    },

    checkScore: function () {
        if (init.cardCounter('player') > init.cardCounter('dealer')) {
            if (init.checkForBlackjack()) {
                return 2.5;
            }
            return 2;
        } else if (init.cardCounter('player') < init.cardCounter('dealer')) {
            return 0;
        } else {
            return 1;
        }
    },

    flipDealerCards: function (hands, dealerCards) {
        dealerCards.innerHTML = '';
        for (let card in hands.dealer) {
            init.addCard(`${hands.dealer[card]}`, dealerCards, 'dealer');
        }
    },

    dealerHit: function (newDeck, fullDeck, hands, cardContainer) {
        let hit = deal.dealCards(1, newDeck, fullDeck)[0];
        hands.dealer.push(hit);
        init.addCard(`${hit.slice(0, 2)}`, cardContainer, 'dealer');
    },

    toggleButtons: function (buttons, action) {
        action = action === 'hide' ? 'None' : 'Block';
        for (let button of buttons) {
            button.style.display = action;
        }
    },

    nextRound: function (cards, dealerCards, buttons) {
        cards.innerHTML = '';
        dealerCards.innerHTML = '';
        init.toggleButtons(buttons, 'show');
    },

    startRound: function (newDeck, fullDeck, hands) {
        init.initCards(newDeck, fullDeck, hands);
        init.showCardSum(init.cardCounter('player'));
    }
};
