import { configureStore } from "@reduxjs/toolkit";
import inventoryReducer from "./inventory-slice";

export const store = configureStore({
    reducer: {
        inventory: inventoryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
