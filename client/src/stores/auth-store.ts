import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

// Assume installed: npm i jwt-decode @types/jwt-decode

const ACCESS_TOKEN =
  import.meta.env.VITE_ACCESS_TOKEN_KEY || '__Host-auth-token-v1' // Use env for prod; httpOnly preferred on backend

interface AuthUser {
  _id: string
  name: string
  email: string
  role: string[]
  photo?: string
  bio?: string
  urls?: { label: string; value: string }[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: Partial<AuthUser> | null) => void // Allow partial for updates
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    isAuthenticated: boolean // Computed for easy access
  }
}

// Utility to validate and extract user info from token
const validateToken = (token: string): AuthUser | null => {
  if (!token) return null
  try {
    const decoded: { _id: string; email: string; role: string[]; exp: number } =
      jwtDecode(token)
    if (decoded.exp * 1000 <= Date.now()) return null // Expired
    return {
      _id: decoded._id,
      name: '',
      email: decoded.email,
      role: Array.isArray(decoded.role) ? decoded.role : [decoded.role],
      exp: decoded.exp * 1000,
    }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set, _get) => {
  // Load and validate initial token from cookie
  let initToken = ''
  let initUser: AuthUser | null = null
  const cookieState = getCookie(ACCESS_TOKEN)
  if (cookieState) {
    try {
      initToken = JSON.parse(cookieState)
      initUser = validateToken(initToken)
      if (!initUser) {
        // Invalid/expired - clear immediately
        removeCookie(ACCESS_TOKEN)
        initToken = ''
      }
    } catch {
      removeCookie(ACCESS_TOKEN)
      initToken = ''
    }
  }

  return {
    auth: {
      user: initUser,
      accessToken: initToken,
      isAuthenticated: !!initUser,

      setUser: (userData) =>
        set((state) => {
          const updatedUser = userData
            ? ({ ...state.auth.user, ...userData } as AuthUser)
            : null
          return {
            ...state,
            auth: {
              ...state.auth,
              user: updatedUser,
              isAuthenticated: !!updatedUser,
            },
          }
        }),

      setAccessToken: (accessToken) =>
        set((state) => {
          const user = validateToken(accessToken)
          if (user) {
            // Persist token in cookie; maxAge in seconds
            const maxAgeSeconds = Math.max(
              0,
              Math.floor((user.exp - Date.now()) / 1000)
            )
            setCookie(
              ACCESS_TOKEN,
              JSON.stringify(accessToken),
              maxAgeSeconds || undefined
            )
            return {
              ...state,
              auth: {
                ...state.auth,
                accessToken,
                user,
                isAuthenticated: true,
              },
            }
          } else {
            // Invalid token - don't set
            return state
          }
        }),

      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, accessToken: '', isAuthenticated: false },
          }
        }),

      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              isAuthenticated: false,
            },
          }
        }),
    },
  }
})
