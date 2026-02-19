import { Shield, UserCheck } from 'lucide-react'

export const roles = [
  {
    label: 'Admin',
    value: 'admin',
    icon: Shield,
  },
  {
    label: 'User',
    value: 'user',
    icon: UserCheck,
  },
] as const
