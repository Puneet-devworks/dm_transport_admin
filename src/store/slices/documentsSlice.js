import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDocumentsRoute } from "../../utils/apiRoutes";

// Async thunk for fetching initial documents
export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (
    {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
      isSeen = null,
      isFlagged = null,
      category = null,
      filters = [],
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = fetchDocumentsRoute(startDate, endDate, {
        page,
        limit,
        search,
        isSeen,
        isFlagged,
        category,
        filters,
      });

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch documents");
      }

      return {
        documents: data.documents || [],
        hasMore: data.hasMore !== undefined ? data.hasMore : (data.documents?.length || 0) >= limit,
        page: data.page || page,
        limit: data.limit || limit,
        total: data.pagination.totalDocuments || 0,

      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch documents");
    }
  }
);

// Async thunk for loading more documents (pagination)
export const fetchMoreDocuments = createAsyncThunk(
  "documents/fetchMoreDocuments",
  async (
    {
      startDate,
      endDate,
      page,
      limit = 10,
      search = "",
      isSeen = null,
      isFlagged = null,
      category = null,
      filters = [],
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = fetchDocumentsRoute(startDate, endDate, {
        page,
        limit,
        search,
        isSeen,
        isFlagged,
        category,
        filters,
      });

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch more documents");
      }
      
      return {
        documents: data.documents || [],
        hasMore: data.hasMore !== undefined ? data.hasMore : (data.documents?.length || 0) >= limit,
        page: data.page || page,
        limit: data.limit || limit,
       
        total: data.pagination.totalDocuments || 0,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch more documents");
    }
  }
);

const documentsSlice = createSlice({
  name: "documents",
  initialState: {
    documents: [],
    loading: false,
    loadingMore: false,
    error: null,
    lastFetchParams: null,
    lastFetched: null,
    hasMore: false,
    page: 1,
    limit: 10,
    total: 0,
    totalDocuments: 0,
  },
  reducers: {
    clearDocuments: (state) => {
      state.documents = [];
      state.error = null;
      state.hasMore = false;
      state.page = 1;
    },
    markDocumentAsSeen: (state, action) => {
      const document = state.documents.find(
        (doc) => doc.id === action.payload
      );
      if (document) {
        document.seen = true;
      }
    },
    resetPagination: (state) => {
      state.page = 1;
      state.hasMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initial fetch
      .addCase(fetchDocuments.pending, (state, action) => {
        state.loading = true;
        state.loadingMore = false;
        state.error = null;
        state.lastFetchParams = action.meta.arg;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.documents;
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.error = null;
        state.lastFetched = Date.now();
        state.totalDocuments = action.payload.totalDocuments;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Load more
      .addCase(fetchMoreDocuments.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchMoreDocuments.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.documents = [...state.documents, ...action.payload.documents];
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchMoreDocuments.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { clearDocuments, markDocumentAsSeen, resetPagination } = documentsSlice.actions;
export default documentsSlice.reducer;

