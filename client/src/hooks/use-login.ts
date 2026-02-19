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

interface Url {
  label: string
  value: string
  _id: string
}

interface LoginResponse {
  status: string
  token: string
  data: {
    user: {
      _id: string
      name?: string
      email: string
      role: string
      photo?: string
      urls: Url[]
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

      console.log(user)

      setAccessToken(data.token)

      setUser({
        _id: user._id,
        name: user.name ?? '',
        email: user.email,
        role: user.role,
        photo: user.photo,
        urls: user.urls,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })

      toast.success('Login successful', {
        description: `Welcome back, ${user.name || user.email}!`,
      })

      const target = redirectTo || '/companies'
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
