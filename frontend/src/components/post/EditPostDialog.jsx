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
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updatePost } from '../../store/slices/postSlice';
import { showSnackbar, closeDialog } from '../../store/slices/uiSlice';

const EditPostDialog = () => {
  const dispatch = useDispatch();
  const { isUpdating } = useSelector((state) => state.posts);
  const { open, type, data } = useSelector((state) => state.ui.dialog);
  const isOpen = open && type === 'editPost';
  const post = data;

  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);

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

  // Reset/Hydrate form when dialog opens
  useEffect(() => {
    if (isOpen && post) {
      reset({
        type: post.type || 'discussion',
        category: post.category || 'general',
        title: post.title || '',
        content: post.content || '',
      });
      // Extract names from tag array of objects
      if (post.tagList && post.tagList.length > 0) {
        setTags(post.tagList.map(t => t.name));
      } else {
        setTags([]);
      }
      setImages(post.images || []);
    }
  }, [isOpen, post, reset]);

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
  ];

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const onSubmit = async (formData) => {
    try {
      const postData = {
        ...formData,
        tags: tags.map(tag => typeof tag === 'string' ? tag : tag.name || tag.label),
        images: images,
      };

      await dispatch(updatePost({ id: post.id, postData })).unwrap();
      dispatch(showSnackbar({
        message: 'Post updated successfully!',
        severity: 'success',
      }));
      handleClose();
    } catch (error) {
      dispatch(showSnackbar({
        message: error || 'Failed to update post',
        severity: 'error',
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
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
            Edit Post
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update your EV experiences, questions, or discussion.
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
        <Box component="form" id="edit-post-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            </FormControl>
          </Box>

          {/* Title */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Post Title"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
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
            {...register('content', {
              required: 'Content is required',
              minLength: { value: 10, message: 'Content must be at least 10 characters' },
            })}
            error={!!errors.content}
            helperText={errors.content?.message}
            sx={{ mb: 2 }}
          />

          {/* Image Attachments */}
          <Box sx={{ mb: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              sx={{ borderRadius: 2 }}
            >
              Add Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            
            {images.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                {images.map((img, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={img}
                      sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                      onClick={() => removeImage(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

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
                placeholder="Press Enter to add custom tags"
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={isUpdating} size="large" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="edit-post-form" 
          variant="contained" 
          disabled={isUpdating} 
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
