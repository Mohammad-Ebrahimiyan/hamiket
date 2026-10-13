'use client';

import { type Dispatch, useContext } from 'react';

import { TreeDispatchContext, TreeStateContext } from '../context/TreeProvider';
import type { TreeAction } from '../model/tree.actions';
import type { TreeState } from '../model/tree.types';

export function useTreeState(): TreeState {
  const state = useContext(TreeStateContext);
  if (!state) throw new Error('useTreeState باید داخل <TreeProvider> استفاده شود.');
  return state;
}

export function useTreeDispatch(): Dispatch<TreeAction> {
  const dispatch = useContext(TreeDispatchContext);
  if (!dispatch) throw new Error('useTreeDispatch باید داخل <TreeProvider> استفاده شود.');
  return dispatch;
}
