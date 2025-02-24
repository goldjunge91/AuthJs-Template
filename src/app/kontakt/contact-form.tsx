'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitContact } from './contact-actions';

// Schema für das Kontaktformular mit deutschen Fehlermeldungen
const contactSchema = z.object({
  name: z.string().min(2, 'Bitte geben Sie mindestens 2 Zeichen ein.'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  subject: z
    .string()
    .min(3, 'Bitte geben Sie einen aussagekräftigen Betreff ein.'),
  message: z
    .string()
    .min(10, 'Ihre Nachricht sollte mindestens 10 Zeichen enthalten.'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await submitContact(data);

      if (result.success) {
        toast.success('Nachricht gesendet', {
          description: 'Ihre Nachricht wurde erfolgreich übermittelt.',
        });
        form.reset();
      } else {
        toast.error('Fehler aufgetreten', {
          description:
            result.message || 'Bitte versuchen Sie es später erneut.',
        });
      }
    } catch (error) {
      toast.error('Fehler aufgetreten', {
        description:
          'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      });
      console.error('Formular-Fehler:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className='space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='space-y-6'>
          {/* Name Feld */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Max Mustermann'
                    {...field}
                    disabled={isSubmitting}
                    className='focus-visible:ring-2 focus-visible:ring-blue-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* E-Mail Feld */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='max@beispiel.de'
                    {...field}
                    disabled={isSubmitting}
                    className='focus-visible:ring-2 focus-visible:ring-blue-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Betreff Feld */}
          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Betreff</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ihre Anfrage'
                    {...field}
                    disabled={isSubmitting}
                    className='focus-visible:ring-2 focus-visible:ring-blue-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nachricht Feld */}
          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nachricht</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Ihre Nachricht an uns...'
                    className='min-h-[150px] focus-visible:ring-2 focus-visible:ring-blue-500'
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                  />
                </svg>
                Wird gesendet...
              </span>
            ) : (
              'Nachricht senden'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;
