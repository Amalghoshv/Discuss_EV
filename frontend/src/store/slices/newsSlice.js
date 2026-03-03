import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Using rss2json to convert Electrek's RSS feed to JSON
const RSS_FEED_URL = 'https://electrek.co/feed/';
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;

export const fetchEVNews = createAsyncThunk(
    'news/fetchEVNews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_URL);
            if (response.data.status === 'ok') {
                return response.data.items;
            }
            return rejectWithValue('Failed to fetch news');
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch news');
        }
    }
);

const initialState = {
    articles: [],
    isLoading: false,
    error: null,
};

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEVNews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEVNews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.articles = action.payload;
            })
            .addCase(fetchEVNews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export default newsSlice.reducer;
