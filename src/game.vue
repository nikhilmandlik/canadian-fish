<template>
  <div>
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
      <Layout :players="players"
              :playerTurn="playerTurn"
              @updatePlayerTurn="updatePlayerTurn"
      />
  </div>
</template>

<script>
import Layout from './layout.vue';
import Deck from './deck';
import Player from './player';

import style from './styles.scss';
import { getRandomIntInclusive } from './util';

export default {
  name: "game",
  components: {
    Layout
  },
  data() {
      return {
        deck: undefined,
        cards: [],
        intervalId: undefined,
        players: [],
        playerTurn: undefined
      };
  },
  methods: {
      addPlayers() {
        let totalPlayers = 6;
        const cardsPerPlayer = this.cards.length / totalPlayers;

        while (totalPlayers > 0) {
            const cards = this.cards.splice(0, cardsPerPlayer);
            const name = totalPlayers === 1
                ? `Player ${totalPlayers} (You)`
                : `Player ${totalPlayers}`;

            this.players.push(new Player(this.deck, totalPlayers, name, cards, totalPlayers % 2, totalPlayers === 1));

            totalPlayers--;
        }
      },
      createDeck() {
          this.deck = new Deck();
          this.deck.shuffle();
      },
      updatePlayerTurn(playerTurn) {
        this.playerTurn = playerTurn;
      }
  },
  mounted() {
    this.createDeck();
    this.cards = this.deck.getCurrent();
    this.addPlayers();

    this.playerTurn = this.players[getRandomIntInclusive(0, this.players.length - 1)];
  }

};
</script>


