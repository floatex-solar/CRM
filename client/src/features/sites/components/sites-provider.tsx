import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Site } from '../data/schema'

type SitesDialogType = 'add' | 'edit' | 'delete'

type SitesContextType = {
  open: SitesDialogType | null
  setOpen: (str: SitesDialogType | null) => void
  currentRow: Site | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Site | null>>
}

const SitesContext = React.createContext<SitesContextType | null>(null)

export function SitesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SitesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Site | null>(null)

  return (
    <SitesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SitesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSites = () => {
  const context = React.useContext(SitesContext)

  if (!context) {
    throw new Error('useSites has to be used within <SitesProvider>')
  }

  return context
}
