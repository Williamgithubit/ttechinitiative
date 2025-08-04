import { createSlice } from '@reduxjs/toolkit';

const programsSlice = createSlice({
  name: 'programs',
  initialState: {
    programs: [],
    loading: false,
  },
  reducers: {
    setPrograms: (state, action) => {
      state.programs = action.payload;
      state.loading = false;
    },
    addProgram: (state, action) => {
      state.programs.push(action.payload);
    },
  },
});

export const { setPrograms, addProgram } = programsSlice.actions;
export default programsSlice.reducer;