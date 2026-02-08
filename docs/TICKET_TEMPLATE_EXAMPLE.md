# Jira Ticket Template - Integration-Ready Specification

## OBJECTIVE

Implement a robust, production-grade authentication flow using JWT.

## REPOSITORY CONTEXT

**Target Files**:

- `backend/app/auth/router.py` - Add login/logout endpoints.
- `backend/app/models/user.py` - Add password hashing methods.
- `backend/middleware/auth.py` - Create new JWT validation middleware
- `backend/models/user.py` - Add `is_admin` field to User model
- `frontend/src/services/api.js` - Update API client to include auth headers

**Related Components**:

- Frontend: `/frontend/src/components/auth/LoginForm.tsx`, `/frontend/src/context/AuthContext.tsx`
- Backend: `/backend/app/services/jwt_service.py`
- Database: `users` table needs `password_hash` column.

**Dependencies**:

- External: `PyJWT`, `passlib[bcrypt]`
- Internal: `FastAPI` app instance for route mounting.

## IMPLEMENTATION GUIDE

**Step 1: Backend Middleware**
- Create `backend/middleware/auth.py`
- Implement `@require_admin` decorator
- Validate JWT token from `Authorization: Bearer <token>` header
- Return 401 if invalid, 403 if not admin

**Step 2: Database Migration**
- Add `is_admin` boolean field to User model
- Create migration script in `backend/migrations/`
- Default existing users to `is_admin=False`

**Step 3: Protected Routes**
- Apply `@require_admin` decorator to all routes in `backend/routes/admin.py`
- Update route tests to include auth headers

**Step 4: Frontend Integration**
- Update `api.js` to read token from localStorage
- Add token to all requests in `Authorization` header
- Create `AuthContext` to manage login state
- Redirect to login if 401 response received

**Step 5: Configuration**
- Add `JWT_SECRET` to `.env.example`
- Document in README.md

## INTEGRATION SAFETY

**Files That Import This**:
- `backend/main.py` imports `backend/routes/admin.py`
- All admin components import `frontend/src/services/api.js`
- `backend/routes/auth.py` imports `backend/models/user.py`

**Breaking Change Risk**: MEDIUM
- Existing admin API calls will fail without auth token
- Frontend must be deployed simultaneously with backend

**Mitigation**:
- Add feature flag `ENABLE_AUTH` in settings (default: False)
- Deploy backend first with flag disabled
- Deploy frontend with auth implementation
- Enable flag in production after verification

## TESTING CHECKLIST
- [ ] Unit test: JWT token validation in middleware
- [ ] Unit test: `@require_admin` decorator behavior
- [ ] Integration test: Admin routes return 401 without token
- [ ] Integration test: Admin routes return 403 for non-admin users
- [ ] Integration test: Admin routes succeed with valid admin token
- [ ] Manual: Login flow works in UI
- [ ] Manual: Admin panel redirects to login when unauthenticated
- [ ] Manual: Non-admin users cannot access admin panel
