'use client';

import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from './contact-form';

export default function Kontakt() {
  return (
    // Verwende min-h-[80vh] statt min-h-screen und mache den Container zu einem flex-Container, der den Inhalt vertikal zentriert.
    <div className='flex min-h-[80vh] items-center bg-gray-50 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
          <div>
            <h1 className='mb-4 text-4xl font-bold dark:text-white'>
              Kontaktieren Sie uns
            </h1>
            <p className='mb-8 text-gray-600 dark:text-gray-300'>
              Haben Sie Fragen zu unseren Dienstleistungen? Wir sind für Sie da!
            </p>

            <div className='space-y-6'>
              <div className='flex items-start'>
                <Phone className='mt-1 h-6 w-6 text-primary-600 dark:text-primary-400' />
                <div className='ml-4'>
                  <h3 className='font-medium dark:text-white'>Telefon</h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    +49 123 456789
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-1 h-6 w-6 text-primary-600 dark:text-primary-400' />
                <div className='ml-4'>
                  <h3 className='font-medium dark:text-white'>E-Mail</h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    info@jetwash.de
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <MapPin className='mt-1 h-6 w-6 text-primary-600 dark:text-primary-400' />
                <div className='ml-4'>
                  <h3 className='font-medium dark:text-white'>Adresse</h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Musterstraße 123
                    <br />
                    12345 Stadt
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Clock className='mt-1 h-6 w-6 text-primary-600 dark:text-primary-400' />
                <div className='ml-4'>
                  <h3 className='font-medium dark:text-white'>
                    Öffnungszeiten
                  </h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Mo - Fr: 8:00 - 18:00
                    <br />
                    Sa: 9:00 - 14:00
                    <br />
                    So: Geschlossen
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
