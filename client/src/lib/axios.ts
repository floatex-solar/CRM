import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/stores/auth-store'

// Assume installed: npm i jwt-decode @types/jwt-decode

// Utility to check if token is valid (not expired)
const isTokenValid = (token: string): boolean => {
  if (!token) return false
  try {
    const decoded: { exp: number } = jwtDecode(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables cookies if backend sets httpOnly; useful for refresh tokens
})

// Request interceptor - attach token only if valid
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const {
      auth: { accessToken },
    } = useAuthStore.getState()
    if (accessToken && isTokenValid(accessToken) && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token invalid/expired - logout and clear
      useAuthStore.getState().auth.reset()
      // Optional: redirect to login (use router if available, e.g., navigate('/login'))
      // window.location.href = '/login';
    }
    return Promise.reject(error)
  }
)

export default api
