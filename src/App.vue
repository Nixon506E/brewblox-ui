<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class App extends Vue {

  async created(): Promise<void> {
    Vue.$app = this;

    /**
     * Order of startup is important here.
     * We first ensure that the database is working.
     * Startup functions may register eventbus listeners.
     * If they do so after the eventbus started,
     * they will miss the first (immediate) data push.
     */
    await Vue.$database.connect();
    await Vue.$startup.start();
    await Vue.$eventbus.connect();
  }
}
</script>

<template>
  <div id="q-app">
    <router-view />
    <Watchers />
  </div>
</template>
