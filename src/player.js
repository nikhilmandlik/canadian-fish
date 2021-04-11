import { v4 as uuidv4 } from 'uuid';
import { getRandomIntInclusive } from './util';

export default class Player {
    constructor(deck, number, name = '', cards = [], team, isUser = false) {
        this.deck = deck,
        this.id = uuidv4();
        this.cards = this.sortCards(cards);
        this.cardGroups = [];
        this.isUser = isUser;
        this.name = name;
        this.number = number;
        this.team = team;

       this.addMissingCards();
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

    askCard(players) {
        this.checkForDeclare(players);

        let card;
        let playerFromId;
        let missingCardsIndices = [];

        if (!this.cards.length) {
            this.endGame = true;

            return;
        }

        const knownCards = this.cards.some((c, i) => {
            if (c.has) {
                card = c;
                playerFromId = c.has;
            }

            if (!c.isPresent) {
                missingCardsIndices.push(i);
            }

            return c.has;
        });

        if (!knownCards && missingCardsIndices.length > 0) {
            missingCardsIndices.forEach(index => {
                if (card && playerFromId) {
                    return;
                }

                let c = this.cards[index];
                playerFromId = this.getMissingPlayerId(players, c.hasNot);
                if (playerFromId) {
                    card = c;
                }
            });
        }

        if (!playerFromId) {
            // this should not happen
            console.error('playerFromId', this);
        }

        return {
            playerTo: this,
            playerFromId,
            card
        };
    }

    checkForDeclare(players) {
        const cardGroups = {};
        this.cards.forEach(card => {
            const cardGroup = card.cardGroup;
            const otherTeamDoesNothaveCard = card.hasNot && players.every(p => card.hasNot.has(p));
            const cardGroupDeclare = Boolean(card.isPresent || otherTeamDoesNothaveCard);
            if (cardGroups[cardGroup] === undefined) {
                cardGroups[cardGroup] = cardGroupDeclare;
            }

            cardGroups[cardGroup] = cardGroups[cardGroup] && cardGroupDeclare;
        });

        Object.entries(cardGroups)
            .forEach(([cardGroupName, declare]) => {
                if (declare) {
                    this.declareGroup(cardGroupName);
                }
            });
    }

    declareGroup(cardGroupName) {
        if (this.declareCallback) {
            this.declareCallback(this, cardGroupName);
            this.removeCardGroupCards(cardGroupName);
        }
    }

    findCard(card) {
        return this.cards.find(c => c.face === card.face && c.value.value === card.value.value);
    }

    getMissingPlayerId(playersFromOtherTeam, playersDoesnotHaveCard = new Set()) {
        let players;
        if (!playersDoesnotHaveCard.size) {
            players = playersFromOtherTeam;
        } else {
            players = playersFromOtherTeam.filter(pid => !playersDoesnotHaveCard.has(pid));
        }

        if (!players.length) {
            return;
        }

        const index = getRandomIntInclusive(0, players.length - 1);

        return players[index];
    }

    recordCard(card, playerFromId, playerToId, hasCard) {
        if (playerFromId === this.id || (hasCard && playerToId === this.id)) {
            return;
        }

        this.cards.forEach(c => {
            if (c.face === card.face && c.value.value === card.value.value) {
                if (hasCard) {
                    c.has = playerToId;
                    if (c.hasNot && c.hasNot.has(playerToId)) {
                        c.hasNot.delete(playerToId);
                    }
                }

                if (c.hasNot === undefined) {
                    const hasNot = new Set();
                    c.hasNot = hasNot;
                }

                c.hasNot.add(playerFromId);
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

        if (found && cardGroupCount === 1) {
            this.removeCardGroupCards(card.cardGroup);
        }

        return found;
    }

    removeCardGroupCards(cardGroup) {
        this.cards = this.cards.filter(c => c.cardGroup !== cardGroup);
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
