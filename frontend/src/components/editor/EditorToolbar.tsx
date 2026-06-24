import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import FormatAlignCenterOutlinedIcon from '@mui/icons-material/FormatAlignCenterOutlined';
import FormatAlignJustifyOutlinedIcon from '@mui/icons-material/FormatAlignJustifyOutlined';
import FormatAlignLeftOutlinedIcon from '@mui/icons-material/FormatAlignLeftOutlined';
import FormatAlignRightOutlinedIcon from '@mui/icons-material/FormatAlignRightOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import FormatStrikethroughOutlinedIcon from '@mui/icons-material/FormatStrikethroughOutlined';
import FormatUnderlinedOutlinedIcon from '@mui/icons-material/FormatUnderlinedOutlined';
import InsertPageBreakOutlinedIcon from '@mui/icons-material/InsertPageBreakOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { formatCode } from '@/lib/formatCode';

function Sep() {
  return (
    <div className="mx-1 h-5 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />
  );
}

function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        if (!disabled) onClick();
      }}
      title={title}
      disabled={disabled}
      className={`flex h-7 min-w-7 items-center justify-center rounded px-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [isFormatting, setIsFormatting] = useState(false);

  if (!editor) return null;

  const handlePrettier = async () => {
    if (isFormatting) return;

    // Find first code block in doc and its position
    let codeNode: ReturnType<typeof editor.state.doc.nodeAt> = null;
    let codePos = -1;

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'codeBlock' && codePos === -1) {
        codeNode = node;
        codePos = pos;
        return false;
      }
    });

    if (!codeNode || codePos === -1) return;

    const lang: string =
      (codeNode as { attrs: { language?: string } }).attrs.language ??
      'javascript';
    const code: string = (codeNode as { textContent: string }).textContent;

    setIsFormatting(true);
    try {
      const formatted = await formatCode(code, lang);
      // Select inside the code block and replace with formatted text
      editor
        .chain()
        .focus()
        .setTextSelection({
          from: codePos + 1,
          to:
            codePos +
            1 +
            (codeNode as { content: { size: number } }).content.size,
        })
        .insertContent(formatted.trimEnd())
        .run();
    } catch {
      // unsupported language or parse error — silently skip
    } finally {
      setIsFormatting(false);
    }
  };

  const inCodeBlock = editor.isActive('codeBlock');

  return (
    <div className="editor-toolbar sticky top-0 z-20 flex items-center gap-0.5 overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-white/97 dark:bg-gray-950/97 backdrop-blur px-3 py-1">
      {/* ── LEFT: Document editing ────────────────────────────────────── */}

      {/* Headings */}
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <span className="text-[11px] font-bold">H1</span>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <span className="text-[11px] font-bold">H2</span>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <span className="text-[11px] font-bold">H3</span>
      </Btn>

      <Sep />

      {/* Inline formatting */}
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <FormatBoldOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <FormatItalicOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <FormatUnderlinedOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <FormatStrikethroughOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>

      <Sep />

      {/* Text alignment */}
      <Btn
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <FormatAlignLeftOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <FormatAlignCenterOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <FormatAlignRightOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        title="Justify"
      >
        <FormatAlignJustifyOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <FormatListBulletedOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <FormatListNumberedOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>

      <Sep />

      {/* Block extras */}
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <FormatQuoteOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({ type: 'pageBreak' }).run()
        }
        title="Insert Page Break"
      >
        <InsertPageBreakOutlinedIcon style={{ fontSize: 17 }} />
      </Btn>

      {/* ── PUSH right ────────────────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-0.5">
        {/* Code tools */}
        <Btn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <CodeOutlinedIcon style={{ fontSize: 17 }} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={inCodeBlock}
          title="Code Block"
        >
          <DataObjectOutlinedIcon style={{ fontSize: 17 }} />
        </Btn>

        <Sep />

        {/* Prettier */}
        <Btn
          onClick={() => void handlePrettier()}
          disabled={!inCodeBlock || isFormatting}
          title={
            inCodeBlock
              ? 'Format code with Prettier'
              : 'Place cursor inside a code block to format'
          }
        >
          <AutoFixHighOutlinedIcon style={{ fontSize: 17 }} />
          <span className="ml-1 text-[11px] font-semibold hidden sm:inline">
            {isFormatting ? '…' : 'Format'}
          </span>
        </Btn>

        <Sep />

        {/* Print */}
        <Btn onClick={() => window.print()} title="Print document">
          <PrintOutlinedIcon style={{ fontSize: 17 }} />
          <span className="ml-1 text-[11px] font-semibold hidden sm:inline">
            Print
          </span>
        </Btn>
      </div>
    </div>
  );
}
