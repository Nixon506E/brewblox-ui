<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { saveFile } from '@/helpers/import-export';

@Component
export default class ExportAction extends CrudComponent {

  @Prop({ type: String, default: 'mdi-file-export' })
  readonly icon!: string;

  @Prop({ type: String, default: 'Export widget' })
  readonly label!: string;

  async startExport(): Promise<void> {
    const { id, dashboard, pinnedPosition, ...exported } = this.widget;
    void { id, dashboard, pinnedPosition };
    saveFile(exported, `brewblox-${this.widget.title}-${this.widget.feature}.json`);
  }
}
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startExport" />
</template>
