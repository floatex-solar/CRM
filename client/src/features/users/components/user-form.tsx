import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Textarea } from '@/components/ui/textarea'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import type { User } from '../data/schema'

/* ─── Form Schema ─── */

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please provide a valid email.'),
  role: z.enum(['admin', 'user']).default('user'),
  bio: z.string().max(300).optional().default(''),
  urls: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional()
    .default([]),
})

const createSchema = baseSchema
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    passwordConfirm: z.string().min(1, 'Please confirm the password.'),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  })

const editSchema = baseSchema

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>
type FormValues = CreateValues | EditValues

/* ─── Props ─── */

interface UserFormProps {
  initialData?: User | null
  onSubmit: (data: FormValues) => Promise<void>
  isPending?: boolean
}

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]

/* ─── Component ─── */

export function UserForm({ initialData, onSubmit, isPending }: UserFormProps) {
  const isEditing = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(isEditing ? editSchema : (createSchema as any)),
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      role: (initialData?.role as 'admin' | 'user') ?? 'user',
      bio: initialData?.bio ?? '',
      urls: initialData?.urls?.length
        ? initialData.urls
        : [{ label: '', value: '' }],
      ...(isEditing ? {} : { password: '', passwordConfirm: '' }),
    },
  })

  const {
    fields: urlFields,
    append: appendUrl,
    remove: removeUrl,
  } = useFieldArray({
    control: form.control,
    name: 'urls',
  })

  return (
    <Form {...form}>
      <form
        id='user-form'
        onSubmit={form.handleSubmit(onSubmit as any)}
        className='space-y-6'
      >
        <fieldset disabled={isPending} className='space-y-6'>
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john@example.com'
                        {...field}
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select role'
                      items={roleOptions}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Password (create only) */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='••••••••'
                          {...(field as any)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='passwordConfirm'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder='••••••••'
                          {...(field as any)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Bio & URLs */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='bio'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='A short bio...'
                        className='resize-none'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Social URLs</FormLabel>
                <div className='mt-2 space-y-2'>
                  {urlFields.map((field, index) => (
                    <div key={field.id} className='flex items-start gap-2'>
                      <FormField
                        control={form.control}
                        name={`urls.${index}.label`}
                        render={({ field: f }) => (
                          <FormItem className='flex-1'>
                            <FormControl>
                              <Input
                                placeholder='Label (e.g. LinkedIn)'
                                {...f}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`urls.${index}.value`}
                        render={({ field: f }) => (
                          <FormItem className='flex-[2]'>
                            <FormControl>
                              <Input placeholder='https://...' {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {urlFields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => removeUrl(index)}
                          className='mt-0.5 h-9 w-9 text-muted-foreground'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => appendUrl({ label: '', value: '' })}
                    className='mt-1 gap-x-1'
                  >
                    <Plus className='h-4 w-4' />
                    Add URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className='flex justify-end'>
            <Button type='submit' disabled={isPending} size='lg'>
              {isPending
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create User'}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  )
}
