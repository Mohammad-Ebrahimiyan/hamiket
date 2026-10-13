import { findNodeById, hasChildren, isDescendant } from '../services/tree.operations';
import type {
  Clipboard,
  DenyReason,
  LabelValidation,
  PolicyDecision,
  TreeNode,
} from './tree.types';

export const MAX_LABEL_LENGTH = 80;

const ALLOW: PolicyDecision = { allowed: true };
const deny = (reason: DenyReason): PolicyDecision => ({ allowed: false, reason });

export function canCut(root: TreeNode, nodeId: string): PolicyDecision {
  const node = findNodeById(root, nodeId);
  if (!node) return deny('NOT_FOUND');
  if (node.id === root.id) return deny('IS_ROOT');
  if (hasChildren(node)) return deny('HAS_CHILDREN');
  return ALLOW;
}

export function canCopy(root: TreeNode, nodeId: string): PolicyDecision {
  return findNodeById(root, nodeId) ? ALLOW : deny('NOT_FOUND');
}

export function canDelete(root: TreeNode, nodeId: string): PolicyDecision {
  const node = findNodeById(root, nodeId);
  if (!node) return deny('NOT_FOUND');
  if (node.id === root.id) return deny('IS_ROOT');
  if (hasChildren(node)) return deny('HAS_CHILDREN');
  return ALLOW;
}

export function canAddChild(root: TreeNode, parentId: string): PolicyDecision {
  return findNodeById(root, parentId) ? ALLOW : deny('NOT_FOUND');
}

export function canPaste(root: TreeNode, clipboard: Clipboard, targetId: string): PolicyDecision {
  if (!findNodeById(root, targetId)) return deny('NOT_FOUND');
  if (!clipboard) return deny('CLIPBOARD_EMPTY');
  if (clipboard.type === 'copy') return ALLOW;

  const source = findNodeById(root, clipboard.nodeId);
  if (!source) return deny('SOURCE_MISSING');
  if (source.id === targetId) return deny('SELF_TARGET');
  if (isDescendant(root, source.id, targetId)) return deny('CYCLE');
  if (hasChildren(source)) return deny('SOURCE_HAS_CHILDREN');
  return ALLOW;
}

export function validateLabel(raw: string): LabelValidation {
  const label = raw.trim();
  if (label.length === 0) return { ok: false, error: 'EMPTY' };
  if (label.length > MAX_LABEL_LENGTH) return { ok: false, error: 'TOO_LONG' };
  return { ok: true, label };
}
