import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

// Thunks
export const bootstrapAdmin = createAsyncThunk(
  'admin/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.bootstrapAdmin();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bootstrap admin');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllUsers();
      return response.users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all users');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await adminService.toggleUserStatus(id, isActive);
      return response.user; // Return updated user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
    }
  }
);

const initialState = {
  users: [],
  isLoadingUsers: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.error = action.payload;
      })
      // Toggle User Status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
