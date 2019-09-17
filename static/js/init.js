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

            let cards = document.createElement('div');
            cards.classList.add('cards');
            container.appendChild(cards);

            let hitButton = document.createElement('button');
            hitButton.classList.add('hit-btn');
            hitButton.textContent = 'Hit';
            container.appendChild(hitButton);

            init.initTest();


            let isOver = false;
            let newDeck = [];
            const fullDeck = deal.createDeck(1);

            let userHand = deal.dealCards(2, newDeck, fullDeck);

            console.log(userHand);


            const btnHit = document.querySelector('.hit-btn');
            btnHit.addEventListener('click', function () {
                userHand.push(deal.dealCards(1, newDeck, fullDeck)[0]);
                console.log(userHand);
            });
        });
    },

    addTestCard: function (card, cardContainer) {
        let newCard = document.createElement('img');
        newCard.classList.add(`test-card${cardContainer.childElementCount + 1}`);
        newCard.setAttribute('src', `../static/images/${card}.png`);
        cardContainer.appendChild(newCard)
    },

    initTest: function () {
        let cardContainer = document.querySelector('.cards');
        console.log(cardContainer);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                init.addTestCard('AS', cardContainer);
                init.addTestCard('10S', cardContainer);
                init.addTestCard('QH', cardContainer);
            }
        });
    }
};
