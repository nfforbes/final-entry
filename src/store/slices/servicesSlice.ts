import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ServiceItem {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  icon: string;
  image: string;
  priceRange: { min: number; max: number };
}

interface ServicesState {
  items: ServiceItem[];
  selected: ServiceItem | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  selected: null,
  status: 'idle',
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    fetchServices(state) {
      state.status = 'loading';
    },
    fetchServicesSuccess(state, action: PayloadAction<ServiceItem[]>) {
      state.status = 'success';
      state.items = action.payload;
    },
    fetchServicesFailure(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    selectService(state, action: PayloadAction<ServiceItem>) {
      state.selected = action.payload;
    },
  },
});

export const {
  fetchServices,
  fetchServicesSuccess,
  fetchServicesFailure,
  selectService,
} = servicesSlice.actions;

export default servicesSlice.reducer;
