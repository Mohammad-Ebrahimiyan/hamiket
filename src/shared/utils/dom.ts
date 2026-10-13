export function findTreeItemElement(container: HTMLElement | null, nodeId: string): HTMLElement | null {
  if (!container) return null;
  const items = container.querySelectorAll<HTMLElement>('[role="treeitem"]');
  for (const item of items) {
    if (item.dataset.nodeId === nodeId) return item;
  }
  return null;
}
