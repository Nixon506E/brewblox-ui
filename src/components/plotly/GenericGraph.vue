<script lang="ts">
import merge from 'lodash/merge';
import { ClickAnnotationEvent, Config, Layout, PlotData, PlotMouseEvent } from 'plotly.js';
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import notify from '@/helpers/notify';
import { GraphAnnotation } from '@/plugins/history/types';

import PlotlyGraph from './PlotlyGraph';

const layoutDefaults = (): Partial<Layout> => ({
  title: '',
  font: {
    color: '#fff',
  },
  margin: {
    t: 40,
    l: 40,
    r: 0,
    b: 40,
  },
  legend: { orientation: 'h' },
  showlegend: true,
  xaxis: {
    type: 'date',
    gridcolor: '#666',
    autorange: true,
    domain: [0, 0.9],
  },
  yaxis: {
    side: 'right',
    position: 0.9,
    gridcolor: '#666',
    zerolinecolor: '#eee',
    autorange: true,
  },
  yaxis2: {
    overlaying: 'y',
    side: 'right',
    position: 0.95,
    gridcolor: '#467',
    zerolinecolor: '#aef',
    autorange: true,
    tickfont: {
      color: '#aef',
    },
  },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  hovermode: 'closest',
});

@Component({
  components: {
    PlotlyGraph,
  },
})
export default class GenericGraph extends Vue {
  id: string = uid();

  @Prop({ type: Array, required: true })
  readonly data!: PlotData[];

  @Prop({ type: Object, required: true })
  readonly layout!: Partial<Layout>;

  @Prop({ type: Boolean, default: false })
  public readonly annotated!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly maximized!: boolean;

  get plotlyLayout(): Partial<Layout> {
    return merge(layoutDefaults(), this.layout);
  }

  get plotlyConfig(): Partial<Config> {
    return {
      displaylogo: false,
      responsive: true,
      staticPlot: this.$dense && !this.maximized,
    };
  }

  get ready(): boolean {
    return this.data !== undefined
      && this.plotlyLayout !== undefined
      && this.plotlyConfig !== undefined;
  }

  get annotations(): GraphAnnotation[] {
    return this.layout.annotations ?? [];
  }

  displayError(msg: string): void {
    notify.warn(`Failed to render graph: ${msg}`);
  }

  onGraphClick(evt: PlotMouseEvent): void {
    if (!this.annotated || !evt.points.length) { return; }

    const point = evt.points[0];
    createDialog({
      component: 'InputDialog',
      title: 'Add annotation',
      value: 'New annotation',
    })
      .onOk((text: string) => {
        this.annotations.push({
          x: point.x as string,
          y: parseFloat((point.y as number).toPrecision(4)),
          xref: 'x',
          yref: point.data.yaxis as 'y',
          text,
          visible: true,
          arrowhead: 7,
          arrowcolor: 'white',
          captureevents: true,
        });
        this.$emit('annotations', this.annotations);
      });
  }

  onAnnotationClick(evt: ClickAnnotationEvent): void {
    if (!this.annotated || this.annotations.length < evt.index) { return; }

    const annotation = this.annotations[evt.index];
    createDialog({
      component: 'GraphAnnotationDialog',
      title: 'Edit annotation',
      value: annotation.text,
    })
      .onOk(({ text, remove }: { text: string; remove: boolean }) => {
        remove
          ? this.annotations.splice(evt.index, 1)
          : this.annotations.splice(evt.index, 1, { ...annotation, text });
        this.$emit('annotations', this.annotations);
      });
  }
}
</script>

<template>
  <PlotlyGraph
    v-if="ready"
    :id="id"
    :data="data"
    :layout="plotlyLayout"
    :config="plotlyConfig"
    class="fit"
    v-bind="$attrs"
    @error="displayError"
    @plotly_click="onGraphClick"
    @plotly_clickannotation="onAnnotationClick"
  />
</template>

<style lang="sass">
.plotly
  .modebar
    left: 0px
  .modebar-group
    background: transparent !important
  .modebar-btn path
    fill: rgba(255, 255, 255, 0.6)
  .modebar-btn.active path, .modebar-btn:hover path
    fill: rgba(255, 255, 255, 1)

.xy2
  color: green
</style>
