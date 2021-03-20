<template>
    <div>
        <Layout :players="players" />
    </div>

</template>

<script>
import Layout from './layout.vue';
import Deck from './deck';
import Player from './player';

import style from './styles.scss';

export default {
  name: "game",
  components: {
    Layout
  },
  data() {
      return {
        deck: undefined,
        cards: [],
        players: [],
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

            this.players.push(new Player(this.deck, name, cards, totalPlayers % 2, totalPlayers === 1));

            totalPlayers--;
        }
      },
      createDeck() {
          this.deck = new Deck();
          this.deck.shuffle();
      }
  },
  mounted() {
    this.createDeck();
    this.cards = this.deck.getCurrent();
    this.addPlayers();
  }

};
</script>


