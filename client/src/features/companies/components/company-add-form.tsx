import { useMemo, useEffect } from 'react'
import {
  useForm,
  useFieldArray,
  useWatch,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Country, State, City } from 'country-state-city'
import { Plus, Trash2 } from 'lucide-react'
import countries from 'world-countries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  leadStatuses,
  priorities,
  contactRoles,
  ndaStatuses,
  mouStatuses,
} from '../data/data'
import {
  companyInputSchema,
  type Company,
  type CompanyInput,
} from '../data/schema'
import { useLookups } from '../hooks/use-lookups'

const getAllCountries = Country.getAllCountries
const getCitiesOfState = City.getCitiesOfState
const getStatesOfCountry = State.getStatesOfCountry

interface CompanyFormProps {
  initialData?: Company | null
  onSubmit: (data: CompanyInput) => Promise<void>
  isPending?: boolean
}

export function CompanyForm({
  initialData,
  onSubmit,
  isPending,
}: CompanyFormProps) {
  const form = useForm<CompanyInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(companyInputSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      typeOfCompany: initialData?.typeOfCompany ?? '',
      industry: initialData?.industry ?? '',
      website: initialData?.website ?? '',
      address: {
        streetAddress: initialData?.address?.streetAddress ?? '',
        country: initialData?.address?.country ?? '',
        state: initialData?.address?.state ?? '',
        city: initialData?.address?.city ?? '',
        region: initialData?.address?.region ?? '',
        subRegion: initialData?.address?.subRegion ?? '',
        postalCode: initialData?.address?.postalCode ?? '',
      },
      contacts: initialData?.contacts?.length
        ? initialData.contacts.map((c) => ({
            name: c.name,
            email: c.email ?? '',
            phone: c.phone ?? '',
            designation: c.designation ?? '',
            role: c.role ?? 'other',
          }))
        : [{ name: '', email: '', phone: '', designation: '', role: 'other' }],
      leadStatus: initialData?.leadStatus ?? 'New',
      priority: initialData?.priority ?? 'Medium',
      leadSource: initialData?.leadSource ?? '',
      whoBrought: initialData?.whoBrought ?? '',
      assignedTo: initialData?.assignedTo ?? '',
      notes: initialData?.notes ?? [],
      ndaStatus: initialData?.ndaStatus ?? ('Not Sent' as any),
      ndaSignedDate: initialData?.ndaSignedDate
        ? new Date(initialData.ndaSignedDate).toISOString().split('T')[0]
        : '',
      ndaExpiryDate: initialData?.ndaExpiryDate
        ? new Date(initialData.ndaExpiryDate).toISOString().split('T')[0]
        : '',
      mouStatus: initialData?.mouStatus ?? ('Not Sent' as any),
      mouSignedDate: initialData?.mouSignedDate
        ? new Date(initialData.mouSignedDate).toISOString().split('T')[0]
        : '',
      mouExpiryDate: initialData?.mouExpiryDate
        ? new Date(initialData.mouExpiryDate).toISOString().split('T')[0]
        : '',
      emailSent: (initialData?.emailSent as any) ?? 'No',
      emailSentDate: initialData?.emailSentDate
        ? new Date(initialData.emailSentDate).toISOString().split('T')[0]
        : '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  })

  // Lookups
  const typeOfCompanyLookup = useLookups('COMPANY_TYPE')
  const industryLookup = useLookups('INDUSTRY')
  const designationLookup = useLookups('DESIGNATION')
  const leadSourceLookup = useLookups('LEAD_SOURCE')
  const whoBroughtLookup = useLookups('WHO_BROUGHT')

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
      form.setValue('address.subRegion', wCountry?.subregion ?? '')
    } else {
      form.setValue('address.region', '')
      form.setValue('address.subRegion', '')
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
        className='space-y-6'
      >
        <fieldset disabled={isPending} className='space-y-6'>
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
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

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='typeOfCompany'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type Of Company</FormLabel>
                      <SearchableSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={typeOfCompanyLookup.options}
                        onCreate={typeOfCompanyLookup.createOption}
                        onEdit={typeOfCompanyLookup.updateOption}
                        onDelete={typeOfCompanyLookup.deleteOption}
                        isPending={typeOfCompanyLookup.isLoading}
                        allowCreate
                        placeholder='Select type'
                      />
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
                        options={industryLookup.options}
                        onCreate={industryLookup.createOption}
                        onEdit={industryLookup.updateOption}
                        onDelete={industryLookup.deleteOption}
                        isPending={industryLookup.isLoading}
                        allowCreate
                        placeholder='Select industry'
                      />
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
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FormField
                control={form.control}
                name='address.streetAddress'
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

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
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
                        allowCreate={false}
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
                        allowCreate={false}
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
                        allowCreate={false}
                        placeholder='Select city'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address.region'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          readOnly
                          className='bg-muted'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address.subRegion'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Region</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          readOnly
                          className='bg-muted'
                        />
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
            </CardContent>
          </Card>

          {/* Contacts - Compact grid-based cards with icon remove */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Contacts ({fields.length})</CardTitle>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  append({
                    name: '',
                    email: '',
                    phone: '',
                    designation: '',
                    role: 'other',
                  })
                }
                className='gap-x-2'
              >
                <Plus className='h-4 w-4' />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='relative rounded-xl border bg-card p-6 shadow-sm'
                  >
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => remove(index)}
                      className='absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-destructive'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5'>
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.name`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder='Name' {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.email`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder='email@acme.com'
                                type='email'
                                {...f}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.phone`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder='Phone' {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.designation`}
                        render={({ field: f }) => (
                          <FormItem>
                            <SearchableSelect
                              value={f.value}
                              onChange={f.onChange}
                              options={designationLookup.options}
                              onCreate={designationLookup.createOption}
                              onEdit={designationLookup.updateOption}
                              onDelete={designationLookup.deleteOption}
                              isPending={designationLookup.isLoading}
                              allowCreate
                              placeholder='Select designation'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.role`}
                        render={({ field: f }) => (
                          <FormItem>
                            <SelectDropdown
                              defaultValue={f.value}
                              onValueChange={f.onChange}
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
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
                      <SearchableSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={leadSourceLookup.options}
                        onCreate={leadSourceLookup.createOption}
                        onEdit={leadSourceLookup.updateOption}
                        onDelete={leadSourceLookup.deleteOption}
                        isPending={leadSourceLookup.isLoading}
                        allowCreate
                        placeholder='Select source'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='whoBrought'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Who Brought The Company</FormLabel>
                      <SearchableSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={whoBroughtLookup.options}
                        onCreate={whoBroughtLookup.createOption}
                        onEdit={whoBroughtLookup.updateOption}
                        onDelete={whoBroughtLookup.deleteOption}
                        isPending={whoBroughtLookup.isLoading}
                        allowCreate
                        placeholder='Select person'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='emailSent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Sent</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Email Sent'
                        items={[
                          { label: 'Yes', value: 'Yes' },
                          { label: 'No', value: 'No' },
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='emailSentDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Sent Date</FormLabel>
                      <FormControl>
                        <Input type='date' {...(field as any)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* NDA */}
          <Card>
            <CardHeader>
              <CardTitle>NDA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <FormField
                  control={form.control}
                  name='ndaStatus'
                  render={({ field }) => (
                    <FormItem>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='NDA Status'
                        items={ndaStatuses.map(({ label, value }) => ({
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
                  name='ndaSignedDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='date' {...(field as any)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ndaExpiryDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='date' {...(field as any)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ndaFile'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type='file'
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* MOU */}
          <Card>
            <CardHeader>
              <CardTitle>MOU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <FormField
                  control={form.control}
                  name='mouStatus'
                  render={({ field }) => (
                    <FormItem>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='MOU Status'
                        items={mouStatuses.map(({ label, value }) => ({
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
                  name='mouSignedDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='date' {...(field as any)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='mouExpiryDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='date' {...(field as any)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='mouFile'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type='file'
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-end'>
            <Button type='submit' disabled={isPending} size='lg'>
              {isPending ? 'Saving...' : 'Save Company'}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  )
}
