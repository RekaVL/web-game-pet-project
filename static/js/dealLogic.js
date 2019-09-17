export let deal = {
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
            while (fullDeck[pick] in newDeck) {
                pick = parseInt(Math.random() * (fullDeck.length - 1));
            }
            newDeck.push(fullDeck[pick]);
            deal.push(fullDeck[pick]);
        }
        return deal;
    },

    check: function (isOver, newDeck, fullDeck) {
        //console.log(dealCards(1, newDeck, fullDeck));
        console.log(newDeck)
        let alma = dealCards(1, newDeck, fullDeck);
        console.log(alma)
    }
};


