import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const ConfirmDialog = ({
  open,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isPending = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onCancel}
      PaperProps={{
        sx: { borderRadius: 3, p: 1, minWidth: { xs: 300, sm: 400 } }
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined" disabled={isPending} sx={{ borderRadius: 2 }}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={isPending} sx={{ borderRadius: 2, px: 3 }}>
          {isPending ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
