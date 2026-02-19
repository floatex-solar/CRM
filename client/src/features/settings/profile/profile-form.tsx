import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must not be longer than 50 characters.'),
  email: z.string().email(),
  bio: z
    .string()
    .max(300, 'Bio must not be longer than 300 characters.')
    .optional()
    .default(''),
  urls: z
    .array(
      z.object({
        label: z.string().min(1, 'Label is required.'),
        value: z.string().url('Please enter a valid URL.'),
      })
    )
    .optional()
    .default([]),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { data: user, isLoading } = useCurrentUser()
  const {
    auth: { setUser },
  } = useAuthStore()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: user
      ? {
          name: user.name,
          email: user.email,
          bio: user.bio ?? '',
          urls: user.urls?.length ? user.urls : [{ label: '', value: '' }],
        }
      : undefined,
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<ProfileFormValues, 'email'>) => {
      const { data: res } = await api.patch<{
        status: string
        data: {
          user: {
            _id: string
            name: string
            bio?: string
            urls?: { label: string; value: string }[]
          }
        }
      }>('/users/updateMe', data)
      return res.data.user
    },
    onSuccess: (updatedUser) => {
      setUser({
        name: updatedUser.name,
        bio: updatedUser.bio,
        urls: updatedUser.urls,
      })
      toast.success('Profile updated successfully.')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile.')
    },
  })

  const handleSubmit = (data: ProfileFormValues) => {
    const { email: _email, ...updateData } = data
    // Filter out empty URL entries
    updateData.urls =
      updateData.urls?.filter((u) => u.label.trim() && u.value.trim()) ?? []
    updateMutation.mutate(updateData)
  }

  if (isLoading) {
    return (
      <div className='text-sm text-muted-foreground'>Loading profile...</div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
        <fieldset disabled={updateMutation.isPending} className='space-y-8'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Your name' {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
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
                  <Input {...field} disabled className='bg-muted' />
                </FormControl>
                <FormDescription>
                  Your email address cannot be changed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Brief description for your profile. Max 300 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`urls.${index}.value`}
                render={({ field: valueField }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && 'sr-only')}>
                      Add links to your website, blog, or social media profiles.
                    </FormDescription>
                    <div className='flex items-start gap-2'>
                      <FormField
                        control={form.control}
                        name={`urls.${index}.label`}
                        render={({ field: labelField }) => (
                          <FormItem className='flex-1'>
                            <FormControl
                              className={cn(index !== 0 && 'mt-1.5')}
                            >
                              <Input placeholder='Label' {...labelField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem className='flex-[2]'>
                        <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                          <Input placeholder='https://...' {...valueField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      {fields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => remove(index)}
                          className={cn(
                            'h-9 w-9 text-muted-foreground',
                            index !== 0 && 'mt-1.5'
                          )}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2 gap-x-1'
              onClick={() => append({ label: '', value: '' })}
            >
              <Plus className='h-4 w-4' />
              Add URL
            </Button>
          </div>
          <Button type='submit' disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Update profile'}
          </Button>
        </fieldset>
      </form>
    </Form>
  )
}
