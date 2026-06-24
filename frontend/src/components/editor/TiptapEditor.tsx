import { useEffect, useRef, useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import type * as Y from 'yjs';
import type { ReactNode } from 'react';
import type { SocketIOYjsProvider } from '@/lib/SocketIOYjsProvider';
import type { AuthUser } from '@/context/AuthContext';
import { EditorToolbar } from './EditorToolbar';
import { Pagination } from './pagination';
import { CollabPointers } from './CollabPointers';
import { userColor, safeColor, safeName } from '@/lib/userColor';

const lowlight = createLowlight(common);

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-page-break': '',
        class: 'page-break-node',
      }),
    ];
  },
});

interface Props {
  ydoc: Y.Doc;
  editable?: boolean;
  header?: ReactNode;
  provider?: SocketIOYjsProvider | null;
  user?: AuthUser | null;
}

// Letter page at 96 dpi. GAP is the gray space between pages (visible desk).
const PAGE_H = 1056;
const PAGE_GAP = 64;

export function TiptapEditor({
  ydoc,
  editable = true,
  header,
  provider,
  user,
}: Props) {
  const [numPages, setNumPages] = useState(1);
  const pageRootRef = useRef<HTMLDivElement>(null);

  // Per-session colour: keyed off the Y.Doc clientID so every open tab/user
  // gets a distinct colour (the same person in two tabs won't collide), and it
  // stays consistent for the caret, selection, and live mouse pointer.
  const sessionColor = userColor(String(ydoc.clientID));

  // Total visual height: N pages + (N-1) gaps.
  const containerH = numPages * PAGE_H + (numPages - 1) * PAGE_GAP;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false, codeBlock: false }),
      Collaboration.configure({ document: ydoc }),
      ...(provider && user
        ? [
            CollaborationCursor.configure({
              provider: provider as { awareness: unknown },
              user: { name: user.username, color: sessionColor },
              // Caret + always-visible name label, in this user's colour.
              // u.* comes from untrusted awareness — sanitise before it touches
              // a style string (color) or the DOM (name via textContent).
              render: (u: { name: string; color: string }) => {
                const color = safeColor(u.color);
                const caret = document.createElement('span');
                caret.classList.add('collaboration-cursor__caret');
                caret.setAttribute('style', `border-color: ${color}`);

                const label = document.createElement('div');
                label.classList.add('collaboration-cursor__label');
                label.setAttribute('style', `background-color: ${color}`);
                label.textContent = safeName(u.name);

                caret.appendChild(label);
                return caret;
              },
              // Highlight remote selections with a translucent tint of the
              // collaborator's colour so the underlying text stays readable.
              selectionRender: (u: { name: string; color: string }) => ({
                nodeName: 'span',
                class: 'collaboration-cursor__selection',
                style: `background-color: ${safeColor(u.color)}33`,
                'data-user': safeName(u.name),
              }),
            }),
          ]
        : []),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      PageBreak,
      Pagination.configure({ onPagesChange: setNumPages }),
    ],
    editable,
    editorProps: {
      attributes: {
        class: 'text-gray-900 dark:text-gray-100 focus:outline-none',
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) editor.setEditable(editable);
  }, [editor, editable]);

  return (
    <>
      <EditorToolbar editor={editor} />

      {/* Gray printing-desk area */}
      <div className="editor-print-area bg-[#e8e8e8] dark:bg-[#111111] min-h-[calc(100vh-96px)] py-10 overflow-x-auto print:bg-transparent print:py-0">
        {/*
          One white container spans all pages + gaps.
          Content div (z-10, white bg) grows naturally — no physical gaps in the text flow.
          Gray gap overlays (z-20) sit on top at each page boundary, visually separating pages
          without interrupting cursor/selection behaviour.
        */}
        <div
          ref={pageRootRef}
          data-page-root
          className="relative mx-auto bg-white dark:bg-[#1c1c1c] print:shadow-none"
          style={{
            width: '816px',
            minHeight: `${containerH}px`,
            // Outer shadow only on the very first page top/sides; individual page-bottom
            // shadows come from the gap overlays below.
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {/* ── Gap overlays ─────────────────────────────────────────────
              Positioned at (i+1)*PAGE_H + i*PAGE_GAP within the container.
              z-20 renders them above the content div (z-10).
              pointer-events-none lets clicks/selection pass through to text.
          ────────────────────────────────────────────────────────────── */}
          {numPages > 1 &&
            Array.from({ length: numPages - 1 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 z-20 pointer-events-none overflow-hidden print:hidden"
                style={{
                  top: `${(i + 1) * PAGE_H + i * PAGE_GAP}px`,
                  height: `${PAGE_GAP}px`,
                  background: 'inherit', // picks up the outer #e8e8e8 / #111111
                  backgroundColor: 'var(--tw-bg-opacity, 1)',
                }}
              >
                {/* Explicitly paint the gap in the desk colour */}
                <div className="absolute inset-0 bg-[#e8e8e8] dark:bg-[#111111]" />
                {/* Soft shadow cast downward from the bottom edge of the page above */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent z-10" />
                {/* Soft shadow cast upward from the top edge of the page below */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent z-10" />
              </div>
            ))}

          {/* ── Content layer ───────────────────────────────────────────
              White background (z-10) spans all pages + gap positions.
              The gap overlays (z-20) cover the gap slices, hiding the
              content that happens to fall in those 64 px bands.
          ────────────────────────────────────────────────────────────── */}
          <div className="relative z-10 bg-white dark:bg-[#1c1c1c] px-24 pt-16 pb-20 print:px-0 print:pt-0 print:pb-0">
            {header}
            <EditorContent editor={editor} />
          </div>

          {/* Figma-style live mouse pointers for every other collaborator. */}
          {provider && user && (
            <CollabPointers
              awareness={provider.awareness}
              rootRef={pageRootRef}
              name={user.username}
              color={sessionColor}
            />
          )}
        </div>
      </div>
    </>
  );
}
