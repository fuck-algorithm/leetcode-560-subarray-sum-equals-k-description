import { configureStore } from '@reduxjs/toolkit';
import subarraySumReducer from './subarraySumSlice';

export const store = configureStore({
  reducer: {
    subarraySum: subarraySumReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serializability checks
        ignoredPaths: ['subarraySum.animationState.hashMap.hashMap'],
        // Ignore these action types
        ignoredActions: ['subarraySum/updateState', 'subarraySum/stepForward'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
