<template>
    <div class="card-group">
        <Card v-for="(card, index) in value"
            :key="index"
            :card="card"
            :style="[{ left: index * 20 + 'px' }]"
        />
    </div>
</template>

<script>
import Card from "./card.vue"

export default {
  name: "cardGroup",
  components: {
      Card
  },
  props: ['value'],
  data() {
      return {};
  },
  methods: {
  },
  mounted() {
  }
};
</script>
