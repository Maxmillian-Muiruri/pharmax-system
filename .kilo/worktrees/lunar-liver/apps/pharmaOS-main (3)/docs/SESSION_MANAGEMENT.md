# Session Management Documentation

## Overview

This application uses a **dual-token JWT authentication** system with automatic session refresh to ensure users maintain their sessions without unexpected logouts.

## Architecture

### Token Types

1. **Access Token** (short-lived)
   - Expires in: 1 day (configurable via `JWT_ACCESS_EXPIRES_IN`)
   - Used for: All API requests
   - Stored in: `localStorage`
   - Type claim: `{ type: 'access' }`

2. **Refresh Token** (long-lived)
   - Expires in: 30 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
   - Used for: Obtaining new access tokens
   - Stored in: `localStorage`
   - Type claim: `{ type: 'refresh', jti: '<unique-id>' }`
   - Features: Token rotation on each refresh

## Backend Implementation

### Token Generation

**Location**: `backend/src/controllers/auth.js`

```javascript
// Access token (1 day default)
function signAccessToken(userId) {
  return jwt.sign(
    { sub: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d' }
  )
}

// Refresh token (30 days default)
function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, type: 'refresh', jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  )
}
```

### Token Blacklist

An in-memory token blacklist prevents token reuse after logout:

- Tokens are blacklisted on logout
- Blacklist is checked on every authenticated request
- Automatically cleared every hour to prevent memory bloat
- **Production note**: Replace with Redis for multi-instance deployments

### Refresh Endpoint

**Route**: `POST /api/auth/refresh`

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "new-access-token",
    "refreshToken": "new-refresh-token",
    "user": { ... }
  }
}
```

**Security Features**:
- Token rotation: Each refresh issues new tokens and invalidates the old one
- Type validation: Ensures only refresh tokens can refresh
- User verification: Checks user still exists and is active
- Blacklist check: Prevents use of blacklisted tokens

## Frontend Implementation

### Automatic Token Refresh

The system handles session maintenance through three mechanisms:

#### 1. Reactive Refresh (on 401 error)

**Location**: `frontend/src/services/api.js`

When any API request receives a 401 response:
1. Checks if a refresh token exists
2. Calls `/auth/refresh` to get new tokens
3. Retries the original request with new token
4. Queues concurrent requests during refresh
5. Redirects to login only if refresh fails

```javascript
// Request queuing prevents race conditions
let isRefreshing = false
let failedQueue = []

// Multiple 401s queue up and resolve with same new token
```

#### 2. Proactive Refresh (before expiry)

**Location**: `frontend/src/context/AuthContext.jsx`

Decodes the JWT expiry timestamp and automatically refreshes 2 minutes before expiration:

```javascript
const timeUntilExpiry = decoded.exp - currentTime
const refreshTime = Math.max(0, (timeUntilExpiry - 120) * 1000)

setTimeout(async () => {
  // Refresh tokens silently
}, refreshTime)
```

#### 3. Session Recovery on Page Load

When the app loads:
1. Reads tokens from `localStorage`
2. Calls `/auth/me` to verify session
3. If verification fails, interceptor attempts refresh
4. If refresh fails, clears auth and redirects to login

### Storage

All tokens are stored in `localStorage`:
- Key: `token` (access token)
- Key: `refreshToken` (refresh token)

## Security Considerations

### Token Rotation

Every refresh operation:
1. Blacklists the old refresh token
2. Issues a new access token
3. Issues a new refresh token
4. Prevents token replay attacks

### Logout Flow

1. Client sends both tokens to `/auth/logout`
2. Server blacklists both tokens
3. Client clears `localStorage`
4. Tokens cannot be reused even if intercepted

### Production Recommendations

1. **Use Redis for token blacklist**
   - Current: In-memory Set (lost on restart)
   - Production: Redis shared across instances

2. **Set different secrets**
   ```bash
   JWT_SECRET=<random-64-chars>
   JWT_REFRESH_SECRET=<different-random-64-chars>
   ```

3. **Consider HTTP-only cookies**
   - More secure against XSS
   - Requires CSRF protection
   - Current: localStorage (easier implementation)

4. **Adjust token lifetimes**
   - High security: Access=15m, Refresh=7d
   - Balanced: Access=1h, Refresh=30d
   - Current: Access=1d, Refresh=30d

## Environment Variables

### Backend (.env)

```bash
# Required
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Optional (defaults shown)
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="30d"
```

**Generate secure secrets**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login and get tokens |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Invalidate tokens |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `INVALID_TOKEN` | 401 | Token is invalid |
| `TOKEN_BLACKLISTED` | 401 | Token was invalidated |
| `INVALID_TOKEN_TYPE` | 401 | Wrong token type used |
| `USER_NOT_FOUND` | 401 | User no longer exists |
| `ACCOUNT_DISABLED` | 403 | User account is disabled |

## User Experience

### Session Behavior

- **Active usage**: Sessions persist indefinitely (auto-refresh)
- **Inactive 1-29 days**: Session refreshes on next request
- **Inactive 30+ days**: Must log in again (refresh expired)
- **Account disabled**: Immediate logout
- **Password change**: Must log in again (user verified on each request)

### No Unexpected Logouts

The system prevents logouts by:
1. Refreshing before access token expires
2. Refreshing on demand if expired
3. Only logging out on explicit action or 30+ days inactivity

## Troubleshooting

### Users getting logged out unexpectedly

**Cause**: Missing or corrupted refresh token
**Fix**: Clear browser localStorage and log in again

### Refresh endpoint returning 401

**Cause**: Refresh token expired or blacklisted
**Fix**: User must log in again

### Multiple instances losing sessions

**Cause**: In-memory blacklist not shared
**Fix**: Implement Redis blacklist for production

## Migration Notes

### From old single-token system

The system is backward compatible:
- Old tokens without `type` claim will be rejected
- Users with old tokens will be logged out on next request
- No database migration required

**To force migration**:
1. Change `JWT_SECRET` to invalidate all existing tokens
2. Users will be prompted to log in with new token system
