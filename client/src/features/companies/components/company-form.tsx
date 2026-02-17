import { useMemo, useEffect } from 'react'
import { z } from 'zod'
import {
  useForm,
  useFieldArray,
  useWatch,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Country, State, City } from 'country-state-city'
import countries from 'world-countries'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/searchable-select'
import { SelectDropdown } from '@/components/select-dropdown'
import { Checkbox } from '@/components/ui/checkbox'
import {
  categories,
  leadStatuses,
  priorities,
  contactRoles,
  industries,
  ndaStatuses,
  mouStatuses,
  relationshipTypes,
} from '../data/data'
import { companyInputSchema, type Company, type CompanyInput } from '../data/schema'
import { cn } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

const getAllCountries = Country.getAllCountries
const getCitiesOfState = City.getCitiesOfState
const getStatesOfCountry = State.getStatesOfCountry

interface CompanyFormProps {
  initialData?: Company | null
  onSubmit: (data: CompanyInput) => Promise<void>
  isPending?: boolean
}

export function CompanyForm({ initialData, onSubmit, isPending }: CompanyFormProps) {
  const form = useForm<CompanyInput>({
    resolver: zodResolver(companyInputSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      industry: initialData?.industry ?? '',
      categories: initialData?.categories ?? [],
      website: initialData?.website ?? '',
      address: {
        addressLine: initialData?.address?.addressLine ?? '',
        country: initialData?.address?.country ?? '',
        state: initialData?.address?.state ?? '',
        city: initialData?.address?.city ?? '',
        region: initialData?.address?.region ?? '',
        postalCode: initialData?.address?.postalCode ?? '',
      },
      contacts: initialData?.contacts?.length ? initialData.contacts.map(c => ({
        name: c.name,
        email: c.email ?? '',
        phone: c.phone ?? '',
        designation: c.designation ?? '',
        role: c.role ?? 'other'
      })) : [{ name: '', email: '', phone: '', designation: '', role: 'other' }],
      leadStatus: initialData?.leadStatus ?? 'New',
      priority: initialData?.priority ?? 'Medium',
      leadSource: initialData?.leadSource ?? '',
      relationshipType: initialData?.relationshipType ?? 'Cold',
      assignedTo: initialData?.assignedTo ?? '',
      reference: initialData?.reference ?? '',
      introMailSent: initialData?.introMailSent ?? false,
      introMailDate: initialData?.introMailDate ? new Date(initialData.introMailDate) : undefined,
      notes: initialData?.notes ?? [],
      nda: {
        status: initialData?.nda?.status ?? 'Not Sent',
        signedDate: initialData?.nda?.signedDate ? new Date(initialData.nda.signedDate) : undefined,
        expiryDate: initialData?.nda?.expiryDate ? new Date(initialData.nda.expiryDate) : undefined,
      },
      mou: {
        status: initialData?.mou?.status ?? 'Not Sent',
        signedDate: initialData?.mou?.signedDate ? new Date(initialData.mou.signedDate) : undefined,
        expiryDate: initialData?.mou?.expiryDate ? new Date(initialData.mou.expiryDate) : undefined,
      },
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  })

  const watchedCountry = useWatch({
    control: form.control,
    name: 'address.country',
  })
  const watchedState = useWatch({
    control: form.control,
    name: 'address.state',
  })

  const countryOptions = useMemo(
    () =>
      getAllCountries().map((c) => ({
        label: c.name,
        value: c.isoCode,
      })),
    []
  )

  const stateOptions = useMemo(() => {
    if (!watchedCountry) return []
    const states = getStatesOfCountry(watchedCountry)
    return states.map((s) => ({
      label: s.name,
      value: s.isoCode,
    }))
  }, [watchedCountry])

  const cityOptions = useMemo(() => {
    if (!watchedCountry || !watchedState) return []
    const cities = getCitiesOfState(watchedCountry, watchedState)
    return cities.map((c) => ({
      label: c.name,
      value: c.name,
    }))
  }, [watchedCountry, watchedState])

  useEffect(() => {
    if (watchedCountry) {
      const country = getAllCountries().find(
        (c) => c.isoCode === watchedCountry
      )
      const wCountry = countries.find((c) => c.cca2 === country?.isoCode)
      form.setValue('address.region', wCountry?.region ?? '')
    } else {
      form.setValue('address.region', '')
    }
  }, [watchedCountry, form])

  const handleFormSubmit: SubmitHandler<CompanyInput> = async (values) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        id='company-form'
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-6 px-1'
      >
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* Basic Info Section */}
          <div className='space-y-4 rounded-lg border p-4'>
            <h3 className='text-lg font-medium'>Company Information</h3>
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
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder='https://acme.com' type='url' {...field} />
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
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={industries.map(({ label, value }) => ({ label, value }))}
                    allowCreate
                    placeholder='Select industry'
                  />
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
                  <div className='flex flex-wrap gap-2'>
                    {categories.map((cat) => (
                      <FormField
                        key={cat.value}
                        control={form.control}
                        name='categories'
                        render={({ field }) => (
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id={`cat-${cat.value}`}
                              checked={field.value?.includes(cat.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                return checked
                                  ? field.onChange([...current, cat.value])
                                  : field.onChange(current.filter((v) => v !== cat.value))
                              }}
                            />
                            <label
                              htmlFor={`cat-${cat.value}`}
                              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            >
                              {cat.label}
                            </label>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status & Priority Section */}
          <div className='space-y-4 rounded-lg border p-4'>
            <h3 className='text-lg font-medium'>Lead Details</h3>
            <div className='grid grid-cols-2 gap-4'>
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
                      items={leadStatuses.map(({ label, value }) => ({ label, value }))}
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
                      items={priorities.map(({ label, value }) => ({ label, value }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='relationshipType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select type'
                      items={relationshipTypes.map(({ label, value }) => ({ label, value }))}
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
                      <Input placeholder='Referral, Ads, etc.' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='assignedTo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <Input placeholder='User ID or Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='reference'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder='Referral person/site' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='assignedTo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <Input placeholder='User ID or Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className='space-y-4 rounded-lg border p-4'>
          <h3 className='text-lg font-medium'>Address</h3>
          <FormField
            control={form.control}
            name='address.addressLine'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder='123 Main St' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <FormField
              control={form.control}
              name='address.country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={countryOptions}
                    placeholder='Select country'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='address.state'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={stateOptions}
                    placeholder='Select state'
                  />
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
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={cityOptions}
                    placeholder='Select city'
                  />
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
        </div>

        {/* Contacts Section */}
        <div className='space-y-4 rounded-lg border p-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>Contacts</h3>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => append({ name: '', email: '', phone: '', designation: '', role: 'other' })}
            >
              <Plus className='mr-2 h-4 w-4' /> Add Contact
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className='relative grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-5'>
              <FormField
                control={form.control}
                name={`contacts.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Contact Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`contacts.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='email@example.com' type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`contacts.${index}.phone`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='Phone Number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`contacts.${index}.designation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder='CEO, Manager, etc.' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex items-end gap-2'>
                <FormField
                  control={form.control}
                  name={`contacts.${index}.role`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className={cn(index !== 0 && 'sr-only')}>Role</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Role'
                        items={contactRoles.map(({ label, value }) => ({ label, value }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='text-destructive'
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <FormMessage>{form.formState.errors.contacts?.message}</FormMessage>
        </div>

        {/* Agreements Section */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* NDA Section */}
          <div className='space-y-4 rounded-lg border p-4'>
            <h3 className='text-lg font-medium'>NDA Details</h3>
            <FormField
              control={form.control}
              name='nda.status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='NDA Status'
                    items={ndaStatuses.map(({ label, value }) => ({ label, value }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='nda.signedDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signed Date</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nda.expiryDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* MOU Section */}
          <div className='space-y-4 rounded-lg border p-4'>
            <h3 className='text-lg font-medium'>MOU Details</h3>
            <FormField
              control={form.control}
              name='mou.status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='MOU Status'
                    items={mouStatuses.map(({ label, value }) => ({ label, value }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='mou.signedDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signed Date</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='mou.expiryDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Company'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
