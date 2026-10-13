import type { VisibleEntry } from './tree.selectors';
import type { TreeNode } from './tree.types';

export type KeyboardIntent =
  | { type: 'focus'; nodeId: string }
  | { type: 'toggle' }
  | { type: 'setExpanded'; expanded: boolean }
  | { type: 'openMenu' };

export interface KeyboardInput {
  key: string;
  shiftKey: boolean;
  isRtl: boolean;
  node: TreeNode;
  entries: readonly VisibleEntry[];
}

export function resolveKeyboardIntent(input: KeyboardInput): KeyboardIntent | null {
  const { key, shiftKey, isRtl, node, entries } = input;
  const index = entries.findIndex((entry) => entry.id === node.id);
  if (index < 0) return null;
  const entry = entries[index] as VisibleEntry;

  const expandKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
  const collapseKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

  if ((shiftKey && key === 'F10') || key === 'ContextMenu') return { type: 'openMenu' };

  switch (key) {
    case 'ArrowDown': {
      const next = entries[index + 1];
      return next ? { type: 'focus', nodeId: next.id } : null;
    }
    case 'ArrowUp': {
      const previous = entries[index - 1];
      return previous ? { type: 'focus', nodeId: previous.id } : null;
    }
    case 'Home':
      return { type: 'focus', nodeId: (entries[0] as VisibleEntry).id };
    case 'End':
      return { type: 'focus', nodeId: (entries[entries.length - 1] as VisibleEntry).id };
    case 'Enter':
    case ' ':
      return { type: 'toggle' };
    case expandKey: {
      if (!node.expanded) return { type: 'setExpanded', expanded: true };
      const firstChild = node.children[0];
      return firstChild ? { type: 'focus', nodeId: firstChild.id } : null;
    }
    case collapseKey: {
      if (node.expanded) return { type: 'setExpanded', expanded: false };
      return entry.parentId ? { type: 'focus', nodeId: entry.parentId } : null;
    }
    default:
      return null;
  }
}
