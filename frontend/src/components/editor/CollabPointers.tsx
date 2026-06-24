import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Awareness } from 'y-protocols/awareness';

/**
 * Figma-style live mouse pointers.
 *
 * Each client broadcasts its mouse position (relative to the white "paper", so
 * the coordinates map 1:1 for everyone since the paper is a fixed width and the
 * same document yields the same height) through the shared Yjs awareness under a
 * `pointer` field. Every other client renders a little cursor + name flag at
 * that position. Awareness is ephemeral, so nothing touches the document.
 */

interface RemotePointer {
  clientId: number;
  x: number;
  y: number;
  name: string;
  color: string;
}

interface Props {
  awareness: Awareness;
  rootRef: RefObject<HTMLDivElement | null>;
  name: string;
  color: string;
}

// Cap how often we push pointer updates over the socket (~25/sec).
const THROTTLE_MS = 40;

export function CollabPointers({ awareness, rootRef, name, color }: Props) {
  const [pointers, setPointers] = useState<RemotePointer[]>([]);
  const lastSent = useRef(0);

  // Broadcast the local pointer position, relative to the paper's top-left.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSent.current < THROTTLE_MS) return;
      lastSent.current = now;
      const rect = root.getBoundingClientRect();
      awareness.setLocalStateField('pointer', {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        name,
        color,
      });
    };
    const clear = () => awareness.setLocalStateField('pointer', null);

    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', clear);
    return () => {
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', clear);
      clear();
    };
  }, [awareness, rootRef, name, color]);

  // Track every other client's pointer.
  useEffect(() => {
    const sync = () => {
      const next: RemotePointer[] = [];
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID) return;
        const p = (state as { pointer?: RemotePointer | null }).pointer;
        if (p && typeof p.x === 'number' && typeof p.y === 'number') {
          next.push({ clientId, x: p.x, y: p.y, name: p.name, color: p.color });
        }
      });
      setPointers(next);
    };
    awareness.on('change', sync);
    sync();
    return () => awareness.off('change', sync);
  }, [awareness]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden print:hidden">
      {pointers.map((p) => (
        <div
          key={p.clientId}
          className="absolute left-0 top-0 will-change-transform"
          style={{
            transform: `translate(${p.x}px, ${p.y}px)`,
            // Smooth between throttled updates for a fluid, Figma-like glide.
            transition: 'transform 80ms linear',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))' }}
          >
            <path
              d="M3 3 L3 17.5 L7.2 13.5 L10 19.8 L12.6 18.6 L9.8 12.4 L15.5 12.4 Z"
              fill={p.color}
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="absolute left-[18px] top-[16px] whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: p.color }}
          >
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}
