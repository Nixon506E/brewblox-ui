import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Block } from '../state';
import { fetchBlock, saveBlock } from '../store/actions';
import { blockById } from '../store/getters';

@Component
export default class BlockWidget extends WidgetBase {
  get serviceId(): string {
    return this.$props.config.serviceId;
  }

  get blockId(): string {
    return this.$props.config.blockId;
  }

  get block(): Block {
    return blockById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: Block) {
    this.saveBlock(block);
  }

  get additionalInfo() {
    return {
      'Widget ID': this.$props.id,
      'Block ID': this.blockId,
      'Service ID': this.serviceId,
      'Feature type': this.$props.type,
    };
  }

  refreshBlock() {
    fetchBlock(this.$store, this.serviceId, this.block);
  }

  saveBlock(block: Block) {
    saveBlock(this.$store, this.serviceId, block);
  }
}