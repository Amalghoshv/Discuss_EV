import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import companyService from '../../services/companyService';

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyService.getCompanies();
      return response.companies;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch companies');
    }
  }
);

export const registerCompany = createAsyncThunk(
  'companies/registerCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await companyService.registerCompany(companyData);
      return response.company;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register company');
    }
  }
);

export const verifyCompany = createAsyncThunk(
  'companies/verifyCompany',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await companyService.verifyCompany(id, status);
      return response.company;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify company');
    }
  }
);

const companySlice = createSlice({
  name: 'companies',
  initialState: {
    companies: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCompanyError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
      })
      .addCase(verifyCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
      });
  }
});

export const { clearCompanyError } = companySlice.actions;
export default companySlice.reducer;
