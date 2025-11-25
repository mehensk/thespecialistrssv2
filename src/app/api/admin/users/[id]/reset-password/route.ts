import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/verify-admin-role';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole, ActivityAction, ActivityItemType } from '@prisma/client';
import { logActivity } from '@/lib/activity-logger';

// Generate a random temporary password
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one lowercase, one uppercase, one number, and one special char
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin role - pass request for API route compatibility
    const { isAdmin, userId } = await verifyAdminRole(request);

    if (!isAdmin || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the target user
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword();
    
    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Log password reset activity
    await logActivity({
      userId: userId,
      action: ActivityAction.UPDATE,
      itemType: ActivityItemType.USER,
      itemId: id,
      metadata: { 
        action: 'password_reset_by_admin',
        targetUserEmail: user.email,
        targetUserName: user.name,
      },
    }).catch((error) => {
      // Don't fail if logging fails
      console.error('Failed to log password reset activity:', error);
    });

    // Return the temporary password (only shown once to admin)
    return NextResponse.json({
      success: true,
      temporaryPassword,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

