'use client';

import { createContext, type Dispatch, type ReactNode, useReducer } from 'react';

import type { TreeAction } from '../model/tree.actions';
import { createInitialState, createTreeReducer, type IdGenerator } from '../model/tree.reducer';
import type { TreeNode, TreeState } from '../model/tree.types';
import { createId } from '../services/id.service';

export const TreeStateContext = createContext<TreeState | null>(null);
export const TreeDispatchContext = createContext<Dispatch<TreeAction> | null>(null);

interface TreeProviderProps {
  initialTree: TreeNode;
  generateId?: IdGenerator;
  children: ReactNode;
}

export function TreeProvider({ initialTree, generateId = createId, children }: TreeProviderProps) {
  const [state, dispatch] = useReducer(createTreeReducer(generateId), initialTree, createInitialState);

  return (
    <TreeDispatchContext.Provider value={dispatch}>
      <TreeStateContext.Provider value={state}>{children}</TreeStateContext.Provider>
    </TreeDispatchContext.Provider>
  );
}
