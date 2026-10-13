'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useId, useState } from 'react';

import { messages, noticeText } from '../messages';
import { validateLabel } from '../model/tree.policies';
import type { LabelError } from '../model/tree.types';

interface AddChildDialogProps {
  open: boolean;
  parentLabel: string;
  onSubmit: (label: string) => void;
  onCancel: () => void;
  /** بعد از پایان انیمیشن بسته‌شدن؛ برای بازگرداندن Focus. */
  onExited?: () => void;
}

/** برای ریست شدن ورودی، والد این کامپوننت را با key متفاوت در هر بار باز شدن mount می‌کند. */
export function AddChildDialog({ open, parentLabel, onSubmit, onCancel, onExited }: AddChildDialogProps) {
  const titleId = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<LabelError | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateLabel(value);
    if (result.ok) onSubmit(result.label);
    else setError(result.error);
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      slotProps={{ transition: { onExited } }}
    >
   
      <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>
        <DialogTitle id={titleId}>{messages.addChild.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {messages.addChild.parentHint(parentLabel)}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label={messages.addChild.fieldLabel}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            error={error !== null}
            helperText={error ? noticeText(error) : messages.addChild.helper}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCancel}>{messages.addChild.cancel}</Button>
          <Button type="submit" variant="contained">
            {messages.addChild.submit}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
