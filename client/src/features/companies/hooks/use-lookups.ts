import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/axios'
import type { SelectOption } from '@/components/searchable-select'

export type LookupType = 'INDUSTRY' | 'COMPANY_TYPE' | 'DESIGNATION' | 'LEAD_SOURCE' | 'WHO_BROUGHT'

interface Lookup {
  _id: string
  type: string
  label: string
  value: string
}

interface ExtendedSelectOption extends SelectOption {
  id?: string
}

export function useLookups(type: LookupType) {
  const [options, setOptions] = useState<ExtendedSelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchLookups = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/lookups/type/${type}`)
      const lookups: Lookup[] = response.data.data.lookups
      setOptions(lookups.map(l => ({ label: l.label, value: l.value, id: l._id })))
    } catch (_error) {
      // Error is handled by global interceptor or ignored for silence
    } finally {
      setIsLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchLookups()
  }, [fetchLookups])

  const createOption = async (label: string): Promise<SelectOption> => {
    const value = label
    const response = await api.post('/lookups', { type: type.toUpperCase(), label, value })
    const newLookup: Lookup = response.data.data.lookup
    const newOption: ExtendedSelectOption = { label: newLookup.label, value: newLookup.value, id: newLookup._id }
    setOptions(prev => [...prev, newOption])
    return newOption
  }

  const updateOption = async (option: SelectOption): Promise<SelectOption> => {
    const extendedOption = option as ExtendedSelectOption
    const id = extendedOption.id
    if (!id) throw new Error('Cannot update option without ID')
    
    const response = await api.patch(`/lookups/${id}`, { label: option.label, value: option.label })
    const updatedLookup: Lookup = response.data.data.lookup
    const updatedOption: ExtendedSelectOption = { label: updatedLookup.label, value: updatedLookup.value, id: updatedLookup._id }
    
    setOptions(prev => prev.map(o => (o.id === id ? updatedOption : o)))
    return updatedOption
  }

  const deleteOption = async (value: string) => {
    const option = options.find(o => o.value === value)
    const id = option?.id
    if (!id) return

    await api.delete(`/lookups/${id}`)
    setOptions(prev => prev.filter(o => o.id !== id))
  }

  return {
    options,
    isLoading,
    createOption,
    updateOption,
    deleteOption,
    refresh: fetchLookups
  }
}
