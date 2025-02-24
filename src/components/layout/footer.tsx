import { Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className='z-100 relative mt-auto w-full bg-background text-foreground'>
      <div className='xs:px-6 xs:py-10 mx-auto max-w-7xl px-4 py-8'>
        <div className='xs:grid-cols-2 grid grid-cols-1 gap-8 md:grid-cols-4'>
          <div>
            <h3 className='xs:text-xl mb-4 text-lg font-bold'>Jetwash</h3>
            <div className='space-y-2'>
              <p className='xs:text-base flex items-center text-sm text-muted-foreground'>
                <Phone className='mr-2 h-2 w-4' /> +49 123 456789
              </p>
              <p className='xs:text-base flex items-center text-sm text-muted-foreground'>
                <Mail className='mr-2 h-2 w-4' /> info@jetwash-mobile.de
              </p>
              <p className='xs:text-base flex items-center text-sm text-muted-foreground'>
                <MapPin className='mr-2 h-2 w-4' /> Musterstraße 123, 12345
                Stadt
              </p>
            </div>
          </div>

          <div>
            <h3 className='xs:text-xl mb-4 text-lg font-bold'>Service</h3>
            <ul className='space-y-1'>
              <li>
                <a
                  href='/pakete'
                  className='xs:text-base text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  Unsere Pakete
                </a>
              </li>
              <li>
                <a
                  href='/booking'
                  className='xs:text-base text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  Termin buchen
                </a>
              </li>
              <li>
                <a
                  href='/faq'
                  className='xs:text-base text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='xs:text-xl mb-4 text-lg font-bold'>Rechtliches</h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='/impressum'
                  className='xs:text-base text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  Impressum
                </a>
              </li>
              <li>
                <a
                  href='/Privacy'
                  className='xs:text-base text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  Datenschutz
                </a>
              </li>
              <li>
                <a
                  href='/agb'
                  className='xs:text-base text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  AGB
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='xs:text-xl mb-4 text-lg font-bold'>
              Öffnungszeiten
            </h3>
            <ul className='xs:text-base space-y-2 text-sm text-muted-foreground'>
              <li>Mo - Fr: 8:00 - 18:00</li>
              <li>Sa: 9:00 - 14:00</li>
              <li>So: Geschlossen</li>
            </ul>
          </div>
        </div>

        <div className='mt-8 border-t border-border pt-2 text-center'>
          <p className='xs:text-base text-sm text-muted-foreground'>
            &copy; {new Date().getFullYear()} Jetwash. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
