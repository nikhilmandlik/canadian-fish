<template>
    <div class="main-view">
        <div class="contents">
            <div v-if="playersGrid.length"
                class="layout">
                <div
                    v-for="player in playersGrid"
                    :key="player.id"
                    :class="[{'player': player.name}, player.number ? `player-${player.number.toString()}` : '', player.className, {'has-turn': playerTurn && playerTurn.id === player.id}]"
                >
                    <div v-if="player.name"
                        class="player-info"
                        @click="requestCard(player)"
                    >
                        <div>
                            <div class="name">{{ player.name }}</div>
                            <div :class="toCssClassName(teamName(player))">{{ teamName(player) }}</div>
                        </div>
                        <div v-if="!player.isUser"
                            class="player-cards">
                            <span v-for="(card,index) in filterPlayerCards(player.cards)"
                                :key='`${card.face}-${card.value.value}`'
                                class="player-card"
                                :style="{position: 'absolute', left: index * 20 + 'px'}"
                            >
                            <span class="player-card-temp">{{`${card.face}-${card.value.value}`}}</span></span>
                        </div>
                    </div>
                    <div v-else-if="player.className === 'main-msg'">
                        <div v-for="(msg, index) in getSysMsgs"
                            :key="index"
                        >
                            {{ msg }}
                        </div>
                    </div>
                    
                </div>
            </div>
            <div class="table"></div>
        </div>
        <div class="player-menu">
            <button @click="hideMissingCards">
                {{ hideMissing ? 'Show Missing cards' : 'Hide Missing Cards' }}
            </button>
            <button @click="expandCards">
                {{ expand ? 'Collapse Cards' : 'Expand Cards' }}
            </button>
            <button>
                Declare Suite
            </button>
            <button @click="toggleAI"
                :class="{'enabled' : isAIOn}"
            >
                Toggle AI vs AI
            </button>
        </div>
        <div class="player-msg">{{ userMsg }}</div>
        <div v-if="players.length > 0"
             class="user-cards"
        >
            <div class="cards-wrapper"
                :class="[cardWrapperClass]">
                <Card v-for="(card, index) in userCards"
                    :key="index"
                    :selectedCard="selectedCard"
                    :expand="expand"
                    :card="card"
                    :style="cardStyle(index)"
                    @cardSelected='cardSelected'
                />
            </div>
        </div>
    </div>
</template>

<script>
import Player from './player';
import { toCssClassName } from './util';

import Card from "./card.vue"
import CardGroup from "./card-group.vue"

export default {
    props: ['players', 'playerTurn'],
    components: {
        Card,
        CardGroup
    },
    data() {
        return {
            rows: ['CLUB', 'DIAMOND', 'HEART', 'SPADE'],
            columns: ['2','3','4','5','6','7','8','9','10', 'J', 'Q', 'K', 'A'],
            expand: false,
            hideMissing: false,
            isAIOn: false,
            playersGrid: [],
            playerCards: [],
            selectedCard: undefined,
            sysMsg: '',
            sysMsgs: [],
            userMsg: ''
        }
    },
    computed: {
        cardWrapperClass() {
            return this.expand
                ? 'cards-wrapper cards-expand'
                : 'cards-wrapper cards-collapse';
        },
        userCards() {
            let playerCards = [];
            this.playersGrid.forEach(p => {
                if (p.isUser) {
                    playerCards = this.hideMissing
                        ? p.cards.filter(c => c.isPresent)
                        : p.cards;
                }
            });

            return playerCards;
        },
        getSysMsgs() {
            return this.sysMsgs;
        }
    },
    methods: {
        toCssClassName: toCssClassName,
        askCard() {
            if (!this.playerTurn) {
                return;
            }

            const players = this.players
                .filter(p => p.team !== this.playerTurn.team && !p.endGame)
                .map(p => p.id);

            const cardObject = this.playerTurn.askCard(players);
            if (!cardObject) {
                this.passTurnToTeamMember();

                return;
            }

            const {
                playerTo,
                playerFromId,
                card
            } = cardObject;

            const playerFrom = this.players.find(p =>p.id === playerFromId);
            this.requestCardFromPlayer(playerFrom, playerTo, card);
        },
        cardSelected({card, event}) {
            event.preventDefault();
            event.stopPropagation();

            if (this.playerTurn.id !== this.players[5].id) {
                this.setUserMsg('Please wait till your turn');
            } else {
                this.selectedCard = card;
                this.setUserMsg('click on player to request selected card');
            }
        },
        cardStyle(index) {
            if (!this.expand) {

                return { position: 'absolute', left: index * 25 + 'px' };
            }

            return {};
        },
        declareCardGroup(player, cardGroupName) {
            if (!cardGroupName) {
                return;
            }

            let success = true;
            this.players.forEach(p => {
                if (p.team !== player.team) {
                    p.cards.forEach(c => {
                        if (c.cardGroup === cardGroupName && c.isPresent) {
                            success = false;

                            console.error('This is error in AI, false declare,');
                            console.error(' by player', player.name);
                            console.error(' of Card group', cardGroupName);
                        }
                    });
                }
            });

            // TODO: update game score based on success
            const successMsg = success ? 'successfully declared' : 'failed to declare';
            this.setSysMsg(`${player.name} has ${successMsg} ${cardGroupName}`);

            this.players.forEach(player => {
                player.removeCardGroupCards(cardGroupName);
            });

            this.$set(this.playerCards, this.players[5].cards);
        },
        deselectCard() {
            this.selectedCard = undefined;
        },
        deselectCardAndResetMessage() {
            this.selectedCard = undefined;
            this.sysMsg = '';
        },
        endGame() {
            clearInterval(this.intervalId);
            this.setSysMsg('END GAME');
            console.log('END GAME');
        },
        expandCards() {
            this.expand = !this.expand;
        },
        filterPlayerCards(cards = []) {
            return cards.filter(card => card.isPresent);
        },
        getMessage(player) {
            return player.className === 'main-msg'
                ? this.sysMsg
                : this.userMsg;
        },
        hexagonPlayersGrid(players) {
            const blank = {
                name: ' ',
                team: null
            };

            this.playersGrid = [
                players[2],
                players[3], { className: 'main-msg' }, players[1],
                players[4], players[0],
                players[5],
            ];
        },
        hideMissingCards() {
            this.hideMissing = !this.hideMissing;
        },
        passTurnToTeamMember() {
            const teamMembers = this.players.filter(p => p.team === this.playerTurn.team && !p.endGame);
            if(!teamMembers.length) {
                const otherTeamMembers = this.players.filter(p => p.team !== this.playerTurn.team && !p.endGame);
                if (!otherTeamMembers.length) {
                    this.endGame();
                }

                clearInterval(this.intervalId);
                this.$emit('updatePlayerTurn', otherTeamMembers[0]);

                return;
            }

            clearInterval(this.intervalId);
            this.$emit('updatePlayerTurn', teamMembers[0]);
        },
        requestCard(playerFrom) {
            if (!this.selectedCard) {
                return;
            }

            this.requestCardFromPlayer(playerFrom, this.players[5], this.selectedCard);
        },
        requestCardFromPlayer(playerFrom, playerTo, requestedCard) {
            const playerHasCard = playerFrom.removeCard(requestedCard);
            const card = requestedCard.value.class + ' of ' + requestedCard.face;
            if (playerHasCard) {
                playerTo.addCard(requestedCard);

                this.setSysMsg(`${playerTo.name} successfully drawn ${card} from ${playerFrom.name}`);
            } else {
                this.setSysMsg(`${playerTo.name} failed to draw ${card} from ${playerFrom.name}`);
                clearInterval(this.intervalId);
                this.$emit('updatePlayerTurn', playerFrom);
            }

            if (playerHasCard && (playerFrom === this.players[5] || playerTo === this.players[5])) {
                this.$set(this.playerCards, this.players[5].cards);
            }

            this.players.forEach(player => {
                player.recordCard(requestedCard, playerFrom.id, playerTo.id, playerHasCard);
            });
        },
        setSysMsg(msg = '') {
            if (msg.length > 0) {
                this.sysMsgs.unshift(msg);
            }

            setTimeout(() => {
                this.sysMsg = msg;
            }, 300);
        },
        setUserMsg(msg = '') {
            this.userMsg = msg;
            setTimeout(() => {
                this.userMsg = '';
            }, 3000);
        },
        teamName(player) {
            return player.team ? 'Team A' : 'Team B';
        },
        toggleAI() {
            this.isAIOn= !this.isAIOn;

            if (this.isAIOn && this.playerTurn.id === this.players[5].id) {
                this.periodicallyAskCard();
            }
        },
        updatePlayerCards(players) {
            if (!players || !players.length) {
                return [];
            }

            this.playerCards = players[5].cards;
        },
        updatePlayerTurn(playerTurn) {
            if (this.isAIOn || this.playerTurn.id !== this.players[5].id) {
                this.periodicallyAskCard();
            }
        },
        periodicallyAskCard() {
            clearInterval(this.intervalId);
            this.intervalId = setInterval(() => {
                this.askCard();
            }, 5000);
        }
    },
    mounted() {
        window.addEventListener('click', this.deselectCardAndResetMessage.bind(this));
    },
    watch: {
        players: function (value) {
            this.hexagonPlayersGrid(value);
            this.updatePlayerCards(value);

            value.forEach(p => p.declareCallback = this.declareCardGroup);
            window.players = value;
        },
        playerTurn: function(playerTurn) {
            this.updatePlayerTurn(playerTurn);
        }
    }
}
</script>
