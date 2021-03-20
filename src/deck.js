import { getRandomIntInclusive } from './util';

export const CARD_FACES = ['CLUB', 'DIAMOND', 'HEART', 'SPADE'];
// const CARD_VALUES = ['2','3','4','5','6','7','8','9','10', 'J', 'Q', 'K', 'A'];
export const CARD_VALUES = [
    {
        label: '2',
        class: 'two',
        value:  2
    },
    {
        label: '3',
        class: 'three',
        value:  3
    },
    {
        label: '4',
        class: 'four',
        value:  4
    },
    {
        label: '5',
        class: 'five',
        value:  5
    },
    {
        label: '6',
        class: 'six',
        value:  6
    },
    {
        label: '7',
        class: 'seven',
        value:  7
    },
    {
        label: '9',
        class: 'nine',
        value:  9
    },
    {
        label: '10',
        class: 'ten',
        value:  10
    },
    {
        label: 'J',
        class: 'jack',
        value:  11
    },
    {
        label: 'Q',
        class: 'queen',
        value:  12
    },
    {
        label: 'K',
        class: 'king',
        value:  13
    },
    {
        label: 'A',
        class: 'ace',
        value:  1
    }
];

class Card {
    constructor(face, value) {
        this.face = face;
        this.value = value;
        this.cardGroup = this.getCardGroup();
    }

    getCardGroup() {
        const value = parseInt(this.value.label, 10);
        const suffix = value < 8 ? 'LOWER' : 'UPPER';

        return `${this.face.toUpperCase()}-${suffix}`.toLowerCase();
    }
}

export default class Deck {
    constructor() {
        this.deck = [];
        this.currentDeck = [];
        this.groups = {};

        this.create();
    }

    create() {
        const deck = [];

        CARD_FACES.forEach(face => {
            CARD_VALUES.forEach(value => {
                const card = new Card(face, value);
                deck.push(card);

                const group = this.groups[card.cardGroup] || [];
                group.push(card);
                this.groups[card.cardGroup] = group;
            });
        });

        this.currentDeck = JSON.parse(JSON.stringify(deck));
        this.deck = JSON.parse(JSON.stringify(deck));
    }

    getCurrent() {
        return this.currentDeck;
    }

    getDeck() {
        return this.deck;
    }

    shuffle() {
        let index = 0;
        const length = this.currentDeck.length;
        const lastIndex = length - 1;

        while (index < lastIndex) {
            const swapIndex = getRandomIntInclusive(index + 1, lastIndex);
            const swapIndexValue = this.currentDeck[swapIndex];

            this.currentDeck[swapIndex] = this.currentDeck[index];
            this.currentDeck[index] = swapIndexValue;

            index++;
        }
    }

    reset() {
        this.currentDeck = SON.parse(JSON.stringify(this.deck));
    }
}