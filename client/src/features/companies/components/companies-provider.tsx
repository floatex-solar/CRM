import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Company } from '../data/schema'

type CompaniesDialogType = 'add' | 'edit' | 'delete'

type CompaniesContextType = {
  open: CompaniesDialogType | null
  setOpen: (str: CompaniesDialogType | null) => void
  currentRow: Company | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Company | null>>
}

const CompaniesContext = React.createContext<CompaniesContextType | null>(null)

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CompaniesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Company | null>(null)

  return (
    <CompaniesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CompaniesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCompanies = () => {
  const context = React.useContext(CompaniesContext)

  if (!context) {
    throw new Error('useCompanies has to be used within <CompaniesProvider>')
  }

  return context
}
