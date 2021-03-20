import Vue from 'vue';
import Game from './game.vue';

var app = new Vue({
    el: '#game',
    render: h => h(Game)
});
