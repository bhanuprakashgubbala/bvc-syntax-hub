import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password, masterKey } = await req.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanMasterKey = (masterKey || '').trim();

    // Valid admin credentials check:
    // 1. Standard admin credentials (admin@nextgenlabs.co / admin123 or admin)
    // 2. Master Key override (NGL-ROOT-ADMIN-2026)
    const isValidAdmin = 
      (cleanEmail === 'admin@nextgenlabs.co' && (cleanPassword === 'admin123' || cleanPassword === 'admin')) ||
      (cleanEmail === 'admin@bvcgroup.in' && (cleanPassword === 'admin123' || cleanPassword === 'admin')) ||
      (cleanEmail === 'admin' && (cleanPassword === 'admin' || cleanPassword === 'admin123')) ||
      cleanMasterKey === 'NGL-ROOT-ADMIN-2026';

    if (!isValidAdmin) {
      return NextResponse.json(
        { success: false, error: 'Invalid administrator credentials or master key.' },
        { status: 401 }
      );
    }

    const adminUser = {
      id: 'admin-super-root',
      name: 'System Administrator',
      email: cleanEmail || 'admin@nextgenlabs.co',
      role: 'SuperAdmin',
      organization: 'NextGen Labs Management'
    };

    const token = 'ngl_admin_token_' + Date.now().toString(36) + Math.random().toString(36).slice(2);

    const response = NextResponse.json({
      success: true,
      message: 'Admin authorization successful',
      token,
      user: adminUser
    });

    // Set admin session cookie
    response.cookies.set('nextgen_admin_token', token, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
