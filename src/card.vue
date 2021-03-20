<template>
  <div class="card"
    :class="[cardClass, card.face.toLowerCase(), card.value.class, {'is-selected': isSelected}, {'is-missing': !card.isPresent}]"
    @click="selectCard"
  >
    <div v-if="!card.isPresent"
        class="missing-msg"
    >
      Click to select this card
    </div>
    <div v-if="isSelected"
        class="msg"
    >
      Request Card
    </div>
  </div>
</template>

<script>
import { CARD_FACES } from './deck';

export default {
  name: "card",
  components: {
  },
  props: ['card', 'selectedCard'],
  data() {
    return {
    };
  },
  computed: {
    cardClass() {
      return `${this.card.face.toLowerCase()}__${this.card.value.class}`;
    },
    isSelected() {
      return this.selectedCard && this.selectedCard.face === this.card.face && this.selectedCard.value.value === this.card.value.value;
    }
  },
  methods: {
    selectCard(event) {
      if (this.card.isPresent) {
        return;
      }

      this.$emit('cardSelected', {card:this.card, event});
    }
  },
  mounted() {
  }
};
</script>

<style lang="scss">
</style>