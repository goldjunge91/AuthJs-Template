'use server';

import { auth } from '@/auth';

export async function adminAction() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Hier könnte eine echte Admin-Aktion ausgeführt werden
    return { success: 'Admin server action erfolgreich ausgeführt' };
  } catch (error) {
    return { error: 'Failed to execute admin action' };
  }
}
