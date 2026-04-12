import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface QuoteFormData {
  service: string;
  urgency: string;
  parish: string;
  community: string;
  address: string;
  propertyType: string;
  propertySize: string;
  notes: string;
  name: string;
  phone: string;
  email: string;
  [key: string]: string;
}

interface QuoteState {
  currentStep: number;
  formData: Partial<QuoteFormData>;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  quoteId: string | null;
}

const initialState: QuoteState = {
  currentStep: 0,
  formData: {},
  submitting: false,
  submitted: false,
  error: null,
  quoteId: null,
};

const quoteSlice = createSlice({
  name: 'quote',
  initialState,
  reducers: {
    nextStep(state) {
      if (state.currentStep < 3) state.currentStep += 1;
    },
    prevStep(state) {
      if (state.currentStep > 0) state.currentStep -= 1;
    },
    updateFormData(state, action: PayloadAction<Partial<QuoteFormData>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    submitQuoteStart(state) {
      state.submitting = true;
      state.error = null;
    },
    submitQuoteSuccess(state, action: PayloadAction<string>) {
      state.submitting = false;
      state.submitted = true;
      state.quoteId = action.payload;
    },
    submitQuoteFailure(state, action: PayloadAction<string>) {
      state.submitting = false;
      state.error = action.payload;
    },
    resetQuote() {
      return initialState;
    },
  },
});

export const {
  nextStep,
  prevStep,
  updateFormData,
  submitQuoteStart,
  submitQuoteSuccess,
  submitQuoteFailure,
  resetQuote,
} = quoteSlice.actions;

export default quoteSlice.reducer;
