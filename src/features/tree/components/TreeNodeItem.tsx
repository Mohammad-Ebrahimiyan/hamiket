'use client';

import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import MoreVert from '@mui/icons-material/MoreVert';
import { alpha, Box, Button, IconButton, Typography } from '@mui/material';
import { styled, type SxProps, type Theme } from '@mui/material/styles';
import type { MouseEvent } from 'react';

import { messages } from '../messages';
import type { TreeNode } from '../model/tree.types';
import { hasChildren } from '../services/tree.operations';
import { treeConnectorStyles } from './treeConnectors';
import { NODE_HEIGHT, nodeWidth } from './TreeLayout';

export interface TreeNodeHandlers {
  onToggle: (nodeId: string) => void;
  onContextMenu: (nodeId: string, event: MouseEvent<HTMLElement>) => void;
  onAdd: (node: TreeNode) => void;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  posInSet: number;
  setSize: number;
  selectedId: string | null;
  cutNodeId: string | null;
  tabbableId: string;
  handlers: TreeNodeHandlers;
}

const itemSx: SxProps<Theme> = (theme) => ({
  display: { xs: 'block', md: 'flex' },
  alignItems: 'flex-start',
  outline: 'none',
  '&:focus-visible > [data-tree-box]': {
    outline: `3px solid ${theme.palette.info.main}`,
    outlineOffset: '2px',
  },
});

const getBoxSx =
  (level: number): SxProps<Theme> =>
  (theme) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
    width: { xs: '100%', md: nodeWidth(level) },
    minHeight: NODE_HEIGHT,
    height: { xs: 'auto', md: NODE_HEIGHT },
    py: 0.75,
    px: 2,
    border: '1px solid',
    borderColor: 'primary.light',
    borderRadius: 1.5,
    bgcolor: 'background.paper',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 120ms ease, box-shadow 120ms ease, opacity 120ms ease',
    '@media (hover: hover)': { '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } },
    '&[data-root], &[data-selected]': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '@media (hover: hover)': { '&:hover': { bgcolor: 'primary.dark' } },
    },
    '&[data-selected]': {
      borderColor: 'primary.dark',
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
    '&[data-cut-pending]': { opacity: 0.65, borderStyle: 'dashed' },
  });

const moreSx: SxProps<Theme> = (theme) => ({
  display: 'none',
  color: 'inherit',
  marginInlineEnd: -1,
  [theme.breakpoints.down('md')]: { display: 'inline-flex' },
  '@media (hover: none)': { display: 'inline-flex' },
});

const getAddButtonSx = (level: number): SxProps<Theme> => ({
  flexShrink: 0,
  width: { xs: '100%', md: nodeWidth(level) },
  height: NODE_HEIGHT,
  justifyContent: 'flex-start',
  borderStyle: 'dashed',
  borderColor: 'primary.light',
  color: 'primary.main',
  '&:hover': { borderStyle: 'dashed' },
});

const Group = styled('ul')(({ theme }) =>
  treeConnectorStyles({
    color: theme.palette.grey[500],
    rtl: theme.direction === 'rtl',
    desktopQuery: theme.breakpoints.up('md'),
    mobileQuery: theme.breakpoints.down('md'),
  }),
);

export function TreeNodeItem({
  node,
  level,
  posInSet,
  setSize,
  selectedId,
  cutNodeId,
  tabbableId,
  handlers,
}: TreeNodeItemProps) {
  const isRoot = level === 1;
  const isCut = node.id === cutNodeId;

  return (
    <Box
      component="li"
      role="treeitem"
      aria-label={node.label}
      aria-level={level}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      aria-expanded={node.expanded}
      aria-selected={node.id === selectedId}
      data-node-id={node.id}
      tabIndex={node.id === tabbableId ? 0 : -1}
      sx={itemSx}
    >
      <Box
        data-tree-box=""
        data-root={isRoot ? '' : undefined}
        data-selected={node.id === selectedId ? '' : undefined}
        data-cut-pending={isCut ? '' : undefined}
        onClick={() => handlers.onToggle(node.id)}
        onContextMenu={(event) => handlers.onContextMenu(node.id, event)}
        title={node.label}
        sx={getBoxSx(level)}
      >
        {hasChildren(node) &&
          (node.expanded ? (
            <KeyboardArrowDown fontSize="small" aria-hidden />
          ) : (
            <KeyboardArrowLeft fontSize="small" aria-hidden />
          ))}
        <Typography
          component="span"
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            fontWeight: isRoot ? 700 : 500,
            overflowWrap: 'anywhere',
            overflow: { md: 'hidden' },
            textOverflow: { md: 'ellipsis' },
            whiteSpace: { md: 'nowrap' },
          }}
        >
          {node.label}
        </Typography>
        {isCut && (
          <Typography component="span" variant="caption">
            {messages.tree.cutPending}
          </Typography>
        )}
        <IconButton
          size="small"
          tabIndex={-1}
          aria-label={messages.tree.moreActions(node.label)}
          onClick={(event) => handlers.onContextMenu(node.id, event)}
          sx={moreSx}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>

      {node.expanded && (
        <Group role="group">
          {node.children.map((child, index) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              posInSet={index + 1}
              setSize={node.children.length}
              selectedId={selectedId}
              cutNodeId={cutNodeId}
              tabbableId={tabbableId}
              handlers={handlers}
            />
          ))}
          <li role="none">
            <Button
              variant="outlined"
              size="small"
              tabIndex={-1}
              startIcon={<AddCircleOutlined />}
              aria-label={messages.tree.addChildTo(node.label)}
              onClick={() => handlers.onAdd(node)}
              sx={getAddButtonSx(level + 1)}
            >
              {messages.tree.add}
            </Button>
          </li>
        </Group>
      )}
    </Box>
  );
}
