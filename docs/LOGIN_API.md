# Login API — Dummy Payload Reference

> For the backend team. All payloads below are what the mobile app expects.  
> Base URL: `https://api.kisansahakar.in/v1`

---

## 1. Send OTP

**POST** `/auth/send-otp`

### Request
```json
{
  "mobile": "9876543210",
}
```

### Response — Success
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpExpiresIn": 30
}
```

<!-- ### Response — Error (already registered)
```json
{
  "success": false,
  "code": "ALREADY_REGISTERED",
  "message": "Mobile number already registered. Please login."
}
``` -->

---

## 2. Verify OTP

**POST** `/auth/verify-otp`

### Request
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

### Response — Driver (Equipment Operator)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU1ItMDAxIiwicm9sZSI6ImRyaXZlciIsImlhdCI6MTcwMDAwMDAwMH0.dummy_signature",
  "refreshToken": "ksd-refresh-token-driver-001",
  "user": {
    "id": "USR-001",
    "mobile": "+919876543210",
    "name": "Ramesh Patil",
    "role": "driver",
    "profileStatus": "incomplete",
    "kycStatus": "pending",
    "createdAt": "2024-10-01T10:00:00Z"
  }
}
```

### Response — Gig Worker (Farm Labour)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU1ItMDAyIiwicm9sZSI6Imdpd1dvcmtlciIsImlhdCI6MTcwMDAwMDAwMH0.dummy_signature",
  "refreshToken": "ksd-refresh-token-gigworker-002",
  "user": {
    "id": "USR-002",
    "mobile": "+919876543211",
    "name": "Suresh Kumar",
    "role": "gigWorker",
    "profileStatus": "incomplete",
    "kycStatus": "pending",
    "createdAt": "2024-10-01T11:00:00Z"
  }
}
```

### Response — Error (wrong OTP)
```json
{
  "success": false,
  "code": "INVALID_OTP",
  "message": "The OTP entered is incorrect. Please try again."
}
```

### Response — Error (OTP expired)
```json
{
  "success": false,
  "code": "OTP_EXPIRED",
  "message": "OTP has expired. Please request a new one."
}
```

---

## 3. Refresh Token

**POST** `/auth/refresh-token`

### Request
```json
{
  "refreshToken": "ksd-refresh-token-driver-001"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_payload.new_signature",
  "refreshToken": "ksd-refresh-token-driver-001-renewed"
}
```

---

## 4. Logout

**POST** `/auth/logout`

### Headers
```
Authorization: Bearer <token>
```

### Request
```json
{
  "refreshToken": "ksd-refresh-token-driver-001"
}
```

### Response
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Role Reference

| Value        | Description                                  | App Flow                                  |
|--------------|----------------------------------------------|-------------------------------------------|
| `driver`     | Equipment operator (tractor, harvester, etc.)| HomeScreen → Booking requests, earnings   |
| `gigWorker`  | Farm labour (transplanting, harvesting, etc.)| GigHomeScreen → Available gigs, my jobs   |

> **Critical:** The `role` field in the `/auth/verify-otp` response determines which UI the app loads. Make sure this is returned correctly from the server.

---

## Auth Headers (for all protected endpoints)

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Notes for Backend Team

1. `role` must be one of: `"driver"` or `"gigWorker"` (camelCase).
2. `profileStatus` can be `"incomplete"` | `"complete"`.
3. `kycStatus` can be `"pending"` | `"under_review"` | `"approved"` | `"rejected"`.
4. OTP validity window: **30 seconds** (as shown in the app timer).
5. JWT token expiry: recommended **24 hours**; refresh token: **30 days**.
