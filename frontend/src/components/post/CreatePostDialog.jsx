import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../store/slices/postSlice';
import { showSnackbar, closeDialog } from '../../store/slices/uiSlice';

const CreatePostDialog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCreating } = useSelector((state) => state.posts);
  const { open, type } = useSelector((state) => state.ui.dialog);
  const isOpen = open && type === 'createPost';

  const [tags, setTags] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'discussion',
      category: 'general',
      title: '',
      content: '',
    }
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'discussion',
        category: 'general',
        title: '',
        content: '',
      });
      setTags([]);
    }
  }, [isOpen, reset]);

  const categories = [
    { value: 'charging-stations', label: 'Charging Stations' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'technology', label: 'Technology' },
    { value: 'news', label: 'News' },
    { value: 'policy', label: 'Policy' },
    { value: 'reviews', label: 'Reviews' },
    { value: 'general', label: 'General' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
  ];

  const postTypes = [
    { value: 'question', label: 'Question' },
    { value: 'article', label: 'Article' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'news', label: 'News' },
    { value: 'review', label: 'Review' },
  ];

  const commonTags = [
    'Tesla', 'BMW i3', 'Nissan Leaf', 'Chevrolet Bolt', 'Audi e-tron',
    'Charging', 'Battery', 'Range', 'Performance', 'Maintenance',
    'Government Incentives', 'Infrastructure', 'Sustainability',
    'Electric Grid', 'Solar', 'Home Charging', 'Public Charging',
    'Fast Charging', 'Level 2', 'DC Fast', 'Supercharger',
  ];

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const onSubmit = async (data) => {
    try {
      const postData = {
        ...data,
        tags: tags.map(tag => typeof tag === 'string' ? tag : tag.name || tag.label),
      };

      const result = await dispatch(createPost(postData)).unwrap();
      dispatch(showSnackbar({
        message: 'Post created successfully!',
        severity: 'success',
      }));
      handleClose();
      navigate(`/post/${result.id}`);
    } catch (error) {
      dispatch(showSnackbar({
        message: error || 'Failed to create post',
        severity: 'error',
      }));
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Create New Post
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Share your EV experiences, ask questions, or start a discussion.
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, borderBottom: 'none' }}>
        <Box component="form" id="create-post-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* Post Type */}
            <FormControl fullWidth margin="normal" sx={{ mt: 0 }}>
              <InputLabel>Post Type</InputLabel>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Post type is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Post Type"
                    error={!!errors.type}
                  >
                    {postTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.type && (
                <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                  {errors.type.message}
                </Alert>
              )}
            </FormControl>

            {/* Category */}
            <FormControl fullWidth margin="normal" sx={{ mt: 0 }}>
              <InputLabel>Category</InputLabel>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Category"
                    error={!!errors.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.category && (
                <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                  {errors.category.message}
                </Alert>
              )}
            </FormControl>
          </Box>

          {/* Title */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Post Title"
            placeholder="Enter a descriptive title for your post"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 5,
                message: 'Title must be at least 5 characters',
              },
              maxLength: {
                value: 200,
                message: 'Title must be less than 200 characters',
              },
            })}
            error={!!errors.title}
            helperText={errors.title?.message}
            sx={{ mb: 2 }}
          />

          {/* Content */}
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={6}
            label="Post Content"
            placeholder="Share your thoughts, experiences, or questions about electric vehicles..."
            {...register('content', {
              required: 'Content is required',
              minLength: {
                value: 10,
                message: 'Content must be at least 10 characters',
              },
              maxLength: {
                value: 10000,
                message: 'Content must be less than 10000 characters',
              },
            })}
            error={!!errors.content}
            helperText={errors.content?.message}
            sx={{ mb: 2 }}
          />

          {/* Tags */}
          <Autocomplete
            multiple
            freeSolo
            options={commonTags}
            value={tags}
            onChange={(event, newValue) => {
              setTags(newValue);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={typeof option === 'string' ? option : option.label}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                margin="normal"
                label="Tags"
                placeholder="Add tags to help others find your post"
                helperText="Press Enter to add custom tags"
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={isCreating} size="large" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="create-post-form" 
          variant="contained" 
          disabled={isCreating} 
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
        >
          {isCreating ? 'Creating...' : 'Post Discussion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog;
