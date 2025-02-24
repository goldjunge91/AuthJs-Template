import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: Admin access required' },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { message: 'Admin route handler erfolgreich aufgerufen' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
