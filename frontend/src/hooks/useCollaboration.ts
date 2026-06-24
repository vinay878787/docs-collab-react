import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { socket } from '@/lib/socket';
import { SocketIOYjsProvider } from '@/lib/SocketIOYjsProvider';
import type { AuthUser } from '@/context/AuthContext';

// Distinct, accessible cursor colours for collaborators
const CURSOR_COLORS = [
  '#e63946',
  '#f4a261',
  '#2a9d8f',
  '#457b9d',
  '#7209b7',
  '#f72585',
  '#4cc9f0',
  '#06d6a0',
];

let colorIndex = 0;
function nextColor() {
  return CURSOR_COLORS[colorIndex++ % CURSOR_COLORS.length];
}

interface Options {
  docId: string;
  user: AuthUser | null;
}

export function useCollaboration({ docId, user }: Options) {
  const ydoc = useRef(new Y.Doc()).current;
  const [synced, setSynced] = useState(false);
  const providerRef = useRef<SocketIOYjsProvider | null>(null);

  // IndexedDB — hydrates the Y.Doc from the local cache so the editor shows
  // content immediately while the server's doc-state is still in flight.
  useEffect(() => {
    const persistence = new IndexeddbPersistence(`doc-${docId}`, ydoc);
    persistence.on('synced', () => setSynced(true));
    return () => {
      persistence.destroy();
    };
  }, [docId, ydoc]);

  // Socket.io provider — connects to the server, joins the document room,
  // and keeps the Y.Doc in sync with all other connected clients.
  useEffect(() => {
    if (!user) return;

    socket.connect();

    const provider = new SocketIOYjsProvider(docId, ydoc, socket);
    providerRef.current = provider;

    // Advertise this user to all collaborators (name + cursor colour)
    provider.awareness.setLocalStateField('user', {
      name: user.username,
      color: nextColor(),
    });

    return () => {
      provider.destroy();
      socket.disconnect();
      providerRef.current = null;
    };
  }, [docId, ydoc, user]);

  return { ydoc, synced, providerRef };
}
