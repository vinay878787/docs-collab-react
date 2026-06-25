import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { socket } from '@/lib/socket';
import { SocketIOYjsProvider } from '@/lib/SocketIOYjsProvider';
import type { AuthUser } from '@/context/AuthContext';

interface Options {
  docId: string;
  user: AuthUser | null;
}

export function useCollaboration({ docId, user }: Options) {
  const ydoc = useRef(new Y.Doc()).current;
  const [synced, setSynced] = useState(false);
  // State (not a ref): the editor must re-render once the provider exists so the
  // CollaborationCursor extension — built once inside useEditor — is created with
  // a real provider. A ref wouldn't trigger that re-render, so the inline caret
  // extension would silently never be added.
  const [provider, setProvider] = useState<SocketIOYjsProvider | null>(null);

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

    const created = new SocketIOYjsProvider(docId, ydoc, socket);
    setProvider(created);

    // The CollaborationCursor extension advertises this user (name + colour)
    // into awareness; see TiptapEditor. Keeping it in one place avoids the two
    // sources fighting over the awareness 'user' field.

    return () => {
      created.destroy();
      socket.disconnect();
      setProvider(null);
    };
  }, [docId, ydoc, user]);

  return { ydoc, synced, provider };
}
