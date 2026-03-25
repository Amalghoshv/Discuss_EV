import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, TextField, Button, Typography, Box,
  Select, MenuItem, Chip, Autocomplete, IconButton, useTheme,
} from '@mui/material';
import {
  Close, AddPhotoAlternate, Send, ElectricCar,
  HelpOutline, Article, Forum, NewReleases, RateReview, ChargingStation,
  Build, MemoryOutlined, PolicyOutlined,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../store/slices/postSlice';
import { showSnackbar, closeDialog } from '../../store/slices/uiSlice';

/* ── palette ── */
const G = '#2E7D32';
const GL = '#43A047';
const GP = '#E8F5E9';

/* ── shared field style ── */
const fieldSx = (isLight) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '0.875rem',
    bgcolor: isLight ? '#F7FAF7' : 'rgba(255,255,255,0.04)',
    '& fieldset': { borderColor: isLight ? '#D4E4D4' : 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: GL },
    '&.Mui-focused fieldset': { borderColor: G, borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: G },
  '& .MuiFormHelperText-root': { fontSize: '0.72rem', ml: 0.5 },
});

/* ── post type config ── */
const postTypes = [
  { value: 'discussion', label: 'Discussion', icon: <Forum sx={{ fontSize: 15 }} />, color: GL },
  { value: 'question', label: 'Question', icon: <HelpOutline sx={{ fontSize: 15 }} />, color: '#1E88E5' },
  { value: 'article', label: 'Article', icon: <Article sx={{ fontSize: 15 }} />, color: '#8E24AA' },
  { value: 'news', label: 'News', icon: <NewReleases sx={{ fontSize: 15 }} />, color: '#E53935' },
  { value: 'review', label: 'Review', icon: <RateReview sx={{ fontSize: 15 }} />, color: '#FF8F00' },
];

/* ── category config ── */
const categories = [
  { value: 'general', label: 'General', icon: <ElectricCar sx={{ fontSize: 14 }} /> },
  { value: 'charging-stations', label: 'Charging Stations', icon: <ChargingStation sx={{ fontSize: 14 }} /> },
  { value: 'maintenance', label: 'Maintenance', icon: <Build sx={{ fontSize: 14 }} /> },
  { value: 'technology', label: 'Technology', icon: <MemoryOutlined sx={{ fontSize: 14 }} /> },
  { value: 'news', label: 'News', icon: <NewReleases sx={{ fontSize: 14 }} /> },
  { value: 'policy', label: 'Policy', icon: <PolicyOutlined sx={{ fontSize: 14 }} /> },
  { value: 'reviews', label: 'Reviews', icon: <RateReview sx={{ fontSize: 14 }} /> },
  { value: 'troubleshooting', label: 'Troubleshooting', icon: <HelpOutline sx={{ fontSize: 14 }} /> },
];

const commonTags = [
  'Tesla', 'BMW i3', 'Nissan Leaf', 'Chevrolet Bolt', 'Audi e-tron',
  'Charging', 'Battery', 'Range', 'Performance', 'Maintenance',
  'Government Incentives', 'Infrastructure', 'Sustainability',
  'Home Charging', 'Public Charging', 'Fast Charging', 'Supercharger',
];

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
const CreatePostDialog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const { isCreating } = useSelector((s) => s.posts);
  const { open, type: dlgType } = useSelector((s) => s.ui.dialog);
  const isOpen = open && dlgType === 'createPost';

  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'discussion', category: 'general', title: '', content: '' },
  });

  const titleVal = watch('title', '');
  const contentVal = watch('content', '');

  useEffect(() => {
    if (isOpen) { reset({ type: 'discussion', category: 'general', title: '', content: '' }); setTags([]); setImages([]); }
  }, [isOpen, reset]);

  const handleClose = () => dispatch(closeDialog());

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(createPost({
        ...data,
        tags: tags.map((t) => (typeof t === 'string' ? t : t.name || t.label)),
        images,
      })).unwrap();
      dispatch(showSnackbar({ message: 'Post created!', severity: 'success' }));
      handleClose();
      navigate(`/post/${result.id}`);
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to create post', severity: 'error' }));
    }
  };

  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const r = new FileReader();
      r.onloadend = () => setImages((prev) => [...prev, r.result]);
      r.readAsDataURL(file);
    });
  };

  const border = isLight ? '#DDE8DD' : 'rgba(255,255,255,0.07)';
  const selectedType = watch('type');
  const typeConfig = postTypes.find((t) => t.value === selectedType) || postTypes[0];

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '18px',
          border: `1px solid ${border}`,
          bgcolor: isLight ? '#fff' : '#0F1E12',
          boxShadow: isLight
            ? '0 24px 60px rgba(0,0,0,0.14)'
            : '0 24px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{
        px: 3, pt: 2.5, pb: 2,
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
            background: `linear-gradient(135deg, ${G}, ${GL})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(46,125,50,0.3)',
          }}>
            <ElectricCar sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>Create New Post</Typography>
            <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary' }}>Share your EV experiences with the community</Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            borderRadius: '8px', width: 30, height: 30,
            bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.06)',
            '&:hover': { bgcolor: isLight ? '#E8F5E9' : 'rgba(67,160,71,0.1)' },
          }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box
          component="form"
          id="create-post-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* ── Post type selector ── */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${border}` }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.25 }}>
              Post Type
            </Typography>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {postTypes.map((pt) => {
                    const active = field.value === pt.value;
                    return (
                      <Box
                        key={pt.value}
                        onClick={() => field.onChange(pt.value)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 0.6,
                          px: 1.5, py: 0.6, borderRadius: '20px', cursor: 'pointer',
                          border: '1.5px solid',
                          fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                          transition: 'all 0.15s',
                          bgcolor: active ? `${pt.color}15` : 'transparent',
                          borderColor: active ? pt.color : border,
                          color: active ? pt.color : 'text.secondary',
                          '&:hover': { borderColor: pt.color, color: pt.color, bgcolor: `${pt.color}10` },
                        }}
                      >
                        <Box sx={{ color: 'inherit', display: 'flex' }}>{pt.icon}</Box>
                        <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{pt.label}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            />
          </Box>

          {/* ── Form body ── */}
          <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Category + Title row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' }, gap: 2 }}>
              {/* Category */}
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75 }}>Category</Typography>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      size="small"
                      error={!!errors.category}
                      sx={{
                        borderRadius: '10px', fontSize: '0.84rem',
                        bgcolor: isLight ? '#F7FAF7' : 'rgba(255,255,255,0.04)',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: isLight ? '#D4E4D4' : 'rgba(255,255,255,0.1)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: GL },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: G, borderWidth: '1.5px' },
                      }}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.84rem', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ color: GL, display: 'flex' }}>{c.icon}</Box>
                            {c.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </Box>

              {/* Title */}
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75 }}>
                  Title <span style={{ color: '#EF5350' }}>*</span>
                </Typography>
                <TextField
                  fullWidth size="small"
                  placeholder="Enter a descriptive title…"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 5, message: 'Min 5 characters' },
                    maxLength: { value: 200, message: 'Max 200 characters' },
                  })}
                  error={!!errors.title}
                  helperText={errors.title?.message || `${titleVal.length}/200`}
                  FormHelperTextProps={{ sx: { textAlign: errors.title ? 'left' : 'right', fontSize: '0.68rem' } }}
                  sx={fieldSx(isLight)}
                />
              </Box>
            </Box>

            {/* Content */}
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75 }}>
                Content <span style={{ color: '#EF5350' }}>*</span>
              </Typography>
              <TextField
                fullWidth multiline rows={6}
                placeholder="Share your thoughts, experiences, or questions about electric vehicles…"
                {...register('content', {
                  required: 'Content is required',
                  minLength: { value: 10, message: 'Min 10 characters' },
                  maxLength: { value: 10000, message: 'Max 10,000 characters' },
                })}
                error={!!errors.content}
                helperText={errors.content?.message || `${contentVal.length}/10,000`}
                FormHelperTextProps={{ sx: { textAlign: errors.content ? 'left' : 'right', fontSize: '0.68rem' } }}
                sx={fieldSx(isLight)}
              />
            </Box>

            {/* Images */}
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75 }}>
                Images
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Upload button */}
                <Box
                  component="label"
                  sx={{
                    width: 80, height: 80, borderRadius: '10px', flexShrink: 0,
                    border: `1.5px dashed ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.35)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', gap: 0.4,
                    bgcolor: isLight ? '#F7FAF7' : 'rgba(67,160,71,0.04)',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: isLight ? GP : 'rgba(67,160,71,0.1)', borderColor: GL },
                  }}
                >
                  <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                  <AddPhotoAlternate sx={{ fontSize: 22, color: isLight ? '#A5D6A7' : 'rgba(67,160,71,0.5)' }} />
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600 }}>Add photo</Typography>
                </Box>

                {/* Preview thumbnails */}
                {images.map((img, i) => (
                  <Box key={i} sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                    <Box component="img" src={img} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '10px', border: `1px solid ${border}`, display: 'block' }} />
                    <IconButton
                      size="small"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      sx={{
                        position: 'absolute', top: -7, right: -7,
                        width: 20, height: 20, p: 0,
                        bgcolor: '#EF5350', color: '#fff',
                        border: `2px solid ${isLight ? '#fff' : '#0F1E12'}`,
                        '&:hover': { bgcolor: '#C62828' },
                      }}
                    >
                      <Close sx={{ fontSize: 11 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Tags */}
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75 }}>
                Tags
              </Typography>
              <Autocomplete
                multiple freeSolo
                options={commonTags}
                value={tags}
                onChange={(_, v) => setTags(v)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Box
                      key={index}
                      {...getTagProps({ index })}
                      component="span"
                      sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.4,
                        px: 1, py: 0.3, m: 0.3, borderRadius: '6px',
                        bgcolor: isLight ? GP : 'rgba(67,160,71,0.12)',
                        border: `1px solid ${isLight ? '#A5D6A7' : 'rgba(67,160,71,0.3)'}`,
                        fontSize: '0.75rem', fontWeight: 600, color: GL,
                        cursor: 'default',
                      }}
                    >
                      #{typeof option === 'string' ? option : option.label}
                      <Close
                        sx={{ fontSize: 11, cursor: 'pointer', opacity: 0.7, '&:hover': { opacity: 1 } }}
                        onClick={getTagProps({ index }).onDelete}
                      />
                    </Box>
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={tags.length === 0 ? 'Add tags to help others find your post…' : ''}
                    helperText="Press Enter to add a custom tag"
                    FormHelperTextProps={{ sx: { fontSize: '0.68rem', ml: 0.5 } }}
                    sx={fieldSx(isLight)}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <Box sx={{
        px: 3, py: 2,
        borderTop: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
      }}>
        {/* Type indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, opacity: 0.75 }}>
          <Box sx={{ color: typeConfig.color, display: 'flex' }}>{typeConfig.icon}</Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
            Posting as <span style={{ color: typeConfig.color, fontWeight: 700 }}>{typeConfig.label}</span>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={isCreating}
            sx={{
              borderRadius: '10px', px: 2.5, py: 0.8,
              textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              color: 'text.secondary',
              border: `1px solid ${border}`,
              '&:hover': { bgcolor: isLight ? '#F2F6F2' : 'rgba(255,255,255,0.05)' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-post-form"
            variant="contained"
            disabled={isCreating}
            endIcon={isCreating ? null : <Send sx={{ fontSize: '15px !important' }} />}
            sx={{
              borderRadius: '10px', px: 3, py: 0.8,
              textTransform: 'none', fontWeight: 700, fontSize: '0.82rem',
              background: isCreating ? undefined : `linear-gradient(135deg, ${G}, ${GL})`,
              boxShadow: isCreating ? 'none' : '0 4px 14px rgba(46,125,50,0.3)',
              '&:hover': { boxShadow: '0 6px 18px rgba(46,125,50,0.4)' },
              '&.Mui-disabled': { opacity: 0.5 },
              minWidth: 140,
            }}
          >
            {isCreating ? 'Publishing…' : 'Post Discussion'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CreatePostDialog;