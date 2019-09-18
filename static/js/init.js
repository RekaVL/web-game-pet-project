import {deal} from "./dealLogic.js";

export let init = {
    init: function () {
        let startButton = document.querySelector('#start-btn');
        startButton.addEventListener('click', function () {
            let body = document.querySelector('body');
            body.innerHTML = '';

            let container = document.createElement('div');
            container.classList.add('container');
            body.appendChild(container);

            let hitButton = document.createElement('button');
            hitButton.classList.add('hit-btn');
            hitButton.textContent = 'Hit';
            container.appendChild(hitButton);

            let dealerCards = document.createElement('div');
            dealerCards.classList.add('dealer-cards');
            container.appendChild(dealerCards);

            let cards = document.createElement('div');
            cards.classList.add('cards');
            container.appendChild(cards);


            let isOver = false;
            let newDeck = [];
            const fullDeck = deal.createDeck(1);
            const hands = {dealer: [], player: []};


            const btnHit = document.querySelector('.hit-btn');
            btnHit.addEventListener('click', function () {
                let hit = (deal.dealCards(1, newDeck, fullDeck)[0]);
                hands.player.push(hit[0]);
                console.log(hands.player);
                console.log(hit)
                init.addTestCard(hit, cards)
                init.showCardSum(init.cardCounter())
            });

            init.initTest(newDeck, fullDeck, hands);
            init.showCardSum(init.cardCounter());
        });
    },

    addTestCard: function (card, cardContainer) {
        let newCard = document.createElement('img');
        newCard.classList.add("playerCard");
        newCard.classList.add('test-card');
        if (cardContainer.childElementCount + 1 > 1) {
            newCard.style.position = "relative";
            let leftPosition = 40 * cardContainer.childElementCount;
            newCard.style.left = `${leftPosition}px`
        }
        newCard.classList.add(`test-card${cardContainer.childElementCount + 1}`);
        console.log("card number in line: " + `${cardContainer.childElementCount + 1}`);
        newCard.setAttribute('src', `../static/images/${card.slice(0, 2)}.png`);
        /* if (`${card.slice(0, 1)}`==="A" && init.cardCounter()>10){
             newCard.dataset.value = 1;
         } else{*/
        newCard.dataset.value = `${card.slice(0, 1)}`;
        cardContainer.appendChild(newCard);


    },


    initTest: function (newDeck, fullDeck, hands) {
        let cardContainer = document.querySelector('.cards');
        //hands.player = deal.dealCards(2, newDeck, fullDeck);
        hands.player = ['AS0', 'AH0'];
        hands.dealer = deal.dealCards(2, newDeck, fullDeck);
        for (let card of hands.player) {
            init.addTestCard(`${card}`, cardContainer);
            console.log(`${card.slice(0, 1)}`)
        }

    },

    cardCounter: function () {
        let cardSum = 0;
        let asCounter=0;
        let cards = document.querySelectorAll('.playerCard');
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
                value=0
            }
            cardSum = cardSum + parseInt(value)
        };
        for (let card of cards) {
            let value = card.dataset.value;
            if (value === "A" && cardSum < 11) {
                if (asCounter>1 && cardSum===10){
                    value=1;
                }else{
                    value = 11;
                }
                cardSum=value+cardSum;
            } else if (value==="A" && cardSum >10) {
                value=1;
                cardSum=value+cardSum;
            } else {
                ;
            }

        }
        console.log(cardSum)
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

    }


};
