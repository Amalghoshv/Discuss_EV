import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

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

const initialState = {
    currentProfile: null,
    isLoading: false,
    error: null,
    followLoading: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.currentProfile = null;
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
            .addCase(followUser.pending, (state) => {
                state.followLoading = true;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.followLoading = false;
                if (state.currentProfile && state.currentProfile.id === action.payload) {
                    state.currentProfile.isFollowing = true;
                    state.currentProfile.followerCount += 1;
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
            })
            .addCase(unfollowUser.rejected, (state) => {
                state.followLoading = false;
            });
    }
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
