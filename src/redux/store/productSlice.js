// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios";

// // const MAPPING_BASE_URL = "http://localhost:5000/api/v1/order-id-mapping";
// const MAPPING_BASE_URL = "https://raw-material-backend.onrender.com/api/v1/order-id-mapping";

// // ✅ FETCH EXISTING MAPPED PRODUCTS
// export const fetchProducts = createAsyncThunk(
//     "products/fetchProducts",
//     async (_, thunkAPI) => {
//         try {
//             const response = await axios.get(`${MAPPING_BASE_URL}/get-mapped-style-id?style_number=${styleNumber}`);
//             return response.data.data.data;
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.message);
//         }
//     }
// );

// // ✅ UPSERT RACK SPACE (POST)
// export const upsertRackSpace = createAsyncThunk(
//     "products/upsertRackSpace",
//     async (payload, thunkAPI) => {
//         try {
//             const response = await axios.post(
//                 `${MAPPING_BASE_URL}/upsertRackSpace`,
//                 payload
//             );
//             return response.data;
//         } catch (error) {
//             return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
//         }
//     }
// );



// // ✅ SLICE
// const productsSlice = createSlice({
//     name: "products",
//     initialState: {
//         products: [],
//         loading: false,
//         error: null,
//         upsertStatus: "idle",
//         upsertMessage: "",

//     },
//     reducers: {},
//     extraReducers: (builder) => {
//         // --- Fetch Products ---
//         builder
//             .addCase(fetchProducts.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchProducts.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.products = action.payload;
//             })
//             .addCase(fetchProducts.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });

//         // --- Upsert Rack Space ---
//         builder
//             .addCase(upsertRackSpace.pending, (state) => {
//                 state.upsertStatus = "pending";
//                 state.upsertMessage = "";
//             })
//             .addCase(upsertRackSpace.fulfilled, (state, action) => {
//                 state.upsertStatus = "succeeded";
//                 state.upsertMessage = "Rack Space upserted successfully!";
//             })
//             .addCase(upsertRackSpace.rejected, (state, action) => {
//                 state.upsertStatus = "failed";
//                 state.upsertMessage = action.payload || "Failed to upsert Rack Space";
//             });



//     },
// });

// export default productsSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const MAPPING_BASE_URL = "https://raw-material-backend.onrender.com/api/v1/order-id-mapping";

// ✅ FETCH EXISTING MAPPED PRODUCTS WITH SEARCH
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (searchParams = {}, thunkAPI) => {
        try {
            const { styleNumber = "", rackSpace = "", page = 1, limit = 10 } = searchParams;

            // Query parameters build करें
            const params = new URLSearchParams();

            if (styleNumber) params.append('style_number', styleNumber);
            if (rackSpace) params.append('rack_space', rackSpace);
            if (page) params.append('page', page);
            if (limit) params.append('limit', limit);

            const queryString = params.toString();
            const url = queryString
                ? `${MAPPING_BASE_URL}/get-mapped-style-id?${queryString}`
                : `${MAPPING_BASE_URL}/get-mapped-style-id`;

            const response = await axios.get(url);

            // Check if data is empty
            if (!response.data.data.data || response.data.data.data.length === 0) {
                return thunkAPI.rejectWithValue("No products found for your search");
            }

            return {
                products: response.data.data.data,
                totalRecords: response.data.data?.total_records || 0,
                currentPage: page,
                searchParams: { styleNumber, rackSpace }
            };
        } catch (error) {
            // Check if it's a 404 or no data error
            if (error.response && error.response.status === 404) {
                return thunkAPI.rejectWithValue("No products found for your search");
            }
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "Something went wrong");
        }
    }
);

// ✅ UPSERT RACK SPACE (POST)
export const upsertRackSpace = createAsyncThunk(
    "products/upsertRackSpace",
    async (payload, thunkAPI) => {
        try {
            const response = await axios.post(
                `${MAPPING_BASE_URL}/upsertRackSpace`,
                payload
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// ✅ SLICE
const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        filteredProducts: [],
        loading: false,
        error: null,
        searchMessage: null, // for "no data found" messages
        upsertStatus: "idle",
        upsertMessage: "",
        currentSearchParams: {},
        pagination: {
            currentPage: 1,
            totalRecords: 0,
            totalPages: 0,
            limit: 50
        }
    },
    reducers: {
        // Add clearError reducer
        clearError: (state) => {
            state.error = null;
            state.searchMessage = null;
        },
        // Add clearSearch reducer
        clearSearch: (state) => {
            state.searchMessage = null;
            state.error = null;
            state.currentSearchParams = {};
        },
        // Optional: add resetProducts reducer
        resetProducts: (state) => {
            state.products = [];
            state.filteredProducts = [];
            state.error = null;
            state.searchMessage = null;
        }
    },
    extraReducers: (builder) => {
        // --- Fetch Products ---
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.searchMessage = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.filteredProducts = action.payload.products;
                state.currentSearchParams = action.payload.searchParams;
                state.searchMessage = null;
                state.error = null;

                // Pagination update
                state.pagination = {
                    ...state.pagination,
                    totalRecords: action.payload.totalRecords,
                    totalPages: Math.ceil(action.payload.totalRecords / state.pagination.limit),
                    currentPage: action.payload.currentPage
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;

                // Check if it's a "no data found" message
                if (action.payload === "No products found for your search") {
                    state.searchMessage = action.payload;
                    state.error = null;
                    state.products = [];
                    state.filteredProducts = [];
                    state.pagination.totalRecords = 0;
                } else {
                    state.error = action.payload;
                    state.searchMessage = null;
                }
            });

        // --- Upsert Rack Space ---
        builder
            .addCase(upsertRackSpace.pending, (state) => {
                state.upsertStatus = "pending";
                state.upsertMessage = "";
            })
            .addCase(upsertRackSpace.fulfilled, (state, action) => {
                state.upsertStatus = "succeeded";
                state.upsertMessage = "Rack Space upserted successfully!";
            })
            .addCase(upsertRackSpace.rejected, (state, action) => {
                state.upsertStatus = "failed";
                state.upsertMessage = action.payload || "Failed to upsert Rack Space";
            });
    },
});

// ✅ ALL EXPORTS - सभी actions export करें
export const { clearError, clearSearch, resetProducts } = productsSlice.actions;
export default productsSlice.reducer;