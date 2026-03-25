import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createComment } from '../../store/slices/commentSlice';
import { showSnackbar, closeDialog } from '../../store/slices/uiSlice';
import { fetchPostById } from '../../store/slices/postSlice';

const CreateCommentDialog = () => {
  const dispatch = useDispatch();
  const { open, type, data } = useSelector((state) => state.ui.dialog);
  const { isCreating } = useSelector((state) => state.comments);
  const isOpen = open && type === 'createComment';
  const postId = data?.postId;
  const parentId = data?.parentId;
  const isReply = !!parentId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { content: '' } });

  useEffect(() => {
    if (isOpen) reset({ content: '' });
  }, [isOpen, reset]);

  const handleClose = () => dispatch(closeDialog());

  const onSubmit = async ({ content }) => {
    try {
      await dispatch(createComment({ postId, content, parentId })).unwrap();
      dispatch(showSnackbar({ message: isReply ? 'Reply added!' : 'Comment added!', severity: 'success' }));
      // Refresh the post so commentCount and replyCount update
      if (postId) dispatch(fetchPostById(postId));
      handleClose();
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to add comment', severity: 'error' }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {isReply ? 'Reply to Comment' : 'Add a Comment'}
        </Typography>
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, borderBottom: 'none' }}>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          label="Your comment"
          placeholder="Share your thoughts..."
          {...register('content', {
            required: 'Comment cannot be empty',
            minLength: { value: 1, message: 'Comment cannot be empty' },
            maxLength: { value: 2000, message: 'Comment must be under 2000 characters' },
          })}
          error={!!errors.content}
          helperText={errors.content?.message}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={isCreating} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isCreating}
          sx={{ borderRadius: 2, px: 4 }}
        >
          {isCreating ? 'Posting...' : 'Post Comment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCommentDialog;
