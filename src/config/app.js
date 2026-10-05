export const APP_NAME = import.meta.env.VITE_APP_TITLE || 'Musiiik'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  LIBRARY: '/library',
  SETTINGS: '/settings',
}
