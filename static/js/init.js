import {deal} from "./dealLogic.js";

export let init = {
    init: function () {
        let startButton = document.querySelector('#start-btn');
        startButton.addEventListener('click', function () {
            let deckStyle = document.querySelector('input[name="deck"]:checked').value;

            if (deckStyle === 'art') {
                localStorage.setItem("dictionary", 'art');
                localStorage.setItem("extension", 'jpg');
            } else if (deckStyle === 'gladiator') {
                localStorage.setItem("dictionary", 'gladiator');
                localStorage.setItem("extension", 'jpg');
            } else {
                localStorage.setItem("dictionary", 'classic');
                localStorage.setItem("extension", 'png');
            }

            init.initGameField();
            init.initGame();
        });
    },

    initGameField: function () {
        const body = document.querySelector('body');
        body.innerHTML = '';

        const container = document.createElement('div');
        container.classList.add('container');
        body.appendChild(container);

        const mask = document.createElement('div');
        mask.setAttribute('id', 'page-mask');
        body.appendChild(mask);

        const modal = document.createElement('div');
        modal.setAttribute('id', 'modal');
        container.appendChild(modal);

        const modalText = document.createElement('p');
        modal.appendChild(modalText);

        const btnDiv = document.createElement('div');
        modal.appendChild(btnDiv);

        const nexRoundButton = document.createElement("button");
        nexRoundButton.textContent = 'Next Round';
        nexRoundButton.classList.add('next-btn');
        btnDiv.appendChild(nexRoundButton);

        const dealButton = document.createElement('button');
        dealButton.textContent = 'Deal';
        dealButton.classList.add('deal-btn');
        container.appendChild(dealButton);

        const hitButton = document.createElement('button');
        hitButton.classList.add('hit-btn');
        hitButton.textContent = 'Hit';
        hitButton.style.display = "none";
        container.appendChild(hitButton);

        const standButton = document.createElement('button');
        standButton.classList.add('stand-btn');
        standButton.textContent = 'Stand';
        standButton.style.display = "none";
        container.appendChild(standButton);

        const dealerCards = document.createElement('div');
        dealerCards.classList.add('dealer-cards');
        container.appendChild(dealerCards);

        const cards = document.createElement('div');
        cards.classList.add('cards');
        container.appendChild(cards);

        init.betFieldCreator(100)
    },

    initGame: function () {
        const modal = document.querySelector('#modal');
        const mask = document.querySelector('#page-mask');

        const fullDeck = deal.createDeck(2);
        let newDeck = [];
        const hands = {dealer: [], player: []};
        let payOut = 0;

        const cards = document.querySelector('.cards');
        const dealerCards = document.querySelector('.dealer-cards');
        const bet = document.querySelector("#bet-field");

        const btnNext = document.querySelector(".next-btn");
        const btnDeal = document.querySelector('.deal-btn');
        const btnStand = document.querySelector('.stand-btn');
        const btnHit = document.querySelector('.hit-btn');

        const buttons = [btnStand, btnHit];

        btnDeal.addEventListener('click', function () {
            document.querySelector(".coin-container").style.display = "none";
            init.toggleButtons(buttons, "show");
            btnDeal.style.display = "none";
            newDeck = [];
            init.nextRound(cards, dealerCards, buttons);
            init.startRound(newDeck, fullDeck, hands, buttons, payOut);

            if (init.checkForBlackjack()) {
                init.toggleButtons(buttons, 'hide');
                init.flipDealerCards(hands, dealerCards);
                payOut = init.checkScore();
                init.moneyHandler(payOut);
                if (payOut === 2.5) {
                    init.showModal(modal, mask, `BlackJack`);
                } else if (payOut === 1) {
                    init.showModal(modal, mask, `Push`);
                } else {
                    init.showModal(modal, mask, `Dealer has BlackJack`);
                }
            }
        });

        btnNext.addEventListener("click", function () {
            init.nextRound(cards, dealerCards);
            document.querySelector(".coin-container").style.display = "flex";
            document.querySelector('#player-card-count').style.display = 'none';
            document.querySelector('#dealer-card-count').style.display = 'none';
            bet.style.display = 'block';
            mask.style.display = 'none';
            modal.style.display = 'none';
        });

        btnStand.addEventListener('click', function () {
            init.flipDealerCards(hands, dealerCards);
            while (init.cardCounter('dealer') < 17 && (init.cardCounter('dealer') <= init.cardCounter('player'))) {
                init.dealerHit(newDeck, fullDeck, hands, dealerCards);
            }
            if (init.checkForBust('dealer')) {
                payOut = 2;
                init.showModal(modal, mask, `You win $${parseInt(bet.dataset.betValue) * payOut}`);
            } else {
                payOut = init.checkScore();
                if (payOut === 2) {
                    init.showModal(modal, mask, `You win $${parseInt(bet.dataset.betValue) * payOut}`);
                } else if (payOut === 1) {
                    init.showModal(modal, mask, `Push`);
                } else {
                    init.showModal(modal, mask, `Dealer wins`);
                }
            }
            init.moneyHandler(payOut);
            init.toggleButtons(buttons, 'hide');
        });

        btnHit.addEventListener('click', function () {
            let hit = (deal.dealCards(1, newDeck, fullDeck)[0]);
            hands.player.push(hit[0]);
            init.addCard(hit, cards, 'player');
            init.showCardSum(init.cardCounter('player'), 'player');
            if (init.checkForBust('player')) {
                init.toggleButtons(buttons, 'hide');
                payOut = 0;
                init.moneyHandler(payOut);
                init.showModal(modal, mask, 'Bust');
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
        hands.player = deal.dealCards(2, newDeck, fullDeck);
        for (let card of hands.player) {
            init.addCard(`${card}`, cardContainer, 'player');
        }

        let dealerCardContainer = document.querySelector('.dealer-cards');
        hands.dealer = deal.dealCards(2, newDeck, fullDeck);
        init.addCardFaceDown(`${hands.dealer[0]}`, dealerCardContainer);
        init.addCard(`${hands.dealer[1]}`, dealerCardContainer, 'dealer');
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
        init.showCardSum(init.cardCounter('dealer'), 'dealer');
    },

    dealerHit: function (newDeck, fullDeck, hands, cardContainer) {
        let hit = deal.dealCards(1, newDeck, fullDeck)[0];
        hands.dealer.push(hit);
        init.addCard(`${hit.slice(0, 2)}`, cardContainer, 'dealer');
        init.showCardSum(init.cardCounter('dealer'), 'dealer');
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
        init.initCards(newDeck, fullDeck, hands);
        init.showCardSum(init.cardCounter('player'), 'player');
        init.showCardSum(init.cardCounter('dealer') - init.cardCounter('face-down'), 'dealer');
    },

    betFieldCreator: function (money) {
        let container = document.querySelector(".container");
        let pocket = document.createElement("div");
        pocket.setAttribute("id", "pocket");
        pocket.dataset.money = money;
        pocket.innerText = "Your Pocket: $" + money;
        container.appendChild(pocket);

        let betField = document.createElement("div");
        betField.setAttribute("id", "bet-field");
        betField.dataset.betValue = "0";
        betField.innerText = "Take your bet!";
        container.appendChild(betField);

        let coinContainer = document.createElement("div");
        coinContainer.classList.add("coin-container");
        let coins = [5, 10, 50];
        for (let coinValue of coins) {
            let coin = document.createElement("button");
            coin.classList.add("coin");
            coin.innerText = coinValue.toString();
            coin.dataset.quantity = coinValue.toString();
            coin.addEventListener("click", function () {
                const btnDeal = document.querySelector('.deal-btn');
                let bet = coin.dataset.quantity;
                let yourPocket = pocket.dataset.money;

                if (!(yourPocket <= 0 || parseInt(yourPocket) - parseInt(bet) < 0)) {
                    pocket.dataset.money = (parseInt(yourPocket) - parseInt(bet)).toString();
                    pocket.innerText = "Your Pocket: $" + (parseInt(yourPocket) - parseInt(bet));
                    let yourBet = betField.dataset.betValue;
                    betField.dataset.betValue = parseInt(yourBet) + parseInt(bet);
                    betField.innerText = "$" + (parseInt(yourBet) + parseInt(bet));
                    btnDeal.style.display = 'block';
                }
            });
            coinContainer.appendChild(coin);
        }
        container.appendChild(coinContainer);
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