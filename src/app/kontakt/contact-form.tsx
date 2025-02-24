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
// import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

// Create a new schema for the contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Bitte geben Sie Ihren Namen ein.'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  subject: z.string().min(1, 'Bitte geben Sie einen Betreff ein.'),
  message: z.string().min(1, 'Bitte geben Sie eine Nachricht ein.'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm: React.FC = () => {
  //   const { toast } = useToast();
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast('Erfolg', {
          description: 'Ihre Nachricht wurde erfolgreich gesendet!',
        });
        form.reset();
      } else {
        toast('Fehler', {
          description: 'Ein Fehler ist aufgetreten',
          className: 'bg-red-200',
        });
      }
    } catch (error) {
      toast('Fehler', {
        description: 'Ein Fehler ist aufgetreten',
        className: 'bg-red-200',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className='rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Name' {...field} />
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
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input placeholder='E-Mail' type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Betreff</FormLabel>
                <FormControl>
                  <Input placeholder='Betreff' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nachricht</FormLabel>
                <FormControl>
                  <Textarea placeholder='Nachricht' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className='w-full' disabled={isSubmitting} type='submit'>
            Nachricht senden
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;
