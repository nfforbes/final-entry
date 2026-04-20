import React from 'react';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { AdminClientLayout } from '@/components/admin/AdminClientLayout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Get session from Auth0
  const session = await auth0.getSession();

  // 2. If no session, redirect to login
  if (!session || !session.user) {
    redirect('/auth/login');
  }

  // 3. Verify role directly from Database for 100% reliability
  try {
    await connectDB();
    const user = await Customer.findOne({ auth0Id: session.user.sub });

    if (!user || user.role !== 'admin') {
      console.warn(`[AdminGuard] Unauthorized access attempt by ${session.user.email} (Role: ${user?.role || 'none'})`);
      redirect('/');
    }

    // 4. Authorized - Render the UI
    return (
      <AdminClientLayout>
        {children}
      </AdminClientLayout>
    );
  } catch (error) {
    console.error('[AdminGuard] Authorization error:', error);
    // In case of DB error, safe default is redirect to home
    redirect('/');
  }
}
