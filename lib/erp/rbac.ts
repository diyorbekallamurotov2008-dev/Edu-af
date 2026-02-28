import { UserRole } from '@prisma/client';

const rolePermissions: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['students.manage', 'groups.manage', 'payments.manage', 'attendance.read', 'sms.read'],
  TEACHER: ['attendance.mark.own_groups', 'schedule.read.own_groups', 'sms.send.own_groups'],
  STUDENT: ['portal.read.self'],
  PARENT: ['portal.read.self']
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role] ?? [];
  return permissions.includes('*') || permissions.includes(permission);
}
