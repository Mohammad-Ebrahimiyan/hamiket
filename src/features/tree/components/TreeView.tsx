'use client';

import Redo from '@mui/icons-material/Redo';
import Undo from '@mui/icons-material/Undo';
import {
  Alert,
  Box,
  Chip,
  Container,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { type FocusEvent, type KeyboardEvent, useRef, useState } from 'react';

import { findTreeItemElement } from '@/shared/utils/dom';

import { useContextMenu } from '../hooks/useContextMenu';
import { useTreeDispatch, useTreeState } from '../hooks/useTree';
import { formatNotice, messages } from '../messages';
import { treeActions } from '../model/tree.actions';
import { resolveKeyboardIntent } from '../model/tree.keyboard';
import { selectCutPendingId, selectMenuItems, selectVisibleEntries } from '../model/tree.selectors';
import type { MenuActionKey } from '../model/tree.types';
import { findNodeById } from '../services/tree.operations';
import { AddChildDialog } from './AddChildDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { TreeContextMenu } from './TreeContextMenu';
import { type TreeNodeHandlers, TreeNodeItem } from './TreeNodeItem';

interface DialogState {
  kind: 'add' | 'delete';
  nodeId: string;
  nodeLabel: string;
  open: boolean;
  session: number;
}

export function TreeView() {
  const { root, clipboard, selectedId, notice, past, future } = useTreeState();
  const dispatch = useTreeDispatch();
  const isRtl = useTheme().direction === 'rtl';
  const menu = useContextMenu();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const treeRef = useRef<HTMLUListElement>(null);

  const entries = selectVisibleEntries(root);
  const tabbableId = entries.find((entry) => entry.id === selectedId)?.id ?? root.id;
  const menuNode = menu.target ? findNodeById(root, menu.target.nodeId) : null;

  const focusNode = (nodeId: string) => findTreeItemElement(treeRef.current, nodeId)?.focus();
  const restoreFocus = () => focusNode(selectedId ?? root.id);

  const openDialog = (kind: DialogState['kind'], nodeId: string, nodeLabel: string) =>
    setDialog((previous) => ({ kind, nodeId, nodeLabel, open: true, session: (previous?.session ?? 0) + 1 }));
  const closeDialog = () => setDialog((previous) => previous && { ...previous, open: false });

  const handlers: TreeNodeHandlers = {
    onToggle: (nodeId) => dispatch(treeActions.toggle(nodeId)),
    onContextMenu: (nodeId, event) => {
      event.preventDefault();
      event.stopPropagation();
      focusNode(nodeId);
      menu.open(nodeId, { top: event.clientY, left: event.clientX });
    },
    onAdd: (node) => openDialog('add', node.id, node.label),
  };

  const handleMenuSelect = (key: MenuActionKey) => {
    if (!menuNode) return;
    const { id, label } = menuNode;
    menu.close();
    if (key === 'delete' || key === 'addChild') {
      openDialog(key === 'delete' ? 'delete' : 'add', id, label);
    } else {
      dispatch(treeActions[key](id));
    }
  };

  const handleFocus = ({ target }: FocusEvent<HTMLElement>) => {
    if (target.getAttribute('role') === 'treeitem' && target.dataset.nodeId) {
      dispatch(treeActions.select(target.dataset.nodeId));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const item = event.target as HTMLElement;
    const nodeId = item.dataset.nodeId;
    const node = item.getAttribute('role') === 'treeitem' && nodeId ? findNodeById(root, nodeId) : null;
    if (!node) return;

    const intent = resolveKeyboardIntent({ key: event.key, shiftKey: event.shiftKey, isRtl, node, entries });
    if (!intent) return;
    event.preventDefault();
    event.stopPropagation();

    switch (intent.type) {
      case 'focus':
        return focusNode(intent.nodeId);
      case 'toggle':
        return dispatch(treeActions.toggle(node.id));
      case 'setExpanded':
        return dispatch(treeActions.setExpanded(node.id, intent.expanded));
      case 'openMenu': {
        const box = item.querySelector('[data-tree-box]')?.getBoundingClientRect();
        return menu.open(node.id, { top: box?.bottom ?? 0, left: box ? box.left + box.width / 2 : 0 });
      }
    }
  };

  const clipboardLabel =
    clipboard &&
    (clipboard.type === 'copy'
      ? messages.toolbar.clipboardCopy(clipboard.node.label)
      : messages.toolbar.clipboardCut(clipboard.snapshot.label));

  return (
    <Container maxWidth={false} sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            {messages.app.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {messages.app.subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, maxWidth: '100%' }}>
          {clipboardLabel && <Chip size="small" color="primary" variant="outlined" label={clipboardLabel} />}
          <Tooltip title={messages.toolbar.undo}>
            <span>
              <IconButton
                aria-label={messages.toolbar.undo}
                disabled={past.length === 0}
                onClick={() => dispatch(treeActions.undo())}
              >
                <Undo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={messages.toolbar.redo}>
            <span>
              <IconButton
                aria-label={messages.toolbar.redo}
                disabled={future.length === 0}
                onClick={() => dispatch(treeActions.redo())}
              >
                <Redo />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2, md: 3 }, overflowX: 'auto' }}>
        <Box
          component="ul"
          ref={treeRef}
          role="tree"
          aria-label={messages.tree.ariaLabel}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          sx={{ listStyle: 'none', m: 0, p: 0, width: { xs: '100%', md: 'max-content' }, minWidth: '100%' }}
        >
          <TreeNodeItem
            node={root}
            level={1}
            posInSet={1}
            setSize={1}
            selectedId={selectedId}
            cutNodeId={selectCutPendingId(clipboard)}
            tabbableId={tabbableId}
            handlers={handlers}
          />
        </Box>
        {root.children.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {messages.tree.empty}
          </Typography>
        )}
      </Paper>

      <TreeContextMenu
        open={menuNode !== null}
        position={menu.target?.position ?? null}
        ariaLabel={menuNode ? messages.menu.ariaLabel(menuNode.label) : ''}
        items={menuNode ? selectMenuItems(root, clipboard, menuNode.id) : []}
        onSelect={handleMenuSelect}
        onClose={menu.close}
      />

      <AddChildDialog
        key={`add-${dialog?.session ?? 0}`}
        open={dialog?.kind === 'add' && dialog.open}
        parentLabel={dialog?.nodeLabel ?? ''}
        onSubmit={(label) => {
          if (dialog) dispatch(treeActions.addChild(dialog.nodeId, label));
          closeDialog();
        }}
        onCancel={closeDialog}
        onExited={restoreFocus}
      />

      <DeleteConfirmDialog
        open={dialog?.kind === 'delete' && dialog.open}
        nodeLabel={dialog?.nodeLabel ?? ''}
        onConfirm={() => {
          if (dialog) dispatch(treeActions.remove(dialog.nodeId));
          closeDialog();
        }}
        onCancel={closeDialog}
        onExited={restoreFocus}
      />

      {notice && (
        <Snackbar
          key={notice.id}
          open
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onClose={(_event, reason) => {
            if (reason !== 'clickaway') dispatch(treeActions.dismissNotice());
          }}
        >
          <Alert
            severity={notice.severity}
            variant="filled"
            onClose={() => dispatch(treeActions.dismissNotice())}
            sx={{ width: '100%' }}
          >
            {formatNotice(notice)}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}
