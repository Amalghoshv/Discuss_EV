import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import commentReducer from './slices/commentSlice';
import notificationReducer from './slices/notificationSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import newsReducer from './slices/newsSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    comments: commentReducer,
    notifications: notificationReducer,
    user: userReducer,
    ui: uiReducer,
    news: newsReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'ui/showSnackbar', 'auth/register/rejected', 'auth/login/rejected'],
        ignoredPaths: ['ui.snackbar.message', 'auth.error'],
      },
    }),
});
