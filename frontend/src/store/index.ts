import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resumeReducer from './slices/resumeSlice';
import recruiterReducer from './slices/recruiterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    recruiter: recruiterReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat((store: any) => (next: any) => (action: any) => {
    const result = next(action);
    const state = store.getState();
    const user = state.auth.user;
    
    // User-specific states
    if (user && user.id && !action.type.startsWith('auth/')) {
      if (user.role === 'STUDENT') {
        localStorage.setItem(`smarthireai_user_${user.id}_resume`, JSON.stringify(state.resume));
      } else if (user.role === 'RECRUITER') {
        localStorage.setItem(`smarthireai_user_${user.id}_recruiter`, JSON.stringify(state.recruiter));
      }
    }
    
    return result;
  })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
