import React, { useState } from 'react';
import {
  Container,
  Paper,
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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../store/slices/postSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCreating } = useSelector((state) => state.posts);
  
  const [tags, setTags] = useState([]);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

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

  const onSubmit = async (data) => {
    try {
      const postData = {
        ...data,
        tags: tags.map(tag => typeof tag === 'string' ? tag : tag.label),
      };
      
      const result = await dispatch(createPost(postData)).unwrap();
      dispatch(showSnackbar({
        message: 'Post created successfully!',
        severity: 'success',
      }));
      navigate(`/post/${result.id}`);
    } catch (error) {
      dispatch(showSnackbar({
        message: error || 'Failed to create post',
        severity: 'error',
      }));
    }
  };

  if (isCreating) {
    return <LoadingSpinner message="Creating your post..." />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create New Post
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Share your EV experiences, ask questions, or start a discussion with the community.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Post Type */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Post Type</InputLabel>
            <Controller
              name="type"
              control={control}
              defaultValue="discussion"
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
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.type.message}
              </Alert>
            )}
          </FormControl>

          {/* Category */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Controller
              name="category"
              control={control}
              defaultValue="general"
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
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.category.message}
              </Alert>
            )}
          </FormControl>

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
          />

          {/* Content */}
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={8}
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

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isCreating}
            >
              Create Post
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePost;
