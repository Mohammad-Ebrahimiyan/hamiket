import type { Clipboard, CopyClipboard, CutClipboard, TreeNode } from '../model/tree.types';
import { cloneNode, findNodeById } from './tree.operations';

export function createCopyClipboard(node: TreeNode): CopyClipboard {
  return { type: 'copy', node: cloneNode(node) };
}

export function createCutClipboard(node: TreeNode): CutClipboard {
  return { type: 'cut', nodeId: node.id, snapshot: cloneNode(node) };
}

export function sanitizeClipboard(root: TreeNode, clipboard: Clipboard): Clipboard {
  if (clipboard?.type === 'cut' && !findNodeById(root, clipboard.nodeId)) return null;
  return clipboard;
}
