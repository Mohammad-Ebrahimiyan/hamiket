'use client';

import { useCallback, useState } from 'react';

export interface MenuPosition {
  top: number;
  left: number;
}

export interface ContextMenuTarget {
  nodeId: string;
  position: MenuPosition;
}

export function useContextMenu() {
  const [target, setTarget] = useState<ContextMenuTarget | null>(null);

  const open = useCallback((nodeId: string, position: MenuPosition) => {
    setTarget({ nodeId, position });
  }, []);

  const close = useCallback(() => setTarget(null), []);

  return { target, open, close };
}
