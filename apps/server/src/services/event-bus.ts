import { EventEmitter } from 'node:events';
import type { WsMessage } from '@iothub/shared';

export class HubEventBus {
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  emit(message: WsMessage): void {
    this.emitter.emit('ws', message);
  }

  onMessage(listener: (message: WsMessage) => void): () => void {
    this.emitter.on('ws', listener);
    return () => {
      this.emitter.off('ws', listener);
    };
  }
}
