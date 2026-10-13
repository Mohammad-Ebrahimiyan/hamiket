import type { TreeNode } from '../model/tree.types';

/**
 * عملیات Pure و Immutable روی درخت. هیچ وابستگی‌ای به React یا MUI ندارد.
 * قرارداد: اگر عملیات قابل انجام نباشد، همان مرجع ورودی (root) بدون تغییر برگردانده می‌شود.
 */

export function hasChildren(node: TreeNode): boolean {
  return node.children.length > 0;
}

export function findNodeById(root: TreeNode, id: string): TreeNode | null {
  const stack: TreeNode[] = [root];
  while (stack.length > 0) {
    const current = stack.pop() as TreeNode;
    if (current.id === id) return current;
    for (const child of current.children) stack.push(child);
  }
  return null;
}

/** والد مستقیم گره؛ برای ریشه یا گره‌ی ناموجود null. */
export function findParentOf(root: TreeNode, id: string): TreeNode | null {
  const stack: TreeNode[] = [root];
  while (stack.length > 0) {
    const current = stack.pop() as TreeNode;
    for (const child of current.children) {
      if (child.id === id) return current;
      stack.push(child);
    }
  }
  return null;
}

/** آیا `candidateId` در زیرشاخه‌ی (بدون احتساب خودِ گره) `ancestorId` قرار دارد؟ */
export function isDescendant(root: TreeNode, ancestorId: string, candidateId: string): boolean {
  if (ancestorId === candidateId) return false;
  const ancestor = findNodeById(root, ancestorId);
  if (!ancestor) return false;
  return findNodeById(ancestor, candidateId) !== null;
}

/** به‌روزرسانی ساختاری-اشتراکی: فقط مسیر ریشه تا گره‌ی هدف دوباره ساخته می‌شود. */
export function updateNode(
  root: TreeNode,
  id: string,
  updater: (node: TreeNode) => TreeNode,
): TreeNode {
  if (root.id === id) return updater(root);
  let changed = false;
  const children = root.children.map((child) => {
    const next = updateNode(child, id, updater);
    if (next !== child) changed = true;
    return next;
  });
  return changed ? { ...root, children } : root;
}

export function insertChild(root: TreeNode, parentId: string, child: TreeNode): TreeNode {
  return updateNode(root, parentId, (parent) => ({
    ...parent,
    children: [...parent.children, child],
  }));
}

/** حذف گره (و زیرشاخه‌هایش) بر اساس ID. ریشه هرگز حذف نمی‌شود. */
export function removeNode(root: TreeNode, id: string): TreeNode {
  if (root.id === id) return root;
  return removeFromChildren(root, id);
}

function removeFromChildren(node: TreeNode, id: string): TreeNode {
  let changed = false;
  const next: TreeNode[] = [];
  for (const child of node.children) {
    if (child.id === id) {
      changed = true;
      continue;
    }
    const updated = removeFromChildren(child, id);
    if (updated !== child) changed = true;
    next.push(updated);
  }
  return changed ? { ...node, children: next } : node;
}

/**
 * انتقال گره به‌عنوان آخرین فرزند والد جدید.
 * در موارد نامعتبر (گره/مقصد ناموجود، خود گره، ریشه، یا مقصد داخل زیرشاخه‌ی مبدأ) بدون تغییر برمی‌گردد.
 */
export function moveNode(root: TreeNode, nodeId: string, newParentId: string): TreeNode {
  if (nodeId === root.id || nodeId === newParentId) return root;
  const node = findNodeById(root, nodeId);
  const target = findNodeById(root, newParentId);
  if (!node || !target) return root;
  if (isDescendant(root, nodeId, newParentId)) return root;
  return insertChild(removeNode(root, nodeId), newParentId, node);
}

/** Deep copy با حفظ IDها (برای Snapshot داخل Clipboard). */
export function cloneNode(node: TreeNode): TreeNode {
  return {
    id: node.id,
    label: node.label,
    expanded: node.expanded,
    children: node.children.map(cloneNode),
  };
}

/** Deep copy که برای تمام گره‌ها ID جدید می‌سازد؛ هیچ مرجعی با اصل مشترک نیست. */
export function cloneSubtreeWithNewIds(node: TreeNode, generateId: () => string): TreeNode {
  return {
    id: generateId(),
    label: node.label,
    expanded: node.expanded,
    children: node.children.map((child) => cloneSubtreeWithNewIds(child, generateId)),
  };
}

export function collectIds(root: TreeNode): string[] {
  const ids: string[] = [];
  const stack: TreeNode[] = [root];
  while (stack.length > 0) {
    const current = stack.pop() as TreeNode;
    ids.push(current.id);
    for (const child of current.children) stack.push(child);
  }
  return ids;
}
