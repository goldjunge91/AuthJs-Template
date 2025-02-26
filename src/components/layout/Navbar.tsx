import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// import logo from './assets/logo.jpeg';
import logo from '../../../public/assets/logo.jpeg';
import { auth } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignOut } from '../AuthButton';
import { Button } from '../ui/button';
import MobileMenu from './MobileMenu';

const BASE_NAV_ITEMS = [
  { href: '/', label: 'Startseite' },
  { href: '/pakete', label: 'Pakete' },
  { href: '/booking', label: 'Termin buchen' },
  { href: '/faq', label: 'FAQ' },
  { href: '/kontakt', label: 'Kontakt' },
] as const;

const AUTH_NAV_ITEMS = [{ href: '/profile', label: 'Profil' }] as const;

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const navItems = session?.user
    ? [...BASE_NAV_ITEMS, ...AUTH_NAV_ITEMS]
    : BASE_NAV_ITEMS;

  return (
    <header className='fixed top-0 z-50 w-full border-b bg-white/80 px-4 py-3 shadow-sm backdrop-blur-lg dark:bg-gray-900/80'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-3'>
            <Image
              src={logo}
              alt='Logo'
              width={48}
              height={48}
              className='rounded-full transition-transform duration-200 hover:scale-110'
              priority
            />
            <span className='ml-3 text-xl font-bold text-gray-900 dark:text-white sm:text-xl'>
              Jetwash
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden flex-1 items-center justify-center lg:flex'>
            <nav className='flex gap-12'>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='text-1xl text-size- group relative text-gray-700 transition-colors hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400'
                >
                  {item.label}
                  <span className='absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transform bg-black transition-transform duration-300 ease-out group-hover:scale-x-100 dark:bg-white' />
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Auth Section */}
          <div className='hidden flex-shrink-0 lg:flex'>
            {session ? (
              <div className='flex items-center space-x-4'>
                <Avatar>
                  <AvatarImage
                    src={user?.image ?? ''}
                    className='rounded-full transition-transform'
                  />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <SignOut />
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link href='/sign-in'>
                  <Button size='sm'>Sign In</Button>
                </Link>
                <Link href='/sign-up'>
                  <Button size='sm'>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <MobileMenu navItems={navItems} session={session} user={user} />
        </div>
      </div>
    </header>
  );
}
