import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import logo from '@/../public/assets/logo.jpeg';
import { auth } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { SignOut } from '../AuthButton';
import { Button } from '../ui/button';

/**
 * Basis-Navigationselemente, die allen Benutzern angezeigt werden
 * @constant {Array<{href: string, label: string}>}
 */
const BASE_NAV_ITEMS = [
  { href: '/', label: 'Startseite' },
  { href: '/pakete', label: 'Pakete' },
  { href: '/booking', label: 'Termin buchen' },
  { href: '/faq', label: 'FAQ' },
  { href: '/kontakt', label: 'Kontakt' },
] as const;

// /**
//  * Zusätzliche Navigationselemente für authentifizierte Benutzer
//  * @constant {Array<{href: string, label: string}>}
//  */
const AUTH_NAV_ITEMS = [{ href: '/profile', label: 'Profil' }] as const;
export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const navItems = (() => {
    if (session?.user) {
      return [...BASE_NAV_ITEMS, ...AUTH_NAV_ITEMS];
    }
    return BASE_NAV_ITEMS;
  })();

  return (
    // <header className='sticky top-0 z-50  shadow-sm dark:bg-gray-900'>
    <header className='fixed top-0 z-50 w-full border-b bg-white/80 px-4 py-3 shadow-sm backdrop-blur-lg dark:bg-gray-900/80'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center justify-between'>
          {/* Logo section */}
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

          {/* Center: Navigation Items */}
          <div className='hidden flex-1 items-center justify-center lg:flex'>
            {' '}
            {/* Changed from sm:flex to lg:flex */}
            <nav className='flex gap-12'>
              {' '}
              {/* Reduced space-x-6 to space-x-4 */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='text-1xl text-size- hover:text-primary-500 dark:hover:text-primary-400 group relative text-gray-700 transition-colors dark:text-gray-300'
                >
                  {item.label}
                  <span className='absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transform bg-black transition-transform duration-300 ease-out group-hover:scale-x-100 dark:bg-white' />
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Auth Section */}
          <div className='hidden flex-shrink-0 lg:flex'>
            {' '}
            {/* Added hidden lg:flex */}
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

          {/* Mobile Menu using checkbox hack */}
          <div className='md:hidden'>
            <label htmlFor='menu-toggle' className='cursor-pointer'>
              <Menu className='h-6 w-6' />
            </label>
            <input type='checkbox' id='menu-toggle' className='peer hidden' />

            {/* Mobile Menu Panel - shown when checkbox is checked */}
            <div className='fixed inset-x-0 top-20 z-40 bg-white/95 shadow-lg backdrop-blur-lg peer-checked:block dark:bg-gray-900/95 md:hidden'>
              <div className='bg-white shadow-lg dark:bg-gray-800'>
                <div className='space-y-1 px-2 pb-3 pt-2'>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className='hover:text-primary-500 dark:hover:text-primary-400 block w-full rounded-lg px-4 py-3 text-lg text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className='mt-4 border-t border-gray-200 pt-4 dark:border-gray-700'>
                    {session ? (
                      <div className='flex items-center justify-between px-3'>
                        <div className='flex items-center'>
                          <Avatar>
                            <AvatarImage src={user?.image ?? ''} />
                            <AvatarFallback>
                              {user?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className='ml-3 text-gray-700 dark:text-gray-300'>
                            {user?.name}
                          </span>
                        </div>
                        <SignOut />
                      </div>
                    ) : (
                      <div className='space-y-2 px-3'>
                        <Link href='/sign-in' className='block'>
                          <Button size='sm' className='w-full'>
                            Sign In
                          </Button>
                        </Link>
                        <Link href='/sign-up' className='block'>
                          <Button size='sm' className='w-full'>
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// import React from 'react';
// import { auth } from '@/auth';
// import Link from 'next/link';
// import { Button } from './ui/button';
// import { SignOut } from './AuthButton';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// export default async function Navbar() {
//   const session = await auth();
//   const user = session?.user;

//   return (
//     <header className='sticky top-0 z-50 border-b bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
//       <div className='mx-auto flex items-center justify-between'>
//         <Link className='text-lg font-bold' href='/'>
//           AuthJs Template
//         </Link>
//         {session ? (
//           <div className='flex items-center space-x-4'>
//             <Link
//               className='text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
//               href='/dashboard'
//             >
//               Dashboard
//             </Link>
//             <Link
//               className='text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
//               href='/profile'
//             >
//               <Avatar>
//                 <AvatarImage
//                   className='rounded-full border-2 border-black dark:border-white'
//                   src={user?.image ? user.image : ''}
//                 />
//                 <AvatarFallback className='rounded-full border-2 border-black dark:border-white'>
//                   {user?.name?.charAt(0)}
//                 </AvatarFallback>
//               </Avatar>
//             </Link>
//             <SignOut />
//           </div>
//         ) : (
//           <div className='flex items-center space-x-4'>
//             <Link href='/sign-in'>
//               <Button size='sm'>Sign In</Button>
//             </Link>
//             <Link href='/sign-up'>
//               <Button size='sm'>Sign Up</Button>
//             </Link>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }
