import { useMemo } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Country } from 'country-state-city'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useCompaniesQuery } from '@/features/companies/hooks/use-companies-api'
import { siteInputSchema, type Site, type SiteInput } from '../data/schema'
import { useLookups } from '../hooks/use-lookups'

const getAllCountries = Country.getAllCountries

interface SiteFormProps {
  initialData?: Site | null
  onSubmit: (data: SiteInput) => Promise<void>
  isPending?: boolean
}

export function SiteForm({ initialData, onSubmit, isPending }: SiteFormProps) {
  // Queries
  const { data: companiesData } = useCompaniesQuery({ pageSize: 1000 })
  const waterBodyLookup = useLookups('TYPE_OF_WATER_BODY')
  const waterUseLookup = useLookups('USE_OF_WATER')

  const form = useForm<SiteInput>({
    resolver: zodResolver(siteInputSchema) as any, // Cast to avoid strict type mismatch with coercion
    defaultValues: {
      name: initialData?.name ?? '',
      owner:
        typeof initialData?.owner === 'object'
          ? initialData.owner._id
          : (initialData?.owner ?? ''),
      country: initialData?.country ?? '',
      locationLat: initialData?.locationLat ?? 0,
      locationLng: initialData?.locationLng ?? 0,
      typeOfWaterBody: initialData?.typeOfWaterBody ?? '',
      useOfWater: initialData?.useOfWater ?? '',
      waterArea: initialData?.waterArea ?? 0,
      windSpeed: initialData?.windSpeed ?? 0,
      maxWaterLevel: initialData?.maxWaterLevel ?? '',
      minDrawDownLevel: initialData?.minDrawDownLevel ?? '',
      fullReservoirLevel: initialData?.fullReservoirLevel ?? '',
      waterLevelVariation: initialData?.waterLevelVariation ?? '',
      fetchOfReservoir: initialData?.fetchOfReservoir ?? '',
      waveHeight: initialData?.waveHeight ?? '',
      waterCurrent: initialData?.waterCurrent ?? '',

      bathymetryAvailable: initialData?.bathymetryAvailable ?? false,
      geotechnicalReportAvailable:
        initialData?.geotechnicalReportAvailable ?? false,
      pfrAvailable: initialData?.pfrAvailable ?? false,
      dprAvailable: initialData?.dprAvailable ?? false,
      possibilityForPondGettingEmpty:
        initialData?.possibilityForPondGettingEmpty ?? false,

      // Files are not populated in defaultValues as File objects, but we can't easily show them as inputs
      // We will handle file input onChange manually
    },
  })

  // Options
  const companyOptions = useMemo(() => {
    return (
      companiesData?.companies.map((c) => ({
        label: c.name,
        value: c._id,
      })) ?? []
    )
  }, [companiesData])

  const countryOptions = useMemo(
    () =>
      getAllCountries().map((c) => ({
        label: c.name,
        value: c.name,
      })),
    []
  )

  const handleFormSubmit: SubmitHandler<SiteInput> = async (values) => {
    await onSubmit(values)
  }

  const renderFileLink = (file?: { path: string; originalName: string }) => {
    if (!file) return null

    // Drive URLs are stored directly; legacy local paths need construction
    const url = file.path.startsWith('http')
      ? file.path
      : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${file.path.split(/[/\\]/).pop()}`

    return (
      <div className='mt-1 flex items-center gap-2'>
        <span className='text-xs text-muted-foreground'>
          Current: {file.originalName}
        </span>
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1 text-xs text-primary hover:underline'
        >
          <ExternalLink className='h-3 w-3' /> View
        </a>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit as any)}
        className='space-y-6'
      >
        <fieldset disabled={isPending} className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Site Details</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Site</FormLabel>
                    <FormControl>
                      <Input placeholder='Site Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='owner'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner (Company)</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={companyOptions}
                      placeholder='Select Owner'
                      allowCreate={false}
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
                      allowEdit={false}
                      allowDelete={false}
                      placeholder='Select Country'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='locationLat'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Lat</FormLabel>
                    <FormControl>
                      <Input type='number' step='any' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='locationLng'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Lng</FormLabel>
                    <FormControl>
                      <Input type='number' step='any' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Characteristics</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <FormField
                control={form.control}
                name='typeOfWaterBody'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Water Body</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={waterBodyLookup.options}
                      onCreate={waterBodyLookup.createOption}
                      onEdit={waterBodyLookup.updateOption}
                      onDelete={waterBodyLookup.deleteOption}
                      isPending={waterBodyLookup.isLoading}
                      allowCreate
                      placeholder='Select Type'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='useOfWater'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use of Water</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={waterUseLookup.options}
                      onCreate={waterUseLookup.createOption}
                      onEdit={waterUseLookup.updateOption}
                      onDelete={waterUseLookup.deleteOption}
                      isPending={waterUseLookup.isLoading}
                      allowCreate
                      placeholder='Select Use'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='waterArea'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Area (sqmt)</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='windSpeed'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Speed (m/s)</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='maxWaterLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Water Level</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='minDrawDownLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Draw Down Level</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fullReservoirLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Reservoir Level</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='waterLevelVariation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Level Variation</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 2-5m seasonal' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fetchOfReservoir'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fetch of the Reservoir</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 3km' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='waveHeight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wave Height</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='waterCurrent'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Current</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='possibilityForPondGettingEmpty'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Possibility for pond getting empty?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Uploads Section */}
          <Card>
            <CardHeader>
              <CardTitle>Input Data Available</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Bathymetry */}
              <div className='space-y-4 rounded-lg border p-4'>
                <FormField
                  control={form.control}
                  name='bathymetryAvailable'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-y-0 space-x-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Bathymetry Survey</FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('bathymetryAvailable') && (
                  <FormField
                    control={form.control}
                    name='bathymetryFile'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='file'
                            accept='.pdf,.png,.jpg,.jpeg'
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        {initialData?.bathymetryFile &&
                          renderFileLink(initialData.bathymetryFile)}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Geotechnical */}
              <div className='space-y-4 rounded-lg border p-4'>
                <FormField
                  control={form.control}
                  name='geotechnicalReportAvailable'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-y-0 space-x-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Geotechnical Report</FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('geotechnicalReportAvailable') && (
                  <FormField
                    control={form.control}
                    name='geotechnicalFile'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='file'
                            accept='.pdf,.png,.jpg,.jpeg'
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        {initialData?.geotechnicalFile &&
                          renderFileLink(initialData.geotechnicalFile)}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* PFR */}
              <div className='space-y-4 rounded-lg border p-4'>
                <FormField
                  control={form.control}
                  name='pfrAvailable'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-y-0 space-x-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>PFR</FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('pfrAvailable') && (
                  <FormField
                    control={form.control}
                    name='pfrFile'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='file'
                            accept='.pdf,.png,.jpg,.jpeg'
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        {initialData?.pfrFile &&
                          renderFileLink(initialData.pfrFile)}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* DPR */}
              <div className='space-y-4 rounded-lg border p-4'>
                <FormField
                  control={form.control}
                  name='dprAvailable'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-y-0 space-x-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>DPR</FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('dprAvailable') && (
                  <FormField
                    control={form.control}
                    name='dprFile'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='file'
                            accept='.pdf,.png,.jpg,.jpeg'
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        {initialData?.dprFile &&
                          renderFileLink(initialData.dprFile)}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-end'>
            <Button type='submit' disabled={isPending} size='lg'>
              {isPending ? 'Saving...' : 'Save Site'}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  )
}
