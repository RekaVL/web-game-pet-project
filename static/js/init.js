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

            init.initTest();
        });
    },

    addTestCard: function (card, cardContainer) {
        let newCard = document.createElement('img');
        newCard.classList.add(`test-card${cardContainer.childElementCount + 1}`);
        newCard.setAttribute('src', `../static/images/${card}.png`);
        cardContainer.appendChild(newCard)
    },

    initTest: function() {
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
