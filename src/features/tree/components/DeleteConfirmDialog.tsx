'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useId } from 'react';

import { messages } from '../messages';

interface DeleteConfirmDialogProps {
  open: boolean;
  nodeLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  onExited?: () => void;
}

export function DeleteConfirmDialog({
  open,
  nodeLabel,
  onConfirm,
  onCancel,
  onExited,
}: DeleteConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{ transition: { onExited } }}
    >
      <DialogTitle id={titleId}>{messages.delete.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId}>{messages.delete.body(nodeLabel)}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button autoFocus onClick={onCancel}>
          {messages.delete.cancel}
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          {messages.delete.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
