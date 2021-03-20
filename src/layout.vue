<template>
    <div class="main-view">
        <div class="header">
            <div>Fish</div>
            <div>
                <button>
                    New Game
                </button>
                <button>
                    Main Menu
                </button>
            </div>
        </div>
        <div class="contents">
            <div v-if="playersGrid.length"
                class="layout">
                <div
                    v-for="player in playersGrid"
                    :key="player.id"
                    :class="[{'player': player.name}, player.className]"
                >
                    {{ player.name }}
                    <div v-if="player.name"
                        @click="requestCardFromPlayer(player)">
                        <div :class="toCssClassName(teamName(player))">{{ teamName(player) }}</div>
                        <div v-if="!player.isUser"
                            class="player-cards">
                            <span v-for="(card,index) in filterPlayerCards(player.cards)"
                                :key='`${card.face}-${card.value.value}`'
                                class="player-card"
                                :style="{position: 'absolute', left: index * 20 + 'px'}"
                            ><span class="player-card-temp">{{`${card.face}-${card.value.value}`}}</span></span>
                        </div>
                    </div>
                    <div v-else-if="player.className">
                        {{ sysMsg }}
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
        </div>
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
    props: ['players'],
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
            playersGrid: [],
            playerCards: [],
            selectedCard: undefined,
            sysMsg: ''
        }
    },
    computed: {
        cardWrapperClass() {
            return this.expand
                ? 'cards-wrapper cards-expand'
                : 'cards-wrapper cards-collapse';
        },
        userCards() {
            return this.hideMissing
                ? this.playerCards.filter(c => c.isPresent)
                : this.playerCards;
        }
    },
    methods: {
        toCssClassName: toCssClassName,
        cardSelected({card, event}) {
            event.preventDefault();
            event.stopPropagation();
            this.selectedCard = card;

            this.sysMsg = 'click on player to request selected card';
        },
        cardStyle(index) {
            if (!this.expand) {

                return { position: 'absolute', left: index * 25 + 'px' };
            }

            return {};
        },
        deselectCard() {
            this.selectedCard = undefined;
            this.sysMsg = '';
        },
        expandCards() {
            this.expand = !this.expand;
        },
        filterPlayerCards(cards = []) {
            return cards.filter(card => card.isPresent);
        },
        hexagonPlayersGrid(players) {
            const blank = {
                name: ' ',
                team: null
            };

            this.playersGrid = [
                new Player(''), players[2], new Player(''),
                players[3], { className: 'main-msg'}, players[1],
                players[4], new Player(''), players[0],
                new Player(''), players[5], new Player(''),
            ];
        },
        hideMissingCards() {
            this.hideMissing = !this.hideMissing;
        },
        requestCardFromPlayer(player) {
            if (!this.selectedCard) {
                return;
            }

            const playerHasCard = player.removeCard(this.selectedCard);
            if (playerHasCard) {
                this.players[5].addCard(this.selectedCard);
                this.$set(this.playerCards, this.players[5].cards);
            }

            this.$nextTick(() => {
                console.log('playerHasCard', playerHasCard, this.players[5].cards, this.playerCards);
            });
        },
        teamName(player) {
            return player.team ? 'Team A' : 'Team B'
        },
        updatePlayerCards(players) {
            if (!players || !players.length) {
                return [];
            }

            this.playerCards = players[5].cards;
        }
    },
    mounted() {
        window.addEventListener('click', this.deselectCard.bind(this));
    },
    watch: {
        players: function (value) {
            this.hexagonPlayersGrid(value);
            this.updatePlayerCards(value);
        }
    }
}
</script>

<style lang="scss">
    .row {
        display: flex;
        width: 950px;
        height: 97px;
    }

    .column {
        display: flex;
        width: 950px;
    }

    .main-view {
        display: flex;
        flex-direction: column;
        height: 100vh;
        justify-content: space-between;
    }

    .cards-expand {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;

        .card {
            margin: 5px;
        }
    }

    .cards-collapse {
        position: absolute;
    }

    .card {
        border-radius: 5px;
        cursor: pointer;
        display: inline-block;
        width: 100px;
        height: 145px;

        &.is-missing:hover {
            top: -20px;
        }
    }

    .card.is-missing {
        background-color: #66716d;
        background-blend-mode: multiply;

        .missing-msg, .msg {
            bottom: 0;
            color: white;
            padding: 5px;
            position: absolute;
            text-align: center;
            visibility: hidden;
            width: 90px;
            z-index: 3;
        }

        &:not(.is-selected):hover {
            .missing-msg {
                visibility: visible;
            }
        }
    }

    .card.is-selected {
        box-shadow: #1b1b1b 2px 2px 9px 0px;
        top: -20px;
        background-blend-mode: unset;
        z-index: 2;

        .missing-msg {
            color: black;
            visibility: hidden;
        }

        .msg {
            color: black;
            top: -25px;
            visibility: visible;
        }
    }

    .card:hover {
        z-index: 10;
    }

    .contents {
        position: relative;
        width: 100%;
        max-height: 500px;
        flex-grow: 1;
    }

    .layout {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .main-msg {
        display: block;
        text-align: center;
    }

    .player-cards {
        position: relative;
        width: 100%;
        height: 75px;
        margin: auto;
        overflow-x: auto;

        .player-card {
            background-image: url('../assets/card-face.jpg');
            background-size: 50px 75px;
            border: 1px solid #c5c5c5;
            border-radius: 5px;
            display: inline-block;
            width: 50px;
            height: 75px;
        }

        .player-card-temp {
            width: 20px;
            height: 75px;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            position: absolute;
            left: 0px;
            font-size: 10px;
        }
    }

    .user-cards {
        height: 145px;
        margin: 10px;
        padding: 10px;
    }

    .player-menu {
        display: flex;
        justify-content: center;
        margin-bottom: 45px;
    }

    .hex {
        fill: red;
    }

    .player {
        color: black;
        text-align: center;
    }

    .team-a {
        color: red;
    }

    .team-b {
        color: green;
    }
</style>
