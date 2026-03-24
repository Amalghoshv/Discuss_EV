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

export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getReports();
      return response.reports;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

export const resolveReport = createAsyncThunk(
  'admin/resolveReport',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminService.resolveReport(id, status);
      return response.report;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve report');
    }
  }
);

export const submitReport = createAsyncThunk(
  'admin/submitReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await adminService.submitReport(reportData);
      return response.report;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit report');
    }
  }
);

const initialState = {
  users: [],
  reports: [],
  isLoadingUsers: false,
  isLoadingReports: false,
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
      })
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.isLoadingReports = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoadingReports = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoadingReports = false;
      })
      // Resolve Report
      .addCase(resolveReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
