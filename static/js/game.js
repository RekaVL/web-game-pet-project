export let game = {
    createDeck: function (amountOfDeck) {
        const colors = 'DCHS';
        const values = '234567890JQKA';
        let fullDeck = [];

        for (let i = 0; i < amountOfDeck; i++) {
            for (let color of colors) {
                for (let value of values) {
                    fullDeck.push(`${value}${color}${i}`)
                }
            }
        }

        return fullDeck;
    },

    dealCards: function (amount, newDeck, fullDeck) {
        let deal = [];
        for (let j = 0; j < amount; j++) {
            let pick = parseInt(Math.random() * (fullDeck.length - 1));
            while (newDeck.includes(fullDeck[pick])) {
                pick = parseInt(Math.random() * (fullDeck.length - 1));
            }
            newDeck.push(fullDeck[pick]);
            deal.push(fullDeck[pick]);
        }
        return deal;
    },

    addCard: function (card, cardContainer, playerClass) {
        let newCard = document.createElement('img');
        newCard.classList.add(`${playerClass}-card`);
        if (cardContainer.childElementCount + 1 > 1) {
            newCard.style.position = "relative";
            let leftPosition = 40 * cardContainer.childElementCount;
            newCard.style.left = `${leftPosition}px`
        }

        if (localStorage.getItem("dictionary") !== 'classic') {
            newCard.classList.add("radius-deck");
        }

        newCard.setAttribute('src', `../static/images/${localStorage.getItem("dictionary")}/${card.slice(0, 2)}.${localStorage.getItem("extension")}`);
        newCard.dataset.value = `${card.slice(0, 1)}`;
        cardContainer.appendChild(newCard);
    },

    addCardFaceDown: function (card, cardContainer) {

        let newCard = document.createElement('img');
        newCard.classList.add("dealer-card");
        newCard.classList.add("face-down-card");

        if (localStorage.getItem("dictionary") !== 'classic') {
            newCard.classList.add("radius-deck")
        }

        let randomBackCard = Math.random();
        if (randomBackCard > 0.5 && localStorage.getItem("dictionary") === 'classic') {
            newCard.setAttribute('src', `../static/images/${localStorage.getItem("dictionary")}/redback.${localStorage.getItem("extension")}`);
        } else {
            newCard.setAttribute('src', `../static/images/${localStorage.getItem("dictionary")}/back.${localStorage.getItem("extension")}`);
        }

        newCard.dataset.value = `${card.slice(0, 1)}`;
        cardContainer.appendChild(newCard);
    },

    initCards: function (newDeck, fullDeck, hands) {
        let cardContainer = document.querySelector('.cards');
        hands.player = game.dealCards(2, newDeck, fullDeck);
        for (let card of hands.player) {
            game.addCard(`${card}`, cardContainer, 'player');
        }

        let dealerCardContainer = document.querySelector('.dealer-cards');
        hands.dealer = game.dealCards(2, newDeck, fullDeck);
        game.addCardFaceDown(`${hands.dealer[0]}`, dealerCardContainer);
        game.addCard(`${hands.dealer[1]}`, dealerCardContainer, 'dealer');
    },

    cardCounter: function (handToCheck) {
        // handToCheck will be 'player' or 'dealer'

        const cards = document.querySelectorAll(`.${handToCheck}-card`);
        let cardSum = 0;
        let aceCounter = 0;

        for (let card of cards) {
            switch (card.dataset.value) {
                case '0':
                case 'J':
                case 'Q':
                case 'K':
                    cardSum += 10;
                    break;
                case 'A':
                    cardSum += 11;
                    aceCounter++;
                    break;
                default:
                    cardSum += parseInt(card.dataset.value);
            }
        }

        while (cardSum > 21 && aceCounter > 0) {
            cardSum -= 10;
            aceCounter -= 1;
        }

        return cardSum;
    },

    showCardSum: function (value, person) {
        // person can be 'player' or 'dealer'
        try {
            let counterDiv = document.querySelector(`#${person}-card-count`);
            counterDiv.style.display = 'block';
            counterDiv.innerText = value;
        } catch (e) {
            let container = document.querySelector(".container");
            let counterDiv = document.createElement("div");
            counterDiv.setAttribute('id', `${person}-card-count`);
            counterDiv.classList.add('card-count');
            counterDiv.innerText = value;
            container.appendChild(counterDiv);
        }
    },

    checkForBlackjack: function () {
        return (
            (game.cardCounter('player') === 21 || game.cardCounter('dealer') === 21) &&
            document.querySelectorAll('.player-card').length === 2);
    },

    checkForBust: function (handToCheck) {
        return (game.cardCounter(handToCheck) > 21);
    },

    checkScore: function () {
        if (game.cardCounter('player') > game.cardCounter('dealer')) {
            if (game.checkForBlackjack()) {
                return 2.5;
            }
            return 2;
        } else if (game.cardCounter('player') < game.cardCounter('dealer')) {
            return 0;
        } else {
            return 1;
        }
    },

    flipDealerCards: function (hands, dealerCards) {
        dealerCards.innerHTML = '';
        for (let card in hands.dealer) {
            game.addCard(`${hands.dealer[card]}`, dealerCards, 'dealer');
        }
        game.showCardSum(game.cardCounter('dealer'), 'dealer');
    },

    dealerHit: function (newDeck, fullDeck, hands, cardContainer) {
        let hit = game.dealCards(1, newDeck, fullDeck)[0];
        hands.dealer.push(hit);
        game.addCard(`${hit.slice(0, 2)}`, cardContainer, 'dealer');
        game.showCardSum(game.cardCounter('dealer'), 'dealer');
    },

    toggleButtons: function (buttons, action) {
        action = action === 'hide' ? 'None' : 'Block';
        for (let button of buttons) {
            button.style.display = action;
        }
    },

    nextRound: function (cards, dealerCards) {
        cards.innerHTML = '';
        dealerCards.innerHTML = '';
    },

    startRound: function (newDeck, fullDeck, hands) {
        game.initCards(newDeck, fullDeck, hands);
        game.showCardSum(game.cardCounter('player'), 'player');
        game.showCardSum(game.cardCounter('dealer') - game.cardCounter('face-down'), 'dealer');
    },

    moneyHandler: function (payOut) {
        let betField = document.querySelector("#bet-field");
        let pocket = document.querySelector("#pocket");
        let yourBet = parseInt(betField.dataset.betValue);
        let reward = yourBet * payOut;
        let moneyInPocket = parseInt(pocket.dataset.money) + reward;

        pocket.dataset.money = moneyInPocket;
        pocket.innerText = "Your Pocket: $" + moneyInPocket;

        betField.textContent = "$0";
        betField.dataset.betValue = "0";
        betField.style.display = 'none';
    },

    showModal: function (modal, mask, message) {
        modal.firstChild.textContent = message;
        modal.style.display = 'block';
        mask.style.display = 'block';
    }
};