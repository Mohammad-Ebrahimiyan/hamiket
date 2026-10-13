import { canAddChild, canCopy, canCut, canDelete, canPaste } from './tree.policies';
import type { Clipboard, DenyReason, MenuActionKey, PolicyDecision, TreeNode } from './tree.types';

export interface VisibleEntry {
  readonly id: string;
  readonly parentId: string | null;
}

export function selectVisibleEntries(root: TreeNode): VisibleEntry[] {
  const entries: VisibleEntry[] = [];
  const walk = (node: TreeNode, parentId: string | null) => {
    entries.push({ id: node.id, parentId });
    if (node.expanded) node.children.forEach((child) => walk(child, node.id));
  };
  walk(root, null);
  return entries;
}

export interface MenuItemModel {
  readonly key: MenuActionKey;
  readonly disabledReason?: DenyReason;
}

export function selectMenuItems(
  root: TreeNode,
  clipboard: Clipboard,
  nodeId: string,
): MenuItemModel[] {
  const decisions: Record<MenuActionKey, PolicyDecision> = {
    cut: canCut(root, nodeId),
    copy: canCopy(root, nodeId),
    paste: canPaste(root, clipboard, nodeId),
    delete: canDelete(root, nodeId),
    addChild: canAddChild(root, nodeId),
  };
  return (Object.keys(decisions) as MenuActionKey[]).map((key) => {
    const decision = decisions[key];
    return decision.allowed ? { key } : { key, disabledReason: decision.reason };
  });
}

export function selectCutPendingId(clipboard: Clipboard): string | null {
  return clipboard?.type === 'cut' ? clipboard.nodeId : null;
}
