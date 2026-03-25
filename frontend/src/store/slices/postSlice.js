import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await postService.getPosts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeedPosts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await postService.getFeedPosts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feed posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await postService.getPostById(id);
      return response.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(postData);
      return response.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await postService.updatePost(id, postData);
      return response.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await postService.deletePost(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const response = await postService.likePost(id, type);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const fetchTrendingPosts = createAsyncThunk(
  'posts/fetchTrendingPosts',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await postService.getTrendingPosts(limit);
      return response.posts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending posts');
    }
  }
);

const initialState = {
  posts: [],
  feedPosts: [],
  currentPost: null,
  trendingPosts: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {
    category: '',
    type: '',
    search: '',
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        type: '',
        search: '',
        tags: [],
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Feed Posts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts = action.payload.posts || [];
        state.error = null;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false;
        state.posts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost && state.currentPost.id === action.payload.id) {
          state.currentPost = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.posts = state.posts.filter(post => post.id !== action.payload);
        if (state.currentPost && state.currentPost.id === action.payload) {
          state.currentPost = null;
        }
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      // Like/Dislike Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { id, likeCount, dislikeCount } = action.payload;
        
        // Update in posts array
        const post = state.posts.find(p => p.id === id);
        if (post) {
          post.likeCount = likeCount;
          post.dislikeCount = dislikeCount;
        }
        
        // Update in currentPost
        if (state.currentPost && state.currentPost.id === id) {
          state.currentPost.likeCount = likeCount;
          state.currentPost.dislikeCount = dislikeCount;
        }
      })
      // Fetch Trending Posts
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.trendingPosts = action.payload;
      });
  },
});

export const { clearError, clearCurrentPost, setFilters, clearFilters } = postSlice.actions;
export default postSlice.reducer;
