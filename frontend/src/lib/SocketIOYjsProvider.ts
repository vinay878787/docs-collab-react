import * as Y from 'yjs';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import type { Socket } from 'socket.io-client';

/**
 * Bridges a Y.Doc to the backend Socket.io room.
 *
 * Data flow:
 *   Local edit  → Y.Doc update (origin ≠ 'remote') → socket emit doc-update
 *   Remote edit → socket receive doc-update → Y.applyUpdate (origin = 'remote')
 *
 * The 'remote' origin string is the guard that prevents an infinite echo:
 * applyUpdate triggers another 'update' event, but origin='remote' makes
 * the handler skip re-emitting.
 *
 * Binary encoding: Uint8Array → Array.from() for emit (JSON-safe over both
 * polling and WebSocket transports), number[] → new Uint8Array() on receive.
 */
export class SocketIOYjsProvider {
  public readonly awareness: Awareness;

  private readonly docId: string;
  private readonly ydoc: Y.Doc;
  private readonly socket: Socket;
  private destroyed = false;

  constructor(docId: string, ydoc: Y.Doc, socket: Socket) {
    this.docId = docId;
    this.ydoc = ydoc;
    this.socket = socket;
    this.awareness = new Awareness(ydoc);

    this.ydoc.on('update', this.handleYDocUpdate);
    this.awareness.on('update', this.handleAwarenessUpdate);

    this.socket.on('doc-state', this.handleDocState);
    this.socket.on('doc-update', this.handleDocUpdate);
    this.socket.on('awareness-update', this.handleAwarenessReceive);

    if (this.socket.connected) {
      this.joinDoc();
    }
    this.socket.on('connect', this.joinDoc);
  }

  private joinDoc = () => {
    this.socket.emit('join-doc', { docId: this.docId });
  };

  // Send local Y.Doc changes to the server.
  // Guard: skip if origin === 'remote' to avoid echoing back received updates.
  private handleYDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === 'remote' || this.destroyed) return;
    this.socket.emit('doc-update', {
      docId: this.docId,
      update: Array.from(update),
    });
  };

  // Server sends the full doc state to a newly joined client.
  private handleDocState = (data: { state: number[] }) => {
    Y.applyUpdate(this.ydoc, new Uint8Array(data.state), 'remote');
  };

  // Incremental update broadcast from another client via the server.
  private handleDocUpdate = (data: { update: number[] }) => {
    Y.applyUpdate(this.ydoc, new Uint8Array(data.update), 'remote');
  };

  // Relay local awareness changes (cursor position, user info) to the server.
  private handleAwarenessUpdate = ({
    added,
    updated,
    removed,
  }: {
    added: number[];
    updated: number[];
    removed: number[];
  }) => {
    if (this.destroyed) return;
    const changed = [...added, ...updated, ...removed];
    const encoded = encodeAwarenessUpdate(this.awareness, changed);
    this.socket.emit('awareness-update', {
      docId: this.docId,
      awareness: Array.from(encoded),
    });
  };

  // Apply awareness updates received from other clients.
  private handleAwarenessReceive = (data: { awareness: number[] }) => {
    applyAwarenessUpdate(
      this.awareness,
      new Uint8Array(data.awareness),
      'remote',
    );
  };

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.socket.emit('leave-doc', { docId: this.docId });

    this.ydoc.off('update', this.handleYDocUpdate);
    this.awareness.off('update', this.handleAwarenessUpdate);

    this.socket.off('connect', this.joinDoc);
    this.socket.off('doc-state', this.handleDocState);
    this.socket.off('doc-update', this.handleDocUpdate);
    this.socket.off('awareness-update', this.handleAwarenessReceive);

    this.awareness.destroy();
  }
}
