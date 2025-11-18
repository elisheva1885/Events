import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/type';
import api from '../services/axios';

interface AuthState {
  token: string | null;
  user:User|null,
  loading:boolean,
  error:string | null
}

const initialState: AuthState = {
  token: localStorage.getItem('token') || null,
  user:null,
  loading:false,
  error:null
  
};
export const fetchUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/users/me");
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch user");
  }
})






const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload||'Failed to fetch user';
      })
},
});

export const { setToken, setUser, clearToken } = authSlice.actions;
export default authSlice.reducer;
