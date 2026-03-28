import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { updateProfile as updateAuthProfile } from './authSlice';

export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (id, { rejectWithValue }) => {
        try {
            const response = await userService.getUserProfile(id);
            return response.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
        }
    }
);

export const followUser = createAsyncThunk(
    'user/followUser',
    async (id, { rejectWithValue }) => {
        try {
            await userService.followUser(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
        }
    }
);

export const unfollowUser = createAsyncThunk(
    'user/unfollowUser',
    async (id, { rejectWithValue }) => {
        try {
            await userService.unfollowUser(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
        }
    }
);

export const searchUsers = createAsyncThunk(
    'user/searchUsers',
    async (q, { rejectWithValue }) => {
        try {
            const response = await userService.searchUsers(q);
            return response.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to search users');
        }
    }
);

const initialState = {
    currentProfile: null,
    searchResults: [],
    isLoading: false,
    isSearchLoading: false,
    error: null,
    followLoading: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.currentProfile = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProfile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateAuthProfile.fulfilled, (state, action) => {
                if (state.currentProfile && state.currentProfile.id === action.payload.id) {
                    state.currentProfile = {
                        ...state.currentProfile,
                        ...action.payload,
                    };
                }
            })
            // Search Users
            .addCase(searchUsers.pending, (state) => {
                state.isSearchLoading = true;
                state.error = null;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.isSearchLoading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.isSearchLoading = false;
                state.error = action.payload;
            })
            .addCase(followUser.pending, (state) => {
                state.followLoading = true;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.followLoading = false;
                if (state.currentProfile && state.currentProfile.id === action.payload) {
                    state.currentProfile.isFollowing = true;
                    state.currentProfile.followerCount += 1;
                }
                // Update search results if relevant
                const searchedUser = state.searchResults.find(u => u.id === action.payload);
                if (searchedUser) {
                    searchedUser.isFollowing = true;
                }
            })
            .addCase(followUser.rejected, (state) => {
                state.followLoading = false;
            })
            .addCase(unfollowUser.pending, (state) => {
                state.followLoading = true;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.followLoading = false;
                if (state.currentProfile && state.currentProfile.id === action.payload) {
                    state.currentProfile.isFollowing = false;
                    state.currentProfile.followerCount = Math.max(0, state.currentProfile.followerCount - 1);
                }
                // Update search results if relevant
                const searchedUser = state.searchResults.find(u => u.id === action.payload);
                if (searchedUser) {
                    searchedUser.isFollowing = false;
                }
            })
            .addCase(unfollowUser.rejected, (state) => {
                state.followLoading = false;
            });
    }
});

export const { clearProfile, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;
