<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class GraphCardWrapper extends Vue {
  collapsed = true;

  @Prop({ type: Boolean, default: false })
  public readonly show!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly showInitial!: boolean;

  created(): void {
    this.collapsed = !this.showInitial;
  }
}
</script>

<template>
  <div
    v-if="show && $q.screen.gt.md"
    class="row no-wrap justify-center combined-wrapper"
    v-on="$listeners"
  >
    <CardWrapper class="col-5" v-bind="$attrs">
      <template #toolbar>
        <slot name="toolbar" />
      </template>
      <slot />
    </CardWrapper>
    <q-btn
      dense
      :class="['col-auto graph-tab show self-center',{collapsed}]"
      :icon="collapsed ? 'mdi-chart-line' : 'mdi-arrow-collapse-left'"
      @click="collapsed = !collapsed"
    >
      <q-tooltip>{{ collapsed ? 'Show Graph' : 'Hide Graph' }}</q-tooltip>
    </q-btn>
    <div v-if="!collapsed" class="col-5 bg-dark">
      <div class="graph-container fit">
        <slot name="graph" />
      </div>
    </div>
  </div>
  <CardWrapper
    v-else
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #toolbar>
      <slot name="toolbar" />
    </template>
    <slot />
  </CardWrapper>
</template>

<style lang="sass" scoped>
.combined-wrapper
  height: 800px
  max-height: 90vh
  width: 90vw
  min-width: 90vw
  box-shadow: none

.graph-tab
  background-color: $dialog-toolbar-color
  padding: 30px 2px
  border-radius: 5px 0 0 5px
  margin-left: 5px

.graph-tab.collapsed
  border-radius: 0 5px 5px 0
  margin-left: 0

.graph-container
  border-radius: 4px
  border: 1px solid $blue-grey-9
</style>
