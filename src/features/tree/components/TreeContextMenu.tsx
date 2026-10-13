'use client';

import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentPaste from '@mui/icons-material/ContentPaste';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import type { MouseEvent, ReactElement } from 'react';

import type { MenuPosition } from '../hooks/useContextMenu';
import { messages, noticeText } from '../messages';
import type { MenuItemModel } from '../model/tree.selectors';
import type { MenuActionKey } from '../model/tree.types';

interface TreeContextMenuProps {
  open: boolean;
  position: MenuPosition | null;
  ariaLabel: string;
  items: readonly MenuItemModel[];
  onSelect: (key: MenuActionKey) => void;
  onClose: () => void;
}

const ICONS: Record<MenuActionKey, ReactElement> = {
  cut: <ContentCut fontSize="small" />,
  copy: <ContentCopy fontSize="small" />,
  paste: <ContentPaste fontSize="small" />,
  delete: <DeleteOutlined fontSize="small" />,
  addChild: <AddCircleOutlined fontSize="small" />,
};


export function TreeContextMenu({ open, position, ariaLabel, items, onSelect, onClose }: TreeContextMenuProps) {
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={position ?? undefined}
      // کلیک راست روی پس‌زمینه‌ی منو، منو را می‌بندد و منوی مرورگر باز نمی‌شود.
      onContextMenu={(event: MouseEvent) => {
        event.preventDefault();
        onClose();
      }}
      slotProps={{ list: { 'aria-label': ariaLabel, dense: true } }}
    >
      {items.map(({ key, disabledReason }) => (
        <MenuItem
          key={key}
          disabled={disabledReason !== undefined}
          onClick={() => onSelect(key)}
          sx={{ minHeight: 44, '&.Mui-disabled': { opacity: 0.75 } }}
        >
          <ListItemIcon>{ICONS[key]}</ListItemIcon>
          <ListItemText
            primary={messages.menu.items[key]}
            secondary={disabledReason && noticeText(disabledReason)}
            slotProps={{ secondary: { sx: { whiteSpace: 'normal', maxWidth: 'min(240px, 70vw)' } } }}
          />
        </MenuItem>
      ))}
    </Menu>
  );
}