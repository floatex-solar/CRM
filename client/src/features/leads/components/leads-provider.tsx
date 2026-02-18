import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Lead } from '../data/schema'

type LeadsDialogType = 'add' | 'edit' | 'delete'

type LeadsContextType = {
  open: LeadsDialogType | null
  setOpen: (str: LeadsDialogType | null) => void
  currentRow: Lead | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Lead | null>>
}

const LeadsContext = React.createContext<LeadsContextType | null>(null)

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<LeadsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Lead | null>(null)

  return (
    <LeadsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </LeadsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLeads = () => {
  const context = React.useContext(LeadsContext)

  if (!context) {
    throw new Error('useLeads has to be used within <LeadsProvider>')
  }

  return context
}
