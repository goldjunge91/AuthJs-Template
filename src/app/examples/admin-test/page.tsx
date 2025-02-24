'use client';

import { Button } from '@/components/ui/button';
import { adminAction } from '@/actions/admin/adminAction';
import { toast } from 'sonner';

export default function AdminTestPage() {
  const onRouteHandlerClick = () => {
    fetch('/api/admin')
      .then(async (response) => {
        const { message } = await response.json();
        if (response.ok) {
          toast.success(message);
        } else {
          toast.error(message);
        }
      })
      .catch(() => {
        toast.error('Failed to execute route handler');
      });
  };

  const onServerActionClick = () => {
    adminAction()
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
        }
      })
      .catch(() => {
        toast.error('Failed to execute server action');
      });
  };

  return (
    <div className='container space-y-4 py-10'>
      <h1 className='mb-6 text-2xl font-bold'>Admin Funktionalitäts-Test</h1>
      <div className='flex flex-col space-y-4'>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
          <p className='text-sm font-medium'>Admin-only Route Handler</p>
          <Button onClick={onRouteHandlerClick}>Testen</Button>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
          <p className='text-sm font-medium'>Admin-only Server Action</p>
          <Button onClick={onServerActionClick}>Testen</Button>
        </div>
      </div>
    </div>
  );
}
