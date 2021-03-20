import { v4 as uuidv4 } from 'uuid';

export default class Player {
    constructor(deck, name = '', cards = [], team, isUser = false) {
        this.deck = deck,
        this.id = uuidv4();
        this.cards = this.sortCards(cards);
        this.ownCards = JSON.parse(JSON.stringify(cards));
        this.cardGroups = [];
        this.isUser = isUser;
        this.name = name;
        this.team = team;

        this.addMissingCards();
    }

    addCard(card) {
        this.cards.forEach(c => {
            if (c.face === card.face && c.value.value === card.value.value) {
                c.isPresent = true;
            }
        });
    }

    removeCard(card) {
        return this.cards.some(c => {
            const found = c.face === card.face && c.value.value === card.value.value && c.isPresent;
            if (found) {
                c.isPresent = false;
            }

            return found;
        });
    }

    addMissingCards() {
        this.cards.forEach(card => {
            const cardGroup = card.cardGroup;
            const cards = this.cardGroups[cardGroup] || JSON.parse(JSON.stringify(this.deck.groups[cardGroup]));
            cards.forEach(c => {
                if (card.value.value === c.value.value && card.face === c.face) {
                    c.isPresent = true;
                }
            });

            this.cardGroups[cardGroup] = cards;
        });

        this.cards = Object.values(this.cardGroups).flat();
    }

    sortCards(cards) {
        if (!cards.length) {
            return [];
        }

        cards.sort((a, b) => {
            const nameA = a.cardGroup.toUpperCase();
            const nameB = b.cardGroup.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }

            if (nameA > nameB) {
                return 1;
            }

            return 0;
        });

        return cards;
    }
}