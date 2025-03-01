'use client';
import { useActionState } from 'react';
import { signUp } from '@/actions/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const initialState = {
  type: '',
  message: '',
  errors: null,
  resetKey: '',
};

export default function SignUpForm() {
  const [state, submitAction, isPending] = useActionState(signUp, initialState);

  return (
    <form action={submitAction} className='space-y-4' key={state?.resetKey}>
      {state.errors && (
        <div className='rounded-md border-2 border-red-400 px-2 py-4 text-center'>
          <p className='text-red-500'>{state.message}</p>
        </div>
      )}
      {state.type === 'success' && (
        <div className='rounded-md border-2 border-green-400 px-2 py-4 text-center'>
          <p className='text-green-500'>{state.message}</p>
        </div>
      )}
      <div className='grid gap-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          name='email'
          placeholder='name@example.com'
          required
          type='email'
        />
      </div>
      {state.errors?.email && (
        <p className='text-red-500'>{state.errors.email}</p>
      )}
      <Button className='w-full' disabled={isPending} type='submit'>
        {isPending ? 'Sending...' : 'Send invitation link'}
      </Button>
    </form>
  );
}
