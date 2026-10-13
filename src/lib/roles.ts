export const APP_ROLES = ['customer', 'admin', 'technician'] as const;

export type AppRole = (typeof APP_ROLES)[number];

type RoleSource = {
  role?: unknown;
  roles?: unknown;
} | null | undefined;

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && (APP_ROLES as readonly string[]).includes(value.toLowerCase());
}

/** Roles on the user. The legacy `role` field is included so an admin set there is not hidden by an older `roles` list. */
export function rolesOf(source: RoleSource): AppRole[] {
  const listed = Array.isArray(source?.roles) ? source.roles : [];
  const items = [...listed];
  if (source?.role != null && source.role !== '') items.push(source.role);
  const out: AppRole[] = [];
  for (const item of items) {
    if (!isAppRole(item)) continue;
    const role = item.toLowerCase() as AppRole;
    if (!out.includes(role)) out.push(role);
  }
  return out.length > 0 ? out : ['customer'];
}

export function hasRole(source: RoleSource, role: AppRole): boolean {
  return rolesOf(source).includes(role);
}

/** Kept on `role` so older checks that expect one string still see an admin. */
export function primaryRole(roles: readonly AppRole[]): AppRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('technician')) return 'technician';
  return 'customer';
}

/**
 * `roles` replaces the set. A single `role` (older clients) replaces the set with that one role.
 * Returns null when the body does not name at least one real role.
 */
export function rolesFromUpdate(body: { role?: unknown; roles?: unknown }): AppRole[] | null {
  if (Array.isArray(body.roles)) {
    const next = rolesOf({ roles: body.roles });
    const requested = body.roles.filter(isAppRole);
    return requested.length > 0 ? next : null;
  }
  if (isAppRole(body.role)) return [body.role.toLowerCase() as AppRole];
  return null;
}
