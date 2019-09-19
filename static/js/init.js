import {game} from "./game.js";

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

        const fullDeck = game.createDeck(2);
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
            game.toggleButtons(buttons, "show");
            btnDeal.style.display = "none";
            newDeck = [];
            game.nextRound(cards, dealerCards, buttons);
            game.startRound(newDeck, fullDeck, hands, buttons, payOut);

            if (game.checkForBlackjack()) {
                game.toggleButtons(buttons, 'hide');
                game.flipDealerCards(hands, dealerCards);
                payOut = game.checkScore();
                game.moneyHandler(payOut);
                if (payOut === 2.5) {
                    game.showModal(modal, mask, `BlackJack`);
                } else if (payOut === 1) {
                    game.showModal(modal, mask, `Push`);
                } else {
                    game.showModal(modal, mask, `Dealer has BlackJack`);
                }
            }
        });

        btnNext.addEventListener("click", function () {
            game.nextRound(cards, dealerCards);
            document.querySelector(".coin-container").style.display = "flex";
            document.querySelector('#player-card-count').style.display = 'none';
            document.querySelector('#dealer-card-count').style.display = 'none';
            bet.style.display = 'block';
            mask.style.display = 'none';
            modal.style.display = 'none';
        });

        btnStand.addEventListener('click', function () {
            game.flipDealerCards(hands, dealerCards);
            while (game.cardCounter('dealer') < 17 && (game.cardCounter('dealer') <= game.cardCounter('player'))) {
                game.dealerHit(newDeck, fullDeck, hands, dealerCards);
            }
            if (game.checkForBust('dealer')) {
                payOut = 2;
                game.showModal(modal, mask, `You win $${parseInt(bet.dataset.betValue) * payOut}`);
            } else {
                payOut = game.checkScore();
                if (payOut === 2) {
                    game.showModal(modal, mask, `You win $${parseInt(bet.dataset.betValue) * payOut}`);
                } else if (payOut === 1) {
                    game.showModal(modal, mask, `Push`);
                } else {
                    game.showModal(modal, mask, `Dealer wins`);
                }
            }
            game.moneyHandler(payOut);
            game.toggleButtons(buttons, 'hide');
        });

        btnHit.addEventListener('click', function () {
            let hit = (game.dealCards(1, newDeck, fullDeck)[0]);
            hands.player.push(hit[0]);
            game.addCard(hit, cards, 'player');
            game.showCardSum(game.cardCounter('player'), 'player');
            if (game.checkForBust('player')) {
                game.toggleButtons(buttons, 'hide');
                payOut = 0;
                game.moneyHandler(payOut);
                game.showModal(modal, mask, 'Bust');
            }
        });
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
    }
};