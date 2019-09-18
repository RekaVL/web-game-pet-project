import {deal} from "./dealLogic.js";

export let init = {
    init: function () {
        let startButton = document.querySelector('#start-btn');
        startButton.addEventListener('click', function () {
            init.initGameField();
        });
    },

    initGameField: function () {
        let body = document.querySelector('body');
        body.innerHTML = '';

        let resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.addEventListener('click', function () {
            init.initGameField();
        });
        body.appendChild(resetButton);

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

        let newDeck = [];
        const fullDeck = deal.createDeck(1);
        const hands = {dealer: [], player: []};

        const btnStand = document.querySelector('.stand-btn');
        btnStand.addEventListener('click', function () {
            dealerCards.innerHTML = '';
            for (let card in hands.dealer) {
                init.addCard(`${hands.dealer[card]}`, dealerCards, 'dealer');
            }
            while (init.cardCounter('dealer') < 17) {
                init.dealerHit(newDeck, fullDeck, hands, dealerCards);
            }
        });

        const btnHit = document.querySelector('.hit-btn');
        btnHit.addEventListener('click', function () {
            let hit = (deal.dealCards(1, newDeck, fullDeck)[0]);
            hands.player.push(hit[0]);
            init.addCard(hit, cards, 'player');
            init.showCardSum(init.cardCounter('player'));
            if (init.checkForBust('player')) {
                btnHit.style.display = 'None';
            }
        });

        init.initCards(newDeck, fullDeck, hands);
        init.showCardSum(init.cardCounter('player'));
    },

    addCard: function (card, cardContainer, playerClass) {
        let newCard = document.createElement('img');
        newCard.classList.add(`${playerClass}-card`);
        if (cardContainer.childElementCount + 1 > 1) {
            newCard.style.position = "relative";
            let leftPosition = 40 * cardContainer.childElementCount;
            newCard.style.left = `${leftPosition}px`
        }
        newCard.setAttribute('src', `../static/images/${card.slice(0, 2)}.png`);
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

        newCard.setAttribute('src', `../static/images/rider-back.png`);

        if (`${cardContainer.childElementCount + 1}` > 3 && `${card.slice(0, 1)}` === "A" && init.cardCounter() > 10) {
            newCard.dataset.value = 1;
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
            let value = card.dataset.value
            if (value === "0") {
                value = 10
            } else if (value === "K") {
                value = 10
            } else if (value === "Q") {
                value = 10
            } else if (value === "J") {
                value = 10
            } else if (value === "A") {
                asCounter++
                value = 0
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
            } else {
                ;
            }
        }
        return cardSum
    },

    showCardSum: function (value) {
        try {
            let counterDiv = document.querySelector('#cardCount')
            counterDiv.innerText = value;
        } catch (e) {
            let container = document.querySelector(".container");
            let counterDiv = document.createElement("div")
            counterDiv.setAttribute("id", "cardCount")
            counterDiv.innerText = value
            container.appendChild(counterDiv)
        }
    },

    checkForBlackjack: function (hand) {

    },

    checkForBust: function (handToCheck) {
        if (init.cardCounter(handToCheck) > 21) {
            return true;
        }
    },
    
    dealerHit: function (newDeck, fullDeck, hands, cardContainer) {
            let hit = deal.dealCards(1, newDeck, fullDeck)[0];
            hands.dealer.push(hit);
            init.addCard(`${hit.slice(0, 2)}`, cardContainer, 'dealer');
    }
};
