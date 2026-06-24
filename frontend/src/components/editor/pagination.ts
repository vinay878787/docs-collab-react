import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { EditorView } from '@tiptap/pm/view';

/**
 * Screen-pagination plugin.
 *
 * Tiptap/ProseMirror lay content out as one continuous flow, so on their own
 * they have no concept of "this paragraph belongs at the bottom of page 1".
 * That means text happily runs into (and past) the bottom margin of a page.
 *
 * This plugin measures the rendered geometry of every top-level block and, when
 * a block would cross into the current page's bottom margin, inserts a spacer
 * *widget decoration* before it. The spacer height equals
 *   bottom-margin + page-gap + top-margin
 * so the block reflows to the content-top of the next page.
 *
 * Decorations live only in the view (never in the document / Yjs), so this is
 * safe for collaborative editing — remote peers never see the spacers.
 *
 * All geometry below is in CSS px at 96 dpi and must stay in sync with the
 * paddings/dimensions used in TiptapEditor.tsx.
 */

const PAGE_H = 1056; // Letter height (11in * 96)
const PAGE_GAP = 64; // gray desk gap drawn between pages
const MARGIN_TOP = 64; // page top padding (pt-16)
const MARGIN_BOTTOM = 80; // page bottom padding (pb-20)

const CONTENT_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM; // usable text height per page (912)
const PAGE_STRIDE = PAGE_H + PAGE_GAP; // top-to-top distance between pages (1120)

// Tolerance so sub-pixel rounding doesn't trigger a spurious page break.
const EPS = 0.5;

interface Break {
  pos: number;
  height: number;
}

/**
 * Walk the top-level blocks and decide where page breaks (spacers) are needed.
 * Returns the spacer positions/heights and the resulting page count.
 *
 * Measurements are taken relative to `root` (the white "paper" container) so
 * they line up with the page grid / gap overlays rendered by React.
 */
function computeBreaks(
  view: EditorView,
  root: HTMLElement,
): { breaks: Break[]; numPages: number } {
  const rootTop = root.getBoundingClientRect().top;

  // Existing spacers from the previous pass — subtract their height to recover
  // each block's "natural" (spacer-free) position, then reassign from scratch.
  const spacerData = Array.from(
    root.querySelectorAll<HTMLElement>('.pagination-spacer'),
  ).map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top - rootTop, height: r.height };
  });
  const spacerHeightAbove = (y: number) =>
    spacerData.reduce((sum, s) => (s.top < y - EPS ? sum + s.height : sum), 0);

  const breaks: Break[] = [];
  let page = 0;
  let offset = 0; // cumulative height of spacers reassigned in this pass
  let seenBlock = false;
  let forceBreak = false; // set by a manual page-break node
  let maxBottom = 0;

  view.state.doc.forEach((node, pos) => {
    const dom = view.nodeDOM(pos);
    if (!dom || dom.nodeType !== 1) return;

    const r = (dom as HTMLElement).getBoundingClientRect();
    const naturalTop = r.top - rootTop - spacerHeightAbove(r.top - rootTop);
    const naturalBottom = naturalTop + r.height;

    const renderedTop = naturalTop + offset;
    const renderedBottom = naturalBottom + offset;

    // Bottom of the current page's content area, in rendered coords.
    const contentBottom = page * PAGE_STRIDE + MARGIN_TOP + CONTENT_H;

    const overflows = renderedBottom > contentBottom + EPS;
    if (seenBlock && (forceBreak || overflows)) {
      page += 1;
      const desiredTop = page * PAGE_STRIDE + MARGIN_TOP;
      const spacerH = desiredTop - renderedTop;
      if (spacerH > EPS) {
        breaks.push({ pos, height: spacerH });
        offset += spacerH;
      }
    }
    forceBreak = false;

    // A manual page break pushes everything after it to the next page.
    if (node.type.name === 'pageBreak') forceBreak = true;

    maxBottom = Math.max(maxBottom, naturalBottom + offset);
    seenBlock = true;
  });

  const numPages = Math.max(
    1,
    page + 1,
    Math.ceil((maxBottom - EPS) / PAGE_STRIDE),
  );
  return { breaks, numPages };
}

export interface PaginationOptions {
  /** Called whenever the computed page count changes. */
  onPagesChange?: (numPages: number) => void;
}

export const Pagination = Extension.create<PaginationOptions>({
  name: 'pagination',

  addOptions() {
    return { onPagesChange: undefined };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    const key = new PluginKey<DecorationSet>('pagination');

    return [
      new Plugin<DecorationSet>({
        key,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            const meta = tr.getMeta(key) as DecorationSet | undefined;
            if (meta) return meta;
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return key.getState(state);
          },
        },
        view(view) {
          let scheduled = false;
          let lastSig = '';

          const measure = () => {
            scheduled = false;
            if (!view.dom.isConnected) return;
            // Look up the page-root lazily: at editor-view construction time the
            // ProseMirror DOM isn't attached to the React tree yet, so this
            // ancestor doesn't exist until after mount.
            const root = view.dom.closest<HTMLElement>('[data-page-root]');
            if (!root) return;

            const { breaks, numPages } = computeBreaks(view, root);
            options.onPagesChange?.(numPages);

            const sig =
              numPages +
              '|' +
              breaks.map((b) => `${b.pos}:${Math.round(b.height)}`).join(',');
            if (sig === lastSig) return;
            lastSig = sig;

            const decos = breaks.map((b) =>
              Decoration.widget(
                b.pos,
                () => {
                  const el = document.createElement('div');
                  el.className = 'pagination-spacer';
                  el.style.height = `${b.height}px`;
                  el.contentEditable = 'false';
                  el.setAttribute('aria-hidden', 'true');
                  return el;
                },
                { side: -1, key: `pb-${b.pos}-${Math.round(b.height)}` },
              ),
            );

            view.dispatch(
              view.state.tr.setMeta(
                key,
                DecorationSet.create(view.state.doc, decos),
              ),
            );
          };

          const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(measure);
          };

          const ro = new ResizeObserver(schedule);
          ro.observe(view.dom);
          schedule();

          return {
            update: schedule,
            destroy: () => ro.disconnect(),
          };
        },
      }),
    ];
  },
});
