import type { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  status: string
  token: string
  data: {
    user: {
      _id: string
      name?: string
      email: string
      role: string | string[] // backend sends string, but your store expects array
      photo?: string
      createdAt?: string
      updatedAt?: string
      __v?: number
    }
  }
  message?: string
}

export function useLogin(redirectTo?: string) {
  const navigate = useNavigate()
  const {
    auth: { setUser, setAccessToken },
  } = useAuthStore()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<LoginResponse>(
        '/users/login',
        credentials
      )
      return data
    },

    onSuccess: (data) => {
      // Extract the nested user
      const user = data.data.user

      setUser({
        _id: user._id,
        email: user.email,
        // Handle role being string vs array
        role: typeof user.role === 'string' ? [user.role] : user.role,
        // If you have real exp from JWT → parse it, otherwise fallback
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })

      setAccessToken(data.token)

      toast.success('Login successful', {
        description: `Welcome back, ${user.email}!`,
      })

      const target = redirectTo || '/dashboard'
      navigate({ to: target, replace: true })
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ??
        error.message ??
        'Login failed. Please check your credentials.'

      toast.error('Login failed', {
        description: message,
      })
    },
  })
}
