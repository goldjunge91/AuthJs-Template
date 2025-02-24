// import React from 'react';
// import { signIn, signOut } from '@/auth';
// import { Button } from './ui/button';
// import { Icons } from './icons';

// export function SignIn({ provider }: { provider?: string }) {
//   return (
//     <form
//       action={async () => {
//         'use server';
//         await signIn(provider || 'google', {
//           callbackUrl: '/',
//         });
//       }}
//     >
//       {/* Create button with tailwind css */}
//       <Button className='w-full' variant='outline'>
//         <Icons.gitHub className='mr-2 h-4 w-4' />
//         GitHub
//       </Button>
//     </form>
//   );
// }

// export function GithubSignIn() {
//   return (
//     <form
//       className='w-full'
//       action={async () => {
//         'use server';
//         await signIn('github', {
//           redirectTo: '/profile',
//           redirect: true,
//           callbackUrl: '/',
//         });
//       }}
//     >
//       <Button className='w-full' variant='outline'>
//         <Icons.gitHub className='mr-2 h-4 w-4' />
//         Sign in with GitHub
//       </Button>
//     </form>
//   );
// }

// export function GoogleSignIn() {
//   return (
//     <form
//       className='w-full'
//       action={async () => {
//         'use server';
//         await signIn('google', {
//           redirectTo: '/profile',
//           redirect: true,
//           callbackUrl: '/',
//         });
//       }}
//     >
//       <Button className='w-full' variant='outline'>
//         <Icons.google className='mr-2 h-4 w-4' />
//         Sign in with Google
//       </Button>
//     </form>
//   );
// }

// export function WebAuthIn() {
//   return (
//     <form
//       className='w-full'
//       action={async () => {
//         'use server';
//         await signIn('passkey', { action: 'register' });
//       }}
//     >
//       <Button className='w-full' variant='outline'>
//         Register new Passkey
//       </Button>
//     </form>
//   );
// }

// export function SignOut() {
//   return (
//     <form
//       action={async () => {
//         'use server';
//         await signOut({
//           redirectTo: '/',
//           redirect: true,
//         });
//       }}
//       className='w-full'
//     >
//       <Button size='sm' variant='destructive'>
//         Logout
//       </Button>
//     </form>
//   );
// }
'use client';

import React from 'react';
import { Button } from './ui/button';
import { Icons } from './icons';
import {
  signInWithProvider,
  signInWithGithub,
  signInWithGoogle,
  webAuthIn,
  signOutAction,
} from '@/actions/auth-actions';

export function SignIn({ provider }: { provider?: string }) {
  // Wenn ein Provider über Props übergeben wird, kannst du alternativ ein hidden-Feld nutzen,
  // sodass der Server-Action-Handler den gewünschten Provider aus den Formulardaten auslesen kann.
  return (
    <form
      action={(formData: FormData) => {
        const provider = (formData.get('provider') as string) || 'google';
        return signInWithProvider(provider);
      }}
    >
      <input type='hidden' name='provider' value={provider || 'google'} />
      <Button className='w-full' variant='outline'>
        <Icons.gitHub className='mr-2 h-4 w-4' />
        GitHub
      </Button>
    </form>
  );
}

export function GithubSignIn() {
  return (
    <form action={signInWithGithub} className='w-full'>
      <Button className='w-full' variant='outline'>
        <Icons.gitHub className='mr-2 h-4 w-4' />
        Sign in with GitHub
      </Button>
    </form>
  );
}

export function GoogleSignIn() {
  return (
    <form action={signInWithGoogle} className='w-full'>
      <Button className='w-full' variant='outline'>
        <Icons.google className='mr-2 h-4 w-4' />
        Sign in with Google
      </Button>
    </form>
  );
}

export function WebAuthIn() {
  return (
    <form action={webAuthIn} className='w-full'>
      <Button className='w-full' variant='outline'>
        Register new Passkey
      </Button>
    </form>
  );
}

export function SignOut() {
  return (
    <form action={signOutAction} className='w-full'>
      <Button size='sm' variant='destructive'>
        Logout
      </Button>
    </form>
  );
}
