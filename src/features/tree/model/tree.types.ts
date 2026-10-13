export interface TreeNode {
  readonly id: string;
  readonly label: string;
  readonly expanded: boolean;
  readonly children: readonly TreeNode[];
}

export interface CopyClipboard {
  readonly type: 'copy';
  readonly node: TreeNode;
}

export interface CutClipboard {
  readonly type: 'cut';
  readonly nodeId: string;
  readonly snapshot: TreeNode;
}

export type Clipboard = CopyClipboard | CutClipboard | null;

export type MenuActionKey = 'cut' | 'copy' | 'paste' | 'delete' | 'addChild';


export type DenyReason =
  | 'NOT_FOUND'
  | 'IS_ROOT'
  | 'HAS_CHILDREN'
  | 'CLIPBOARD_EMPTY'
  | 'SELF_TARGET'
  | 'CYCLE'
  | 'SOURCE_MISSING'
  | 'SOURCE_HAS_CHILDREN';

export type PolicyDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: DenyReason };

export type LabelError = 'EMPTY' | 'TOO_LONG';

export type LabelValidation =
  | { readonly ok: true; readonly label: string }
  | { readonly ok: false; readonly error: LabelError };

export type NoticeSeverity = 'success' | 'info' | 'error';

export type NoticeCode =
  | 'CUT'
  | 'COPIED'
  | 'PASTED'
  | 'MOVED'
  | 'DELETED'
  | 'DELETED_CLIPBOARD_CLEARED'
  | 'ADDED'
  | 'UNDONE'
  | 'REDONE'
  | DenyReason
  | LabelError;

export interface Notice {
  readonly id: number;
  readonly severity: NoticeSeverity;
  readonly code: NoticeCode;
  readonly label?: string;
}

export interface TreeState {
  readonly root: TreeNode;
  readonly clipboard: Clipboard;
  readonly selectedId: string | null;
  readonly notice: Notice | null;
  readonly noticeSeq: number;
  readonly past: readonly TreeNode[];
  readonly future: readonly TreeNode[];
}
