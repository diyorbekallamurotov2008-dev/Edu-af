import { describe, expect, it } from 'vitest';
import { hasPermission } from '../lib/erp/rbac';

describe('rbac', () => {
  it('super admin has wildcard access', () => {
    expect(hasPermission('SUPER_ADMIN', 'settings.manage')).toBe(true);
  });

  it('teacher cannot access settings', () => {
    expect(hasPermission('TEACHER', 'settings.manage')).toBe(false);
    expect(hasPermission('TEACHER', 'attendance.mark.own_groups')).toBe(true);
  });
});
