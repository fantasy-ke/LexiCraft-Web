import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    isAuthenticated: !!localStorage.getItem('token')
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    setToken(token: string, refreshToken?: string) {
      this.token = token;
      this.isAuthenticated = true;
      localStorage.setItem('token', token);
      
      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    setUserInfo(userInfo: any) {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    logout() {
      this.token = '';
      this.refreshToken = '';
      this.userInfo = {};
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    }
  }
}); 