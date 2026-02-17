import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Checkbox } from '@/components/ui/checkbox'
import {
  categories,
  leadStatuses,
  priorities,
  contactRoles,
} from '../data/data'
import { useUpdateCompanyMutation } from '../hooks/use-companies-api'
import type { Company, CompanyInput } from '../data/schema'

const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required.'),
  industry: z.string().optional(),
  categories: z.array(z.string()),
  website: z.string().optional(),
  address: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  contacts: z.array(
    z.object({
      name: z.string().min(1, 'Contact name is required.'),
      email: z.string().optional(),
      role: z.enum(['primary', 'secondary', 'other']).optional().default('other'),
    })
  ),
  leadStatus: z.string().optional(),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.array(z.string()),
})
type CompanyForm = z.infer<typeof companyFormSchema>

type CompanyEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Company
}

export function CompanyEditDialog({
  open,
  onOpenChange,
  currentRow,
}: CompanyEditDialogProps) {
  const updateMutation = useUpdateCompanyMutation()
  const form = useForm<CompanyForm>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      industry: '',
      categories: [],
      website: '',
      address: {},
      contacts: [{ name: '', email: '', role: 'other' }],
      leadStatus: 'New',
      priority: 'Medium',
      leadSource: '',
      assignedTo: '',
      notes: [],
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        name: currentRow.name,
        industry: currentRow.industry ?? '',
        categories: currentRow.categories ?? [],
        website: currentRow.website ?? '',
        address: currentRow.address
          ? {
              country: currentRow.address.country ?? '',
              city: currentRow.address.city ?? '',
              postalCode: currentRow.address.postalCode ?? '',
            }
          : {},
        contacts:
          currentRow.contacts?.length > 0
            ? currentRow.contacts.map((c) => ({
                name: c.name,
                email: c.email ?? '',
                role: (c.role as 'primary' | 'secondary' | 'other') ?? 'other',
              }))
            : [{ name: '', email: '', role: 'other' as const }],
        leadStatus: currentRow.leadStatus ?? 'New',
        priority: currentRow.priority ?? 'Medium',
        leadSource: currentRow.leadSource ?? '',
        assignedTo: currentRow.assignedTo ?? '',
        notes: currentRow.notes ?? [],
      })
    }
  }, [open, currentRow, form])

  const onSubmit = async (values: CompanyForm) => {
    const payload: Partial<CompanyInput> = {
      name: values.name,
      industry: values.industry || undefined,
      categories: values.categories,
      website: values.website || undefined,
      address: values.address?.country || values.address?.city || values.address?.postalCode
        ? {
            country: values.address?.country,
            city: values.address?.city,
            postalCode: values.address?.postalCode,
          }
        : undefined,
      contacts: values.contacts
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name,
          email: c.email || undefined,
          role: c.role,
        })),
      leadStatus: values.leadStatus || undefined,
      priority: values.priority || undefined,
      leadSource: values.leadSource || undefined,
      assignedTo: values.assignedTo || undefined,
      notes: values.notes,
    }
    try {
      await updateMutation.mutateAsync({ id: currentRow._id, input: payload })
      toast.success('Company updated successfully.')
      onOpenChange(false)
    } catch {
      // Error handled by mutation onError
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the company details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='company-edit-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Acme Corp' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='industry'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder='Tech' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='categories'
                render={() => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className='flex flex-wrap gap-4 rounded-md border p-4'>
                      {categories.map((cat) => (
                        <FormField
                          key={cat.value}
                          control={form.control}
                          name='categories'
                          render={({ field }) => (
                            <FormItem className='flex items-center space-x-2 space-y-0'>
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(cat.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, cat.value])
                                      : field.onChange(
                                          field.value?.filter((v) => v !== cat.value)
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {cat.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://acme.com'
                        type='url'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='address.country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder='US' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address.city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder='NY' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address.postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder='10001' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='space-y-2'>
                <FormLabel>Primary Contact</FormLabel>
                <div className='grid grid-cols-3 gap-2'>
                  <FormField
                    control={form.control}
                    name='contacts.0.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder='Name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='contacts.0.email'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder='email@acme.com'
                            type='email'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='contacts.0.role'
                    render={({ field }) => (
                      <FormItem>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Role'
                          items={contactRoles.map(({ label, value }) => ({
                            label,
                            value,
                          }))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name='leadStatus'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      items={leadStatuses.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select priority'
                      items={priorities.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='leadSource'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source</FormLabel>
                    <FormControl>
                      <Input placeholder='Referral' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            form='company-edit-form'
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
