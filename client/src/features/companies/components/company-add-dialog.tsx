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
import { toast } from 'sonner'
import countries from 'world-countries'
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
import { SearchableSelect } from '@/components/searchable-select'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  categories,
  leadStatuses,
  priorities,
  contactRoles,
  industries,
  ndaStatuses,
  mouStatuses,
  whoBroughtOptions,
} from '../data/data'
import type { CompanyInput } from '../data/schema'
import { useCreateCompanyMutation } from '../hooks/use-companies-api'

const getAllCountries = Country.getAllCountries
const getCitiesOfState = City.getCitiesOfState
const getStatesOfCountry = State.getStatesOfCountry

const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required.'),
  industry: z.string().optional(),
  categories: z.string().optional(),
  website: z.string().optional(),
  address: z
    .object({
      streetAddress: z.string().optional(),
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      subRegion: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  contacts: z
    .array(
      z.object({
        name: z.string().min(1, 'Contact name is required.'),
        email: z
          .string()
          .email('Invalid email format.')
          .optional()
          .or(z.literal('')),
        phone: z.string().optional(),
        designation: z.string().optional(),
        role: z.enum(['primary', 'secondary', 'other']),
      })
    )
    .min(1, 'At least one contact is required.')
    .refine(
      (contacts) => contacts.filter((c) => c.role === 'primary').length <= 1,
      { message: 'Only one primary contact is allowed.' }
    )
    .refine(
      (contacts) => contacts.filter((c) => c.role === 'secondary').length <= 1,
      { message: 'Only one secondary contact is allowed.' }
    ),
  leadStatus: z.string().optional(),
  priority: z.string().optional(),
  leadSource: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.array(z.string()),
  ndaStatus: z
    .enum(['Not Sent', 'Sent', 'Signed', 'Expired'])
    .optional()
    .default('Not Sent'),
  ndaSignedDate: z.string().optional(),
  ndaExpiryDate: z.string().optional(),
  ndaFile: z.any().optional(),
  mouStatus: z
    .enum(['Not Sent', 'Sent', 'Signed', 'Expired'])
    .optional()
    .default('Not Sent'),
  mouSignedDate: z.string().optional(),
  mouExpiryDate: z.string().optional(),
  mouFile: z.any().optional(),
  emailSent: z.enum(['Yes', 'No']).optional().default('No'),
  emailSentDate: z.string().optional(),
  whoBrought: z.string().optional(),
})

type CompanyForm = z.infer<typeof companyFormSchema>

type CompanyAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyAddDialog({
  open,
  onOpenChange,
}: CompanyAddDialogProps) {
  const createMutation = useCreateCompanyMutation()
  const form = useForm<CompanyForm>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      industry: '',
      categories: '',
      website: '',
      address: {
        streetAddress: '',
        country: '',
        state: '',
        city: '',
        region: '',
        subRegion: '',
        postalCode: '',
      },
      contacts: [
        { name: '', email: '', phone: '', designation: '', role: 'other' },
      ],
      leadStatus: 'New',
      priority: 'Medium',
      leadSource: '',
      assignedTo: '',
      notes: [],
      ndaStatus: 'Not Sent',
      ndaSignedDate: '',
      ndaExpiryDate: '',
      ndaFile: undefined,
      mouStatus: 'Not Sent',
      mouSignedDate: '',
      mouExpiryDate: '',
      mouFile: undefined,
      emailSent: 'No',
      emailSentDate: '',
      whoBrought: '',
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
      form.setValue('address.subRegion', wCountry?.subregion ?? '')
    } else {
      form.setValue('address.region', '')
      form.setValue('address.subRegion', '')
    }
  }, [watchedCountry, form])

  useEffect(() => {
    const currentState = form.getValues('address.state')
    if (
      watchedCountry &&
      currentState &&
      !stateOptions.find((s) => s.value === currentState)
    ) {
      form.setValue('address.state', '')
      form.setValue('address.city', '')
    }
  }, [watchedCountry, stateOptions, form])

  useEffect(() => {
    const currentCity = form.getValues('address.city')
    if (
      watchedState &&
      currentCity &&
      !cityOptions.find((c) => c.value === currentCity)
    ) {
      form.setValue('address.city', '')
    }
  }, [watchedState, cityOptions, form])

  const onSubmit: SubmitHandler<CompanyForm> = async (values) => {
    const payload: CompanyInput = {
      name: values.name,
      industry: values.industry || undefined,
      categories: values.categories || undefined,
      website: values.website || undefined,
      address:
        values.address &&
        (values.address.streetAddress ||
          values.address.country ||
          values.address.state ||
          values.address.city ||
          values.address.region ||
          values.address.subRegion ||
          values.address.postalCode)
          ? values.address
          : undefined,
      contacts: values.contacts
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name,
          email: c.email || undefined,
          phone: c.phone || undefined,
          designation: c.designation || undefined,
          role: c.role,
        })),
      leadStatus: values.leadStatus || undefined,
      priority: values.priority || undefined,
      leadSource: values.leadSource || undefined,
      assignedTo: values.assignedTo || undefined,
      notes: values.notes,
      ndaStatus: values.ndaStatus,
      ndaSignedDate: values.ndaSignedDate || undefined,
      ndaExpiryDate: values.ndaExpiryDate || undefined,
      ndaFile: values.ndaFile ? (values.ndaFile as FileList)[0] : undefined,
      mouStatus: values.mouStatus,
      mouSignedDate: values.mouSignedDate || undefined,
      mouExpiryDate: values.mouExpiryDate || undefined,
      mouFile: values.mouFile ? (values.mouFile as FileList)[0] : undefined,
      emailSent: values.emailSent,
      emailSentDate: values.emailSentDate || undefined,
      whoBrought: values.whoBrought || undefined,
    }
    try {
      await createMutation.mutateAsync(payload)
      toast.success('Company created successfully.')
      form.reset()
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
      <DialogContent className='sm:max-w-7xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Add Company</DialogTitle>
          <DialogDescription>
            Create a new company. Fill in the details and click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='company-add-form'
              onSubmit={form.handleSubmit(onSubmit as SubmitHandler<any>)}
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
                name='categories'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Company</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={categories.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                      allowCreate
                      allowEdit
                      allowDelete
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
                      options={industries.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                      allowCreate
                      allowEdit
                      allowDelete
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
              <div className='grid grid-cols-5 gap-4'>
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
                        allowEdit={false}
                        allowDelete={false}
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
                        allowEdit={false}
                        allowDelete={false}
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
                        allowEdit={false}
                        allowDelete={false}
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
              <div className='space-y-2'>
                <FormLabel>Contacts</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className='mb-2 rounded-md border p-4'>
                    <div className='grid grid-cols-5 gap-2'>
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
                            <FormControl>
                              <Input placeholder='Designation' {...f} />
                            </FormControl>
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
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => remove(index)}
                      className='mt-2'
                    >
                      Remove Contact
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    append({
                      name: '',
                      email: '',
                      phone: '',
                      designation: '',
                      role: 'other',
                    })
                  }
                >
                  Add Contact
                </Button>
                <FormMessage>
                  {form.formState.errors.contacts?.message ??
                    form.formState.errors.contacts?.root?.message}
                </FormMessage>
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
              <div className='space-y-2'>
                <FormLabel>NDA</FormLabel>
                <div className='grid grid-cols-4 gap-4'>
                  <FormField
                    control={form.control}
                    name='ndaStatus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='sr-only'>NDA Status</FormLabel>
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
                        <FormLabel className='sr-only'>
                          NDA Signed Date
                        </FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
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
                        <FormLabel className='sr-only'>
                          NDA Expiry Date
                        </FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
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
                        <FormLabel className='sr-only'>NDA File</FormLabel>
                        <FormControl>
                          <Input
                            type='file'
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            onChange={(event) =>
                              field.onChange(event.target.files)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <FormLabel>MOU</FormLabel>
                <div className='grid grid-cols-4 gap-4'>
                  <FormField
                    control={form.control}
                    name='mouStatus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='sr-only'>MOU Status</FormLabel>
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
                        <FormLabel className='sr-only'>
                          MOU Signed Date
                        </FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
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
                        <FormLabel className='sr-only'>
                          MOU Expiry Date
                        </FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
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
                        <FormLabel className='sr-only'>MOU File</FormLabel>
                        <FormControl>
                          <Input
                            type='file'
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            onChange={(event) =>
                              field.onChange(event.target.files)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
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
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='whoBrought'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who Brought the Company</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={whoBroughtOptions.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                      allowCreate
                      allowEdit
                      allowDelete
                      placeholder='Select person'
                    />
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
            form='company-add-form'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
