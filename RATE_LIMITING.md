# Rate Limiting Implementation

## Overview

Rate limiting has been implemented on the server to prevent abuse and ensure fair resource usage. This addresses the security vulnerability identified in CodeQL analysis where file system access routes were not rate-limited.

## Implementation Details

### Dependencies

- **express-rate-limit** (v8.2.1): Industry-standard rate limiting middleware for Express applications

### Rate Limiters

Three different rate limiters have been configured based on the sensitivity and resource intensity of different routes:

#### 1. General Limiter (Applied to all routes)
```javascript
windowMs: 15 minutes
max: 100 requests per IP
```
- Applies to all routes as a baseline protection
- Prevents general abuse while allowing normal usage
- Returns standard rate limit headers

#### 2. API Write Limiter (Applied to POST endpoints)
```javascript
windowMs: 15 minutes
max: 50 requests per IP
```
- Applied to:
  - `/api/media/upsert` - Media metadata updates
  - `/api/media/autogen` - Automatic hotspot generation
- More restrictive than general limiter
- Protects write operations and resource-intensive operations

#### 3. Static File Limiter (Applied to catch-all route)
```javascript
windowMs: 1 minute
max: 30 requests per IP
```
- Applied to:
  - Production catch-all route (`app.get("*", ...)`) that serves the React app
- Shorter window with reasonable limit
- Specifically addresses the CodeQL security finding about unprotected file system access

## Rate Limit Headers

All responses include standard rate limit headers:

- `RateLimit-Policy`: The rate limit policy (e.g., "100;w=900")
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in current window
- `RateLimit-Reset`: Seconds until the rate limit resets

## Error Responses

When rate limit is exceeded, clients receive:

**HTTP Status**: 429 (Too Many Requests)

**JSON Response**:
```json
{
  "ok": false,
  "error": "Too many requests, please try again later."
}
```

Or for API write operations:
```json
{
  "ok": false,
  "error": "Too many API write requests, please try again later."
}
```

## Testing

The rate limiting can be tested by:

1. **Manual Testing**:
   ```bash
   # Check rate limit headers
   curl -I http://localhost:8787/api/health
   
   # Make multiple requests to trigger rate limit
   for i in {1..110}; do curl http://localhost:8787/api/health; done
   ```

2. **Production Monitoring**:
   - Monitor 429 response codes in server logs
   - Track rate limit header values
   - Adjust limits based on legitimate traffic patterns

## Configuration

Rate limits can be adjusted by modifying the values in `server/index.js`:

- `windowMs`: Time window in milliseconds
- `max`: Maximum requests per IP per window
- `standardHeaders`: Include standard rate limit headers (recommended: true)
- `legacyHeaders`: Include legacy X-RateLimit-* headers (recommended: false)

## Best Practices

1. **Monitor Traffic**: Adjust limits based on actual usage patterns
2. **IP-based Limiting**: Default implementation uses IP addresses - consider adding user-based limiting for authenticated routes
3. **Whitelist**: Consider implementing IP whitelisting for trusted sources if needed
4. **Load Balancer**: If behind a proxy/load balancer, configure `trust proxy` in Express
5. **Redis Store**: For production with multiple servers, consider using a shared Redis store for rate limiting

## Security Impact

✅ **Resolved**: CodeQL alert `js/missing-rate-limiting`  
✅ **Protected**: Static file serving route (line 175)  
✅ **Protected**: API write endpoints  
✅ **Protected**: All routes with baseline general limiter  

## Related Files

- `server/index.js`: Main implementation
- `server/package.json`: Dependencies
- `package-lock.json`: Locked dependency versions
