import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'

interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
  photo?: string
  bio?: string
  urls?: { label: string; value: string }[]
}

interface MeResponse {
  status: string
  data: { user: UserProfile }
}

/** Fetches the current user's profile and syncs it to the auth store. */
export function useCurrentUser() {
  const {
    auth: { isAuthenticated, setUser },
  } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await api.get<MeResponse>('/users/me')
      const user = data.data.user

      // Sync profile fields into auth store
      setUser({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: [user.role],
        photo: user.photo,
        bio: user.bio,
        urls: user.urls,
      })

      return user
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
