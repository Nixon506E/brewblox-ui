import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec, BlockType, DS2408Block, DS2408ConnectMode } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './DS2408Widget.vue';

const typeName = BlockType.DS2408;

const block: BlockSpec<DS2408Block> = {
  id: typeName,
  discovered: true,
  generate: () => ({
    address: '',
    connected: false,
    pins: [],
    connectMode: DS2408ConnectMode.CONNECT_VALVE,
  }),
  fields: [],
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'DS2408 Chip',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
  wizard: 'BlockDiscoveryWizard',
};

export default { feature, block };
