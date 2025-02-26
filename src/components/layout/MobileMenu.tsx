'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignOut } from '../AuthButton';

type MobileMenuProps = {
  navItems: ReadonlyArray<{ href: string; label: string }>;
  session: any;
  user: any;
};

export default function MobileMenu({
  navItems,
  session,
  user,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <div className='lg:hidden'>
      <button
        onClick={toggleMenu}
        className='cursor-pointer focus:outline-none'
        aria-label='Menü umschalten'
      >
        {open ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
      </button>

      {open && (
        <div className='fixed inset-x-0 top-20 z-40 bg-white/95 shadow-lg backdrop-blur-lg dark:bg-gray-900/95'>
          <div className='bg-white shadow-lg dark:bg-gray-800'>
            <div className='space-y-1 px-2 pb-3 pt-2'>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
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
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className='ml-3 text-gray-700 dark:text-gray-300'>
                        {user?.name}
                      </span>
                    </div>
                    <div onClick={closeMenu}>
                      <SignOut />
                    </div>
                  </div>
                ) : (
                  <div className='space-y-2 px-3'>
                    <Link href='/sign-in' onClick={closeMenu} className='block'>
                      <Button size='sm' className='w-full'>
                        Sign In
                      </Button>
                    </Link>
                    <Link href='/sign-up' onClick={closeMenu} className='block'>
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
      )}
    </div>
  );
}
