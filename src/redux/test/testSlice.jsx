import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_ENDPOINTS from "~/config/config";
import TokenService from "~/services/TokenService";
import { apiCall, apiCallGet } from "~/services/apiCallService";

const LINK = API_ENDPOINTS.TESTS;

// Define the async thunk
export const fetchTests = createAsyncThunk("tests/fetchTests", async ({ navigate }) => {
  const response = await apiCallGet(API_ENDPOINTS.TESTS, navigate);
  return response;
});

export const deleteTest = createAsyncThunk(
  "tests/deleteTest",
  async ({ _id }) => {
    return apiCall(LINK, "DELETE", { _id });
  }
);

export const saveTest = createAsyncThunk(
  "tests/saveTest",
  async ({ values }) => {
    return apiCall(LINK, "PATCH", values);
  }
);

export const createTest = createAsyncThunk(
  "tests/createTest",
  async ({ values }) => {
    return apiCall(LINK, "POST", values);
  }
);

const testSlice = createSlice({
  name: "tests",
  initialState: {
    allTests: [],
    status: "idle", // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload == null) {
          state.allTests = [];
        } else {
          state.allTests = action.payload || action.payload.data || [];
        }
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        if (action.payload) {
          state.allTests.push(action.payload); // Ensure action.payload is valid
        }
      })
      .addCase(saveTest.fulfilled, (state, action) => {
        const { _id } = action.payload;
        state.allTests = state.allTests.map((test) =>
          test._id === _id ? action.payload : test
        );
      })
      .addCase(deleteTest.fulfilled, (state, action) => {
        const { _id } = action.meta.arg;
        state.allTests = state.allTests.filter((test) => test._id !== _id);
      });
  },
});

export default testSlice.reducer;
