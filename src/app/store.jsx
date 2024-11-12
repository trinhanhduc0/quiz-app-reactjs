// store.jsx
import { configureStore } from "@reduxjs/toolkit";
import classReducer from "~/redux/class/classSlice";
import testReducer from "~/redux/test/testSlice";
import questionReducer from "~/redux/question/questionSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
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
