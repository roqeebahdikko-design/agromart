import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: []
  },
  reducers: {
    pushNotification: (state, action) => {
      state.items.unshift({
        id: Date.now(),
        read: false,
        ...action.payload
      });
      state.items = state.items.slice(0, 20);
    },
    markAllNotificationsRead: (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        read: true
      }));
    }
  }
});

export const { pushNotification, markAllNotificationsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
