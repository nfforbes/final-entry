import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode } from '@/lib/theme';

interface ThemeState {
  mode: ThemeMode;
  accentColor: string;
  isLoaded: boolean;
}

const initialState: ThemeState = {
  mode: 'dark',
  accentColor: '#C6F135',
  isLoaded: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    fetchThemeSettings(state) {
      state.isLoaded = false;
    },
    setThemeSettings(
      state,
      action: PayloadAction<{ mode: ThemeMode; accentColor: string }>
    ) {
      state.mode = action.payload.mode;
      state.accentColor = action.payload.accentColor;
      state.isLoaded = true;
    },
    toggleMode(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
    setAccentColor(state, action: PayloadAction<string>) {
      state.accentColor = action.payload;
    },
  },
});

export const {
  fetchThemeSettings,
  setThemeSettings,
  toggleMode,
  setAccentColor,
} = themeSlice.actions;

export default themeSlice.reducer;
