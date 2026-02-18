import { useMemo, useEffect } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Country } from 'country-state-city'
import { Plus, Trash2 } from 'lucide-react'
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
import { useLookups } from '@/features/companies/hooks/use-lookups'
import {
  priorities,
  anchoringOptions,
  typeOfAnchoringOptions,
  typeOfMooringOptions,
  methodOfMooringOptions,
} from '../data/data'
import { leadInputSchema, type Lead, type LeadInput } from '../data/schema'
import { useCompanySelectOptions } from '../hooks/use-leads-api'

const getAllCountries = Country.getAllCountries

/** Extract ObjectId string from a populated company ref */
function extractCompanyId(ref: Lead['client']): string {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  return ref._id
}

interface LeadFormProps {
  initialData?: Lead | null
  onSubmit: (data: LeadInput) => Promise<void>
  isPending?: boolean
}

export function LeadForm({ initialData, onSubmit, isPending }: LeadFormProps) {
  const form = useForm<LeadInput>({
    resolver: zodResolver(leadInputSchema) as any,
    defaultValues: {
      jobCode: initialData?.jobCode ?? '',
      priority: (initialData?.priority as LeadInput['priority']) ?? 'Medium',

      projectName: initialData?.projectName ?? '',
      projectLocation: initialData?.projectLocation ?? '',

      client: extractCompanyId(initialData?.client),
      capacity: initialData?.capacity ?? '',
      developer: extractCompanyId(initialData?.developer),
      consultant: extractCompanyId(initialData?.consultant),
      endCustomer: extractCompanyId(initialData?.endCustomer),
      country: initialData?.country ?? '',

      designConfigurations: initialData?.designConfigurations?.length
        ? initialData.designConfigurations.map((dc) => ({
            version: dc.version,
            moduleCapacity: dc.moduleCapacity ?? '',
            moduleDimension: dc.moduleDimension ?? '',
            inverterCapacity: dc.inverterCapacity ?? '',
            inverterMake: dc.inverterMake ?? '',
            configuration: dc.configuration ?? '',
            anchoring: dc.anchoring,
            typeOfAnchoring: dc.typeOfAnchoring,
          }))
        : [
            {
              moduleCapacity: '',
              moduleDimension: '',
              inverterCapacity: '',
              inverterMake: '',
              configuration: '',
              // These will be undefined initially, but form validation handles required check
              anchoring: undefined,
              typeOfAnchoring: undefined,
            },
          ],

      mooringTechnique: {
        typeOfMooring: initialData?.mooringTechnique?.typeOfMooring,
        methodOfMooring: initialData?.mooringTechnique?.methodOfMooring,
      },

      currency: initialData?.currency ?? '',
      offeredPrice: {
        floatingSystem: initialData?.offeredPrice?.floatingSystem ?? 0,
        anchoringMooringSystem:
          initialData?.offeredPrice?.anchoringMooringSystem ?? 0,
        supervision: initialData?.offeredPrice?.supervision ?? 0,
        dcInstallation: initialData?.offeredPrice?.dcInstallation ?? 0,
        total: initialData?.offeredPrice?.total ?? 0,
      },

      responsiblePerson: initialData?.responsiblePerson ?? '',
    },
  })

  const {
    fields: dcFields,
    append: appendDc,
    remove: removeDc,
  } = useFieldArray({
    control: form.control,
    name: 'designConfigurations',
  })

  // Lookups for creatable selects
  const inverterMakeLookup = useLookups('INVERTER_MAKE' as any)
  const currencyLookup = useLookups('CURRENCY' as any)
  const responsiblePersonLookup = useLookups('RESPONSIBLE_PERSON' as any)

  // Company dropdowns
  const { data: allCompanies } = useCompanySelectOptions()
  const { data: developerCompanies } = useCompanySelectOptions('Developer')
  const { data: consultantCompanies } = useCompanySelectOptions('Consultant')
  const { data: endCustomerCompanies } = useCompanySelectOptions('End Customer')

  // Country dropdown
  const countryOptions = useMemo(
    () =>
      getAllCountries().map((c) => ({
        label: c.name,
        value: c.name,
      })),
    []
  )

  // Auto-compute total offered price
  const watchedPrice = useWatch({
    control: form.control,
    name: 'offeredPrice',
  })

  useEffect(() => {
    if (watchedPrice) {
      const total =
        (Number(watchedPrice.floatingSystem) || 0) +
        (Number(watchedPrice.anchoringMooringSystem) || 0) +
        (Number(watchedPrice.supervision) || 0) +
        (Number(watchedPrice.dcInstallation) || 0)
      form.setValue('offeredPrice.total', total)
    }
  }, [
    watchedPrice?.floatingSystem,
    watchedPrice?.anchoringMooringSystem,
    watchedPrice?.supervision,
    watchedPrice?.dcInstallation,
    form,
  ])

  const handleFormSubmit = async (values: LeadInput) => {
    // Inject version numbers and strip empty design configurations
    const configs = (values.designConfigurations ?? []).map((dc, idx) => ({
      ...dc,
      version: idx + 1,
    }))
    // Filter out configs where all user-editable fields are empty
    const nonEmptyConfigs = configs.filter(
      (dc) =>
        dc.moduleCapacity ||
        dc.moduleDimension ||
        dc.inverterCapacity ||
        dc.inverterMake ||
        dc.configuration ||
        dc.anchoring ||
        dc.typeOfAnchoring
    )

    await onSubmit({
      ...values,
      designConfigurations: nonEmptyConfigs,
    })
  }

  return (
    <Form {...form}>
      <form
        id='lead-form'
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-6'
      >
        {/* Header: Job Code & Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='jobCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Code</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. JOB-001' {...field} />
                    </FormControl>
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
            </div>
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='projectName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Solar Park Alpha' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='projectLocation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Location</FormLabel>
                    <FormControl>
                      <Input placeholder='Rajasthan, India' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <FormField
                control={form.control}
                name='client'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={allCompanies ?? []}
                      allowCreate={false}
                      placeholder='Select client'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input placeholder='100 MW' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='developer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Developer</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={developerCompanies ?? []}
                      allowCreate={false}
                      placeholder='Select developer'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='consultant'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultant</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={consultantCompanies ?? []}
                      allowCreate={false}
                      placeholder='Select consultant'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endCustomer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Customer</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={endCustomerCompanies ?? []}
                      allowCreate={false}
                      placeholder='Select end customer'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='country'
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
            </div>
          </CardContent>
        </Card>

        {/* Design Configuration */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Design Configuration</CardTitle>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                appendDc({
                  moduleCapacity: '',
                  moduleDimension: '',
                  inverterCapacity: '',
                  inverterMake: '',
                  configuration: '',
                  // @ts-expect-error - These are required by schema but undefined initially for user input
                  anchoring: undefined,
                  // @ts-expect-error - These are required by schema but undefined initially for user input
                  typeOfAnchoring: undefined,
                })
              }
              className='gap-x-2'
            >
              <Plus className='h-4 w-4' />
              Add Version
            </Button>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {dcFields.map((field, index) => (
                <div
                  key={field.id}
                  className='relative rounded-xl border bg-card p-6 shadow-sm'
                >
                  <div className='mb-4 flex items-center justify-between'>
                    <span className='rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary'>
                      Version {index + 1}
                    </span>
                    {dcFields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeDc(index)}
                        className='h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-destructive'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {/* Module */}
                    <FormField
                      control={form.control}
                      name={`designConfigurations.${index}.moduleCapacity`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Module Capacity</FormLabel>
                          <FormControl>
                            <Input placeholder='540 Wp' {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`designConfigurations.${index}.moduleDimension`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Module Dimension</FormLabel>
                          <FormControl>
                            <Input placeholder='2278 x 1134 mm' {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Inverter */}
                    <FormField
                      control={form.control}
                      name={`designConfigurations.${index}.inverterCapacity`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Inverter Capacity</FormLabel>
                          <FormControl>
                            <Input placeholder='100 kW' {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`designConfigurations.${index}.inverterMake`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Inverter Make</FormLabel>
                          <SearchableSelect
                            value={f.value}
                            onChange={f.onChange}
                            options={inverterMakeLookup.options}
                            onCreate={inverterMakeLookup.createOption}
                            onEdit={inverterMakeLookup.updateOption}
                            onDelete={inverterMakeLookup.deleteOption}
                            isPending={inverterMakeLookup.isLoading}
                            allowCreate
                            placeholder='Select make'
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Configuration */}
                    <FormField
                      control={form.control}
                      name={`designConfigurations.${index}.configuration`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Configuration</FormLabel>
                          <FormControl>
                            <Input placeholder='Configuration details' {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Anchoring */}
                    <FormField
                      control={form.control}
                      name={`designConfigurations.${index}.anchoring`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Anchoring</FormLabel>
                          <SelectDropdown
                            defaultValue={f.value}
                            onValueChange={f.onChange}
                            placeholder='Select anchoring'
                            items={anchoringOptions.map(({ label, value }) => ({
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
                      name={`designConfigurations.${index}.typeOfAnchoring`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Type of Anchoring</FormLabel>
                          <SelectDropdown
                            defaultValue={f.value}
                            onValueChange={f.onChange}
                            placeholder='Select type'
                            items={typeOfAnchoringOptions.map(
                              ({ label, value }) => ({
                                label,
                                value,
                              })
                            )}
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

        {/* Mooring Technique */}
        <Card>
          <CardHeader>
            <CardTitle>Mooring Technique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='mooringTechnique.typeOfMooring'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Mooring</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select type'
                      items={typeOfMooringOptions.map(({ label, value }) => ({
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
                name='mooringTechnique.methodOfMooring'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method of Mooring</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select method'
                      items={methodOfMooringOptions.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Offered Price */}
        <Card>
          <CardHeader>
            <CardTitle>Offered Price</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='currency'
              render={({ field }) => (
                <FormItem className='max-w-xs'>
                  <FormLabel>Currency</FormLabel>
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={currencyLookup.options}
                    onCreate={currencyLookup.createOption}
                    onEdit={currencyLookup.updateOption}
                    onDelete={currencyLookup.deleteOption}
                    isPending={currencyLookup.isLoading}
                    allowCreate
                    placeholder='Select currency (e.g. INR, EUR)'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
              <FormField
                control={form.control}
                name='offeredPrice.floatingSystem'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floating System</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='offeredPrice.anchoringMooringSystem'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anchoring &amp; Mooring</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='offeredPrice.supervision'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervision</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='offeredPrice.dcInstallation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DC Installation</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='offeredPrice.total'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        readOnly
                        className='bg-muted font-semibold'
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Responsible Person */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='responsiblePerson'
              render={({ field }) => (
                <FormItem className='max-w-md'>
                  <FormLabel>Responsible Person</FormLabel>
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={responsiblePersonLookup.options}
                    onCreate={responsiblePersonLookup.createOption}
                    onEdit={responsiblePersonLookup.updateOption}
                    onDelete={responsiblePersonLookup.deleteOption}
                    isPending={responsiblePersonLookup.isLoading}
                    allowCreate
                    placeholder='Select person'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending} size='lg'>
            {isPending ? 'Saving...' : 'Save Lead'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
