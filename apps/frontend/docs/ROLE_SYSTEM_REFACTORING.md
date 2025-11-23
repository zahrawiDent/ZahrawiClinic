# Role-Based Access Control System Refactoring

## Summary
Refactored the role and authentication system to be more maintainable, scalable, and bug-free.

## Critical Bug Fixed
**Collection Name Mismatch**: The backend migration was using `'superusers'` (without underscore) while the frontend used `'_superusers'` (with underscore). This would have caused all access control rules to fail. Now consistently uses `'_superusers'` everywhere.

## Improvements Made

### 1. **Centralized Constants** (`lib/constants/roles.ts`)
**Before**: Role values hardcoded in 3+ places
**After**: Single source of truth

```typescript
export const USER_ROLES = {
  DENTIST: 'Dentist',
  RECEPTIONIST: 'Receptionist',
}

export const COLLECTIONS = {
  SUPERUSERS: '_superusers',
  USERS: 'users',
}
```

**Benefits**:
- Add new roles in one place
- Type-safe with TypeScript
- Consistent across entire app

### 2. **Separated Auth Helpers** (`lib/auth-helpers.ts`)
**Before**: Auth checks mixed with route guards
**After**: Clear separation of concerns

```typescript
// Auth state checks
isSuperuser()
hasRole(role)
getCurrentRole()
getUserType()
getCurrentUserCollection()

// Future-ready permission system
canAccess(feature)
canManageUsers()
```

**Benefits**:
- Reusable in components and logic
- Better organization
- Extensible for future permissions

### 3. **Simplified Route Guards** (`lib/route-guards.ts`)
**Before**: Inline logic with hardcoded values
**After**: Uses auth-helpers and constants

```typescript
export const requireSuperuser = () => {
  if (!isSuperuser()) {
    throw new Error('Unauthorized: Superuser access required')
  }
}
```

**Benefits**:
- DRY (Don't Repeat Yourself)
- Easier to test
- Consistent error messages

### 4. **Cleaner Component Code**
**Before**:
```typescript
const collection = isSuper ? '_superusers' : 'users'
```

**After**:
```typescript
const collection = getCurrentUserCollection()
```

**Benefits**:
- More readable
- Less error-prone
- Self-documenting

## File Structure

```
lib/
├── constants/
│   └── roles.ts          # Role definitions and constants
├── auth-helpers.ts       # Auth state checks and utilities
├── route-guards.ts       # Route protection functions
├── auth-context.tsx      # React context wrapper
└── pocketbase.ts         # PocketBase client
```

## Migration Guide

### Adding a New Role

1. Add to `lib/constants/roles.ts`:
```typescript
export const USER_ROLES = {
  DENTIST: 'Dentist',
  RECEPTIONIST: 'Receptionist',
  NURSE: 'Nurse', // New role
}
```

2. Update backend migration to include new role value
3. All forms automatically get the new option via `ROLE_OPTIONS`

### Adding Permission Checks

Use the `canAccess()` helper in `auth-helpers.ts`:

```typescript
export const canAccess = (feature: string): boolean => {
  if (isSuperuser()) return true
  
  const role = getCurrentRole()
  
  switch (feature) {
    case 'appointments:create':
      return role === 'Dentist' || role === 'Receptionist'
    case 'reports:financial':
      return role === 'Dentist'
    default:
      return false
  }
}
```

Then use in components:
```typescript
<Show when={canAccess('reports:financial')}>
  <FinancialReportsLink />
</Show>
```

### Route Protection Examples

```typescript
// Superuser only
beforeLoad: requireSuperuser

// Specific role
beforeLoad: () => requireRole('Dentist')

// Multiple roles
beforeLoad: () => requireRole(['Dentist', 'Receptionist'])

// Superuser OR specific role
beforeLoad: () => requireSuperuserOrRole('Dentist')
```

## Testing Checklist

- [ ] Superuser can access `/users` page
- [ ] Regular users cannot access `/users` page
- [ ] Users can edit their own profile
- [ ] Superusers can edit any user
- [ ] Role dropdown shows correct options
- [ ] Login works for both superusers and regular users
- [ ] Access rules enforce collection-level security

## Future Enhancements

1. **Permissions System**: Replace role checks with granular permissions
2. **Audit Logging**: Track who accesses what
3. **Role Hierarchy**: Dentist > Nurse > Receptionist
4. **Dynamic Roles**: Load roles from database
5. **Feature Flags**: Toggle features per role

## Breaking Changes

None. This is a refactoring that maintains the same API surface.

## Files Modified

### Frontend
- ✅ `/lib/constants/roles.ts` - NEW
- ✅ `/lib/auth-helpers.ts` - NEW  
- ✅ `/lib/route-guards.ts` - Simplified
- ✅ `/routes/_authenticated.tsx` - Updated imports
- ✅ `/routes/_authenticated/users/new.tsx` - Use ROLE_OPTIONS
- ✅ `/routes/_authenticated/users/$id.edit.tsx` - Use ROLE_OPTIONS
- ✅ `/routes/_authenticated/profile/index.tsx` - Updated imports
- ✅ `/routes/_authenticated/profile/edit.tsx` - Use helpers

### Backend
- ✅ `/migrations/1763398789_add_role_to_users.go` - Fixed collection name bug
