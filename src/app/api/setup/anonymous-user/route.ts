import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schemas/users';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    // Prüfe, ob der anonyme Benutzer bereits existiert
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, 'anonymous-user'))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Anonymer Benutzer existiert bereits',
      });
    }

    // Erstelle den anonymen Benutzer
    await db.insert(users).values({
      id: 'anonymous-user',
      name: 'Anonymer Benutzer',
      email: 'anonymous@example.com',
      emailVerified: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Anonymer Benutzer wurde erstellt',
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des anonymen Benutzers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen des anonymen Benutzers',
      },
      { status: 500 },
    );
  }
}
