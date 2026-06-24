import http from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { parse as parseCookies } from 'cookie';
import { Server } from 'socket.io';
import * as Y from 'yjs';
import { DocumentModel } from '../models/Document';

// One Y.Doc per document, kept alive in memory while the server is running.
// On first join after server restart, we reload from MongoDB.
const docRooms = new Map<string, Y.Doc>();

// Debounced save timers — we batch rapid keystrokes into a single DB write.
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

async function loadDoc(docId: string): Promise<Y.Doc> {
  const ydoc = new Y.Doc();
  const record = await DocumentModel.findById(docId).select('yjsState').lean();
  if (record?.yjsState) {
    Y.applyUpdate(ydoc, new Uint8Array(record.yjsState as Buffer));
  }
  return ydoc;
}

async function persistDoc(docId: string, ydoc: Y.Doc) {
  const state = Buffer.from(Y.encodeStateAsUpdate(ydoc));
  await DocumentModel.findByIdAndUpdate(docId, { yjsState: state });
}

function schedulePersist(docId: string, ydoc: Y.Doc) {
  const existing = saveTimers.get(docId);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    persistDoc(docId, ydoc).catch((err) =>
      console.error('YJS persist error:', err),
    );
    saveTimers.delete(docId);
  }, 2000);
  saveTimers.set(docId, timer);
}

export function initSocket(httpServer: http.Server) {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  // Auth middleware — runs before every connection is accepted.
  // We read the accessToken from the browser's cookies (sent automatically
  // because Socket.io uses HTTP polling first, which includes all cookies).
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? '';
      const cookies = parseCookies(cookieHeader);
      const token = cookies['accessToken'];
      if (!token) return next(new Error('Not authenticated'));

      const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
      ) as JwtPayload;
      socket.data.userId = payload.id as string;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;

    // Client sends this when the editor page mounts.
    // We verify access, then send the full current document state.
    socket.on('join-doc', async ({ docId }: { docId: string }) => {
      try {
        const record = await DocumentModel.findById(docId).lean();
        if (!record)
          return socket.emit('error', { message: 'Document not found' });

        const isOwner = record.owner.toString() === userId;
        const isCollaborator = record.collaborators.some(
          (c) => c.user.toString() === userId,
        );
        if (!isOwner && !isCollaborator) {
          return socket.emit('error', { message: 'Access denied' });
        }

        if (!docRooms.has(docId)) {
          const ydoc = await loadDoc(docId);
          docRooms.set(docId, ydoc);
        }

        await socket.join(docId);

        const ydoc = docRooms.get(docId)!;
        // Send the full document state to the joining client.
        // Array.from converts Uint8Array → plain number array so Socket.io
        // serialises it correctly over both polling and WebSocket transports.
        socket.emit('doc-state', {
          state: Array.from(Y.encodeStateAsUpdate(ydoc)),
        });

        socket.to(docId).emit('user-joined', { userId });
      } catch (err) {
        console.error('join-doc error:', err);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // A client made a local edit. We:
    // 1. Apply the update to the server-side Y.Doc (keeps it authoritative)
    // 2. Broadcast to every other client in the room
    // 3. Schedule a debounced MongoDB write
    socket.on(
      'doc-update',
      ({ docId, update }: { docId: string; update: number[] }) => {
        const ydoc = docRooms.get(docId);
        if (!ydoc) return;

        // 'remote' origin prevents the server from re-broadcasting its own apply
        Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
        socket.to(docId).emit('doc-update', { update });
        schedulePersist(docId, ydoc);
      },
    );

    // Cursor / presence data — no persistence needed, just relay to the room.
    socket.on(
      'awareness-update',
      ({ docId, awareness }: { docId: string; awareness: number[] }) => {
        socket.to(docId).emit('awareness-update', { awareness });
      },
    );

    socket.on('leave-doc', ({ docId }: { docId: string }) => {
      socket.leave(docId);
      socket.to(docId).emit('user-left', { userId });
    });

    socket.on('disconnect', () => {
      // socket.rooms is already cleaned up on disconnect, so notify via rooms
      // we were in before the disconnect (captured in the closure above).
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit('user-left', { userId });
        }
      });
    });
  });
}
