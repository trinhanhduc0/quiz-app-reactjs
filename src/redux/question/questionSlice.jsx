// src/redux/question/questionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall, apiCallGet } from "~/services/apiCallService";
import API_ENDPOINTS from "~/config/config";

const LINK = API_ENDPOINTS.QUESTIONS;

// Async thunk to fetch questions with pagination

// Async thunk để fetch câu hỏi với pagination
export const fetchQuestions = createAsyncThunk(
  "questions/fetchQuestions",
  async (_, { getState, rejectWithValue }) => {
    const { questionsByPage, page, limit } = getState().questions; // Get current page and limit
    try {
      // Kiểm tra xem đã có câu hỏi cho trang hiện tại chưa
      if (questionsByPage[page]) {
        return { data: [] }; // Nếu đã có câu hỏi cho trang này rồi, không cần fetch
      }

      // Nếu chưa có câu hỏi cho trang này, gọi API
      const endpoint = `${LINK}?page=${page}&limit=${limit}`;
      const response = await apiCallGet(endpoint);
      return { data: response }; // Trả về dữ liệu fetch được
    } catch (error) {
      return rejectWithValue(error.message); // Xử lý lỗi nếu fetch thất bại
    }
  }
);

// Async thunk to add a new question
export const createQuestion = createAsyncThunk(
  "questions/addQuestion",
  async (newQuestion, { rejectWithValue }) => {
    try {
      const response = await apiCall(LINK, "POST", newQuestion);
      return response; // Return the newly created question
    } catch (error) {
      return rejectWithValue(error.message); // Handle errors during creation
    }
  }
);

// Async thunk to update an existing question
export const updateQuestion = createAsyncThunk(
  "questions/updateQuestion",
  async (updatedQuestion, { rejectWithValue }) => {
    try {
      const response = await apiCall(LINK, "PATCH", updatedQuestion);
      return response; // Return the updated question
    } catch (error) {
      return rejectWithValue(error.message); // Handle errors during update
    }
  }
);

// Async thunk to delete a question
export const deleteQuestion = createAsyncThunk(
  "questions/deleteQuestion",
  async (questionId, { rejectWithValue }) => {
    try {
      await apiCall(LINK, "DELETE", { _id: questionId }); // Perform delete request
      return questionId; // Return the deleted question ID
    } catch (error) {
      return rejectWithValue(error.message); // Handle errors during deletion
    }
  }
);

const questionSlice = createSlice({
  name: "questions",
  initialState: {
    questionsByPage: {}, // List of questions
    status: "idle", // idle, loading, succeeded, failed
    page: 0, // Current page for pagination
    limit: 50, // Limit of items per page
    hasMoreQuestions: true, // Track if there are more questions to fetch
    error: null, // Store error message, if any
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
        if (action.payload.data == null || action.payload.data.length === 0) {
          state.hasMoreQuestions = false; // Nếu không có câu hỏi nào, không cần fetch thêm
        } else {
          // Thêm câu hỏi vào trang hiện tại
          const currentPage = state.page;
          state.questionsByPage[currentPage] = action.payload.data;
        }
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        if (state.questionsByPage[0]) {
          state.questionsByPage[0].unshift(action.payload); // Thêm câu hỏi mới vào đầu trang đầu tiên
        } else {
          state.questionsByPage[0] = [action.payload]; // Khởi tạo trang đầu tiên nếu nó chưa tồn tại
        }
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        Object.keys(state.questionsByPage).forEach((pageKey) => {
          state.questionsByPage[pageKey] = state.questionsByPage[pageKey].map(
            (question) =>
              question._id === action.payload._id ? action.payload : question // Cập nhật câu hỏi khi tìm thấy
          );
        });
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        Object.keys(state.questionsByPage).forEach((pageKey) => {
          state.questionsByPage[pageKey] = state.questionsByPage[
            pageKey
          ].filter(
            (question) => question._id !== action.payload // Loại bỏ câu hỏi khi tìm thấy
          );

          // Nếu một trang không còn câu hỏi nào, xóa trang khỏi object
          if (state.questionsByPage[pageKey].length === 0) {
            delete state.questionsByPage[pageKey];
          }
        });
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});
export const { resetQuestions, incrementPage, setHasMoreQuestions } =
  questionSlice.actions;

export default questionSlice.reducer;
