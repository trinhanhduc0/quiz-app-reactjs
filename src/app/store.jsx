//store.jsx
import { configureStore } from "@reduxjs/toolkit";
import classReducer from "~/redux/class/classSlice"; // Import your class reducer
import testReducer from "~/redux/test/testSlice"; // Import your test reducer
import questionReducer from "~/redux/question/questionSlice"; // Import your test reducer
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from "redux-persist/lib/storage"; // default is localStorage

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage, // default is localStorage
};
// Persisted reducer for questions slice
const persistedQuestionReducer = persistReducer(persistConfig, questionReducer);

const store = configureStore({
  reducer: {
    classes: classReducer,
    tests: testReducer,
    questions: persistedQuestionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
const persistor = persistStore(store);

export { store, persistor };
