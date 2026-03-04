import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";

interface InventoryState {
    inventoryList: GET_ALL_INVENTORY[];
    loading: boolean;
    error: string | null;
}

const initialState: InventoryState = {
    inventoryList: [],
    loading: false,
    error: null,
};

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        setInventoryList: (state, action: PayloadAction<GET_ALL_INVENTORY[]>) => {
            state.inventoryList = action.payload;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setInventoryList, setLoading, setError } = inventorySlice.actions;

export default inventorySlice.reducer;
