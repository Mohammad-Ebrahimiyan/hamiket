export type TreeAction =
  | { type: 'TOGGLE_NODE'; nodeId: string }
  | { type: 'SET_EXPANDED'; nodeId: string; expanded: boolean }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'CUT_NODE'; nodeId: string }
  | { type: 'COPY_NODE'; nodeId: string }
  | { type: 'PASTE_NODE'; targetId: string }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'ADD_CHILD'; parentId: string; label: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'DISMISS_NOTICE' };

export const treeActions = {
  toggle: (nodeId: string): TreeAction => ({ type: 'TOGGLE_NODE', nodeId }),
  setExpanded: (nodeId: string, expanded: boolean): TreeAction => ({
    type: 'SET_EXPANDED',
    nodeId,
    expanded,
  }),
  select: (nodeId: string | null): TreeAction => ({ type: 'SELECT_NODE', nodeId }),
  cut: (nodeId: string): TreeAction => ({ type: 'CUT_NODE', nodeId }),
  copy: (nodeId: string): TreeAction => ({ type: 'COPY_NODE', nodeId }),
  paste: (targetId: string): TreeAction => ({ type: 'PASTE_NODE', targetId }),
  remove: (nodeId: string): TreeAction => ({ type: 'DELETE_NODE', nodeId }),
  addChild: (parentId: string, label: string): TreeAction => ({
    type: 'ADD_CHILD',
    parentId,
    label,
  }),
  undo: (): TreeAction => ({ type: 'UNDO' }),
  redo: (): TreeAction => ({ type: 'REDO' }),
  dismissNotice: (): TreeAction => ({ type: 'DISMISS_NOTICE' }),
};
