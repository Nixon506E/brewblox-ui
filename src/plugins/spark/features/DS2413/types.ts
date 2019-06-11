import { Block, IoChannel } from '@/plugins/spark/types';

export interface DS2413Block extends Block {
  data: {
    address: string;
    connected: boolean;
    channels: IoChannel[];
  };
}
