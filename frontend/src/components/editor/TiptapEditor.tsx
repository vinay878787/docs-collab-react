import { Node, mergeAttributes } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import type * as Y from 'yjs';
import type { ReactNode } from 'react';
import { EditorToolbar } from './EditorToolbar';

const lowlight = createLowlight(common);

// Inline custom node — renders as a visible page-break marker in the editor
// and triggers a CSS page break when printing.
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
  /** Content rendered inside the paper before the editor (e.g. document title). */
  header?: ReactNode;
}

export function TiptapEditor({ ydoc, editable = true, header }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Collaboration brings its own YJS-backed undo/redo
        codeBlock: false, // replaced by CodeBlockLowlight
      }),
      Collaboration.configure({ document: ydoc }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      PageBreak,
    ],
    editable,
    editorProps: {
      attributes: {
        class: 'text-gray-900 dark:text-gray-100 focus:outline-none',
        spellcheck: 'true',
      },
    },
  });

  return (
    <>
      {/* Toolbar — sticky, sits above the paper area */}
      <EditorToolbar editor={editor} />

      {/* Gray "printing desk" background, like Google Docs */}
      <div className="editor-print-area bg-[#e8e8e8] dark:bg-[#111111] min-h-[calc(100vh-96px)] py-8 overflow-x-auto print:bg-transparent print:py-0">
        {/* Letter-size paper (816 × 1056 px at 96 dpi) */}
        <div
          className="editor-paper relative mx-auto bg-white dark:bg-[#1c1c1c] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.08)] print:shadow-none print:mx-0"
          style={{ width: '816px', minHeight: '1056px' }}
        >
          {/* Page content — 1 inch margins (96 px each side) */}
          <div className="px-24 pt-16 pb-20">
            {header}
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </>
  );
}
