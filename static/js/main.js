function createDeck(amountOfDeck) {
    const colors = 'dchs';
    const values = '234567890jqka';
    let fullDeck = [];

    for (let i = 0; i < amountOfDeck; i++) {
        for (let color of colors) {
            for (let value of values) {
                fullDeck.push(`${i}${color}${value}`)
            }
        }
    }

    return fullDeck;
}

function dealCards(amount, newDeck, fullDeck) {
    let deal = [];
    for (let j = 0; j < amount; j++) {
        let pick = parseInt(Math.random() * (fullDeck.length -1));
        while (fullDeck[pick] in newDeck) {
            pick = parseInt(Math.random() * (fullDeck.length -1));
        }
        newDeck.push(fullDeck[pick]);
        deal.push(fullDeck[pick]);
    }
    return deal;
}


function check(isOver, newDeck, fullDeck) {
    //console.log(dealCards(1, newDeck, fullDeck));
    console.log(newDeck)
    let alma = dealCards(1, newDeck, fullDeck);
    console.log(alma)
}


function main() {
    let isOver = false;

    let newDeck = [];
    const fullDeck = createDeck(1);

    let userHand = dealCards(2, newDeck, fullDeck);

    console.log(userHand);

    const btnHit = document.getElementById('hit');
    btnHit.addEventListener('click', function () {
        userHand.push(dealCards(1, newDeck, fullDeck)[0]);
        console.log(userHand);
    });



}

main();