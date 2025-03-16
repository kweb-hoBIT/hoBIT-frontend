import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ImageState {
  images: { [key: string]: string };
}

const initialState: ImageState = {
  images: {},
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.images = action.payload;
    },
  },
});

export const { setImages } = imageSlice.actions;
export const imageReducer = imageSlice.reducer;
