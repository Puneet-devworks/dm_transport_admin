import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUsersRoute } from "../../utils/apiRoutes";

// Async thunk for fetching initial users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = fetchUsersRoute(page, limit);
      
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch users");
      }

      return {
        users: data.users || [],
        hasMore: data.hasMore || false,
        page: data.page || page,
        limit: data.limit || limit,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch users");
    }
  }
);

// Async thunk for loading more users (pagination)
export const fetchMoreUsers = createAsyncThunk(
  "users/fetchMoreUsers",
  async ({ page, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = fetchUsersRoute(page, limit);
      
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch more users");
      }

      return {
        users: data.users || [],
        hasMore: data.hasMore || false,
        page: data.page || page,
        limit: data.limit || limit,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch more users");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    loadingMore: false,
    error: null,
    lastFetched: null,
    hasMore: false,
    page: 1,
    limit: 10,
  },
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.error = null;
      state.hasMore = false;
      state.page = 1;
    },
    updateUserLastMessage: (state, action) => {
      const { userid, lastMessage, lastChatTime } = action.payload;
      const user = state.users.find((u) => u.userid === userid);
      if (user) {
        user.last_message = lastMessage;
        user.last_chat_time = lastChatTime;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initial fetch
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        // Replace users for initial load
        state.users = action.payload.users;
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Load more users
      .addCase(fetchMoreUsers.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchMoreUsers.fulfilled, (state, action) => {
        state.users = [...state.users, ...action.payload.users];
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.loadingMore = false;
        state.error = null;
      })
      .addCase(fetchMoreUsers.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { clearUsers, updateUserLastMessage } = usersSlice.actions;
export default usersSlice.reducer;

