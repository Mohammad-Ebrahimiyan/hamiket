import {
  createCopyClipboard,
  createCutClipboard,
  sanitizeClipboard,
} from '../services/clipboard.service';
import {
  cloneSubtreeWithNewIds,
  findNodeById,
  findParentOf,
  insertChild,
  moveNode,
  removeNode,
  updateNode,
} from '../services/tree.operations';
import type { TreeAction } from './tree.actions';
import { canAddChild, canCopy, canCut, canDelete, canPaste, validateLabel } from './tree.policies';
import type { Clipboard, NoticeCode, NoticeSeverity, TreeNode, TreeState } from './tree.types';

export type IdGenerator = () => string;

const HISTORY_LIMIT = 50;

export function createInitialState(root: TreeNode): TreeState {
  return { root, clipboard: null, selectedId: null, notice: null, noticeSeq: 0, past: [], future: [] };
}

function notify(
  state: TreeState,
  severity: NoticeSeverity,
  code: NoticeCode,
  label?: string,
): TreeState {
  const id = state.noticeSeq + 1;
  return { ...state, noticeSeq: id, notice: { id, severity, code, label } };
}

const deny = (state: TreeState, code: NoticeCode) => notify(state, 'error', code);

interface CommitPatch {
  root: TreeNode;
  clipboard?: Clipboard;
  selectedId?: string | null;
}

function commit(state: TreeState, { root, clipboard = state.clipboard, selectedId }: CommitPatch) {
  return {
    ...state,
    root,
    clipboard,
    selectedId: selectedId === undefined ? state.selectedId : selectedId,
    past: [...state.past, state.root].slice(-HISTORY_LIMIT),
    future: [],
  };
}

const setExpanded = (root: TreeNode, nodeId: string, expanded: boolean) =>
  updateNode(root, nodeId, (node) => (node.expanded === expanded ? node : { ...node, expanded }));

function restoreSnapshot(state: TreeState, root: TreeNode, history: Partial<TreeState>): TreeState {
  const selectedId = state.selectedId && findNodeById(root, state.selectedId) ? state.selectedId : null;
  return { ...state, ...history, root, clipboard: sanitizeClipboard(root, state.clipboard), selectedId };
}

export function createTreeReducer(generateId: IdGenerator) {
  return function treeReducer(state: TreeState, action: TreeAction): TreeState {
    const { root, clipboard } = state;

    switch (action.type) {
      case 'TOGGLE_NODE':
      case 'SET_EXPANDED': {
        const node = findNodeById(root, action.nodeId);
        if (!node) return deny(state, 'NOT_FOUND');
        const expanded = action.type === 'TOGGLE_NODE' ? !node.expanded : action.expanded;
        const next = setExpanded(root, node.id, expanded);
        return next === root ? state : { ...state, root: next };
      }

      case 'SELECT_NODE': {
        const valid = action.nodeId === null || findNodeById(root, action.nodeId) !== null;
        return valid && action.nodeId !== state.selectedId
          ? { ...state, selectedId: action.nodeId }
          : state;
      }

      case 'CUT_NODE': {
        const decision = canCut(root, action.nodeId);
        if (!decision.allowed) return deny(state, decision.reason);
        const node = findNodeById(root, action.nodeId) as TreeNode;
        return notify({ ...state, clipboard: createCutClipboard(node) }, 'info', 'CUT', node.label);
      }

      case 'COPY_NODE': {
        const decision = canCopy(root, action.nodeId);
        if (!decision.allowed) return deny(state, decision.reason);
        const node = findNodeById(root, action.nodeId) as TreeNode;
        return notify({ ...state, clipboard: createCopyClipboard(node) }, 'info', 'COPIED', node.label);
      }

      case 'PASTE_NODE': {
        const decision = canPaste(root, clipboard, action.targetId);
        if (!decision.allowed) return deny(state, decision.reason);
        if (!clipboard) return deny(state, 'CLIPBOARD_EMPTY');

        if (clipboard.type === 'copy') {
          const copy = cloneSubtreeWithNewIds(clipboard.node, generateId);
          const next = setExpanded(insertChild(root, action.targetId, copy), action.targetId, true);
          return notify(commit(state, { root: next, selectedId: action.targetId }), 'success', 'PASTED', copy.label);
        }

        const moved = moveNode(root, clipboard.nodeId, action.targetId);
        if (moved === root) return deny(state, 'SOURCE_MISSING');
        return notify(
          commit(state, {
            root: setExpanded(moved, action.targetId, true),
            clipboard: null,
            selectedId: action.targetId,
          }),
          'success',
          'MOVED',
          clipboard.snapshot.label,
        );
      }

      case 'DELETE_NODE': {
        const decision = canDelete(root, action.nodeId);
        if (!decision.allowed) return deny(state, decision.reason);
        const node = findNodeById(root, action.nodeId) as TreeNode;
        const wasInClipboard = clipboard?.type === 'cut' && clipboard.nodeId === node.id;
        const next = commit(state, {
          root: removeNode(root, node.id),
          clipboard: wasInClipboard ? null : clipboard,
          selectedId: findParentOf(root, node.id)?.id ?? null,
        });
        return notify(next, 'success', wasInClipboard ? 'DELETED_CLIPBOARD_CLEARED' : 'DELETED', node.label);
      }

      case 'ADD_CHILD': {
        const decision = canAddChild(root, action.parentId);
        if (!decision.allowed) return deny(state, decision.reason);
        const validation = validateLabel(action.label);
        if (!validation.ok) return deny(state, validation.error);
        const child: TreeNode = { id: generateId(), label: validation.label, expanded: false, children: [] };
        const next = setExpanded(insertChild(root, action.parentId, child), action.parentId, true);
        return notify(commit(state, { root: next, selectedId: action.parentId }), 'success', 'ADDED', child.label);
      }

      case 'UNDO': {
        const previous = state.past.at(-1);
        if (!previous) return state;
        const history = { past: state.past.slice(0, -1), future: [root, ...state.future] };
        return notify(restoreSnapshot(state, previous, history), 'info', 'UNDONE');
      }

      case 'REDO': {
        const [next, ...rest] = state.future;
        if (!next) return state;
        const history = { past: [...state.past, root].slice(-HISTORY_LIMIT), future: rest };
        return notify(restoreSnapshot(state, next, history), 'info', 'REDONE');
      }

      case 'DISMISS_NOTICE':
        return state.notice ? { ...state, notice: null } : state;
    }
  };
}
