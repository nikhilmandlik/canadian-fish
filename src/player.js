import { v4 as uuidv4 } from 'uuid';
import { getRandomIntInclusive } from './util';

export default class Player {
    constructor(deck, number, name = '', cards = [], team, isUser = false) {
        this.deck = deck,
        this.id = uuidv4();
        this.cards = this.sortCards(cards);
        this.ownCards = JSON.parse(JSON.stringify(cards));
        this.cardGroups = [];
        this.isUser = isUser;
        this.name = name;
        this.number = number;
        this.team = team;
        // this.knownCards = 0;

       this.addMissingCards();
    }

    askCard(players) {
        let card;
        let playerFromId;

        let firstNotPresentIndex = -1;

        const knownCards = this.cards.some((c, i) => {
            if (c.has) {
                card = c;
                playerFromId = c.has;
            }

            if (firstNotPresentIndex < 0 && !c.isPresent) {
                firstNotPresentIndex = i;
            }

            return c.has;
        });

        if (!knownCards) {
            card = this.cards[firstNotPresentIndex];
            const index = getRandomIntInclusive(0, players.length - 1);
            playerFromId = players[index];
        }

        return {
            playerTo: this,
            playerFromId,
            card
        };
    }

    findCard(card) {
        return this.cards.find(c => c.face === card.face && c.value.value === card.value.value);
    }

    recordCard(card, playerFromId, playerToId, hasCard) {
        if (playerFromId === this.id || playerToId === this.id) {
            return;
        }

        this.cards.forEach(c => {
            if (c.face === card.face && c.value.value === card.value.value) {
                if (hasCard) {
                    c.has = playerToId;
                    // this.knownCards++;
                } else {
                    c.hasNot = (c.hasNot === undefined)
                        ? [].concat([[playerFromId]])
                        : c.hasNot.concat([playerFromId]);
                }
            }
        });
    }

    addCard(card) {
        this.cards.forEach(c => {
            if (c.face === card.face && c.value.value === card.value.value) {
                c.isPresent = true;

                delete c.has;
                delete c.hasNot;
            }
        });
    }

    removeCard(card) {
        let cardGroupCount = 0;
        let found = false;
        this.cards.forEach(c => {
            if (c.isPresent && c.cardGroup === card.cardGroup) {
                cardGroupCount++;
            }

            if (c.face === card.face && c.value.value === card.value.value && c.isPresent) {
                found = true;
                c.isPresent = false;
            }
        });

        if (cardGroupCount === 1) {
            this.removeCardGroupCards(card.cardGroup);
        }

        return found;
    }

    removeCardGroupCards(cardGroup) {
        this.cards = this.cards.filter(c => c.cardGroup !== cardGroup);
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