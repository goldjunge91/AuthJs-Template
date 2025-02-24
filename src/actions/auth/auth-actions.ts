// 'use server';

// import { signIn, signOut } from '@/auth';

// export async function handleGoogleSignIn() {
//   await signIn('google', {
//     redirectTo: '/profile',
//     redirect: true,
//   });
// }

// export async function handleGithubSignIn() {
//   await signIn('github', {
//     redirectTo: '/profile',
//     redirect: true,
//   });
// }

// export async function handlePasskeyRegister() {
//   await signIn('passkey', { action: 'register' });
// }

// export async function handleSignOut() {
//   await signOut({
//     redirectTo: '/',
//     redirect: true,
//   });
// }

// export async function handleDefaultSignIn(provider?: string) {
//   await signIn(provider || 'google', {
//     callbackUrl: '/',
//   });
// }
// serverActions.ts
'use server';

import { signIn, signOut } from '@/auth';

export async function signInWithProvider(provider: string = 'google') {
  await signIn(provider, {
    callbackUrl: '/',
  });
}

export async function signInWithGithub() {
  await signIn('github', {
    redirectTo: '/profile',
    redirect: true,
    callbackUrl: '/',
  });
}

export async function signInWithGoogle() {
  await signIn('google', {
    redirectTo: '/profile',
    redirect: true,
    callbackUrl: '/',
  });
}

export async function webAuthIn() {
  await signIn('passkey', { action: 'register' });
}

export async function signOutAction() {
  await signOut({
    redirectTo: '/',
    redirect: true,
  });
}
