'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useBookingStore } from '../_lib/_store/state-store';
import { customerSchema, type CustomerDetails } from '../_lib/_types/index';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function CustomerForm() {
  const { customerDetails, setCustomerDetails } = useBookingStore();

  const form = useForm<CustomerDetails>({
    resolver: zodResolver(customerSchema),
    defaultValues: customerDetails || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      number: '',
      postalCode: '',
      city: '',
    },
  });

  function onSubmit(values: CustomerDetails) {
    setCustomerDetails(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vorname</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nachname</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input type='tel' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-4 md:grid-cols-[2fr_1fr]'>
          <FormField
            control={form.control}
            name='street'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Straße</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='number'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hausnummer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='postalCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>PLZ</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stadt</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit'>Speichern</Button>
      </form>
    </Form>
  );
}
