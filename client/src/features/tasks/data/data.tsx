import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  Circle,
  CheckCircle2,
  Timer,
} from 'lucide-react'

export const statuses = [
  {
    label: 'Todo',
    value: 'Todo' as const,
    icon: Circle,
  },
  {
    label: 'In Progress',
    value: 'In Progress' as const,
    icon: Timer,
  },
  {
    label: 'Done',
    value: 'Done' as const,
    icon: CheckCircle2,
  },
]

export const priorities = [
  {
    label: 'Low',
    value: 'Low' as const,
    icon: ArrowDown,
  },
  {
    label: 'Medium',
    value: 'Medium' as const,
    icon: ArrowRight,
  },
  {
    label: 'High',
    value: 'High' as const,
    icon: ArrowUp,
  },
  {
    label: 'Urgent',
    value: 'Urgent' as const,
    icon: AlertTriangle,
  },
]
