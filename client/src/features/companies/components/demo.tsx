import React from 'react'
import {
  EditableSelect,
  type Option,
} from '../../../components/searchable-select'

export default function DemoPage() {
  const [value, setValue] = React.useState<string>()
  const [items, setItems] = React.useState<Option[]>([
    { label: 'Apple', value: 'apple' },
    { label: 'Mango', value: 'mango' },
    { label: 'Orange', value: 'orange' },
  ])

  return (
    <div className='max-w-md space-y-4 p-10'>
      <h2 className='text-xl font-semibold'>Editable Select Demo</h2>

      <EditableSelect
        value={value}
        onChange={setValue}
        options={items}
        onCreate={async (label) => {
          const newOpt = { label, value: label.toLowerCase() }
          setItems((prev) => [...prev, newOpt])
          return newOpt
        }}
        onEdit={async (opt) => {
          setItems((prev) => prev.map((o) => (o.value === opt.value ? opt : o)))
          return opt
        }}
        onDelete={async (val) => {
          setItems((prev) => prev.filter((o) => o.value !== val))
        }}
      />

      <div className='text-sm text-muted-foreground'>Selected: {value}</div>
    </div>
  )
}
