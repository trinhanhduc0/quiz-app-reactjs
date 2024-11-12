import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall, apiCallGet } from "~/services/apiCallService";
import API_ENDPOINTS from "~/config/config";

const LINK = API_ENDPOINTS.QUESTIONS;

export const fetchQuestions = createAsyncThunk(
  "questions/fetchQuestions",
  async ({ navigate }, { getState, rejectWithValue }) => {
    const { questionsByPage, page, limit } = getState().questions;
    try {
      if (questionsByPage[page]) {
        return { data: [] };
      }
      const endpoint = `${LINK}?page=${page}&limit=${limit}`;
      const response = await apiCallGet(endpoint, navigate);
      return { data: response };
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch questions");
    }
  }
);

export const createQuestion = createAsyncThunk(
  "questions/addQuestion",
  async (newQuestion, { rejectWithValue }) => {
    try {
      const response = await apiCall(LINK, "POST", newQuestion);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to create question");
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "questions/updateQuestion",
  async (updatedQuestion, { rejectWithValue }) => {
    try {
      const response = await apiCall(LINK, "PATCH", updatedQuestion);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to update question");
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/deleteQuestion",
  async (questionId, { rejectWithValue }) => {
    try {
      await apiCall(LINK, "DELETE", { _id: questionId });
      return questionId;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to delete question");
    }
  }
);

const questionSlice = createSlice({
  name: "questions",
  initialState: {
    questionsByPage: {},
    status: "idle",
    page: 0,
    limit: 50,
    hasMoreQuestions: true,
    error: null,
  },
  reducers: {
    resetQuestions: (state) => {
      state.questionsByPage = {};
      state.page = 0;
      state.hasMoreQuestions = true;
      state.status = "idle";
      state.error = null;
    },
    incrementPage: (state) => {
      if (state.hasMoreQuestions) {
        state.page += 1;
      }
    },
    setHasMoreQuestions: (state, action) => {
      state.hasMoreQuestions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        const currentPage = state.page;
        const newQuestions = action.payload.data;

        if (!newQuestions || newQuestions.length === 0) {
          state.hasMoreQuestions = false;
        } else {
          state.questionsByPage[currentPage] = newQuestions;
        }
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        if (state.questionsByPage[0]) {
          state.questionsByPage[0].unshift(action.payload);
        } else {
          state.questionsByPage[0] = [action.payload];
        }
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        Object.keys(state.questionsByPage).forEach((pageKey) => {
          state.questionsByPage[pageKey] = state.questionsByPage[pageKey].map(
            (question) =>
              question._id === action.payload._id ? action.payload : question
          );
        });
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        Object.keys(state.questionsByPage).forEach((pageKey) => {
          state.questionsByPage[pageKey] = state.questionsByPage[
            pageKey
          ].filter((question) => question._id !== action.payload);
          if (state.questionsByPage[pageKey].length === 0) {
            delete state.questionsByPage[pageKey];
          }
        });
      })
      .addMatcher(
        (action) =>
          ["createQuestion", "updateQuestion", "deleteQuestion"].some((type) =>
            action.type.endsWith("rejected")
          ),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { resetQuestions, incrementPage, setHasMoreQuestions } =
  questionSlice.actions;

export default questionSlice.reducer;
