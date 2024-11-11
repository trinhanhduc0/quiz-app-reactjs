import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_ENDPOINTS from "~/config/config";
import { apiCall, apiCallGet } from "~/services/apiCallService"; // Your API call service

const LINK = API_ENDPOINTS.CLASSES;

// Thunks
export const fetchClasses = createAsyncThunk(
  "classes/fetchClasses",
  async () => {
    const response = await apiCallGet(LINK);
    return response;
  }
);

export const deleteClass = createAsyncThunk(
  "classes/deleteClass",
  async ({ _id }) => {
    return await apiCall(LINK, "DELETE", { _id });
  }
);

export const saveClass = createAsyncThunk(
  "classes/saveClass",
  async ({ values }) => {
    return await apiCall(LINK, "PATCH", values);
  }
);

export const createClass = createAsyncThunk(
  "classes/createClass",
  async ({ values }) => {
    return await apiCall(LINK, "POST", values);
  }
);
export const createCode = createAsyncThunk(
  "classes/createCode",
  async (values) => {
    try {
      // Truyền trực tiếp object, không cần JSON.stringify ở đây
      let response = await apiCall(
        LINK + "/codeclass",
        "POST",
        values
        // Truyền object trực tiếp
      );
      return response;
    } catch (error) {
      console.error("Error generating code:", error);
      throw error;
    }
  }
);

const classSlice = createSlice({
  name: "classes",
  initialState: {
    allClass: [],
    status: "idle", // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload === null) {
          state.allClass = [];
        } else {
          state.allClass = action.payload.data || action.payload;
        }
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        if (action.payload) {
          state.allClass.push(action.payload); // Ensure action.payload is valid
        }
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        const { _id } = action.meta.arg;
        state.allClass = state.allClass.filter((cls) => cls._id !== _id);
      })
      .addCase(saveClass.fulfilled, (state, action) => {
        const { _id } = action.payload;
        console.log("payload: ", action.payload);
        state.allClass = state.allClass.map((cls) =>
          cls._id === _id ? action.payload : cls
        );
        console.log("state.allClass", state.allClass);
      })
      .addCase(createCode.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = "New code";
        }
      })
      .addCase(createCode.rejected, (state, action) => {
        if (action.payload) {
          state.status = "failed generate code";
          state.error = action.error.message;
        }
      });
  },
});

export default classSlice.reducer;
