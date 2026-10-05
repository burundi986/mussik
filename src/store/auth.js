import { create } from 'zustand'
import * as authService from '../api/services/auth'

export const useAuthStore = create((set) => ({
  user: authService.getSession(),
  error: null,
  loading: false,

  async login(credentials) {
    set({ loading: true, error: null })
    try {
      const user = await authService.login(credentials)
      set({ user, loading: false, error: null })
      return { ok: true, user }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { ok: false, error: error.message }
    }
  },

  async signup(details) {
    set({ loading: true, error: null })
    try {
      const user = await authService.register(details)
      set({ user, loading: false, error: null })
      return { ok: true, user }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { ok: false, error: error.message }
    }
  },

  logout() {
    authService.logout()
    set({ user: null, error: null })
  },

  clearError() {
    set({ error: null })
  },
}))