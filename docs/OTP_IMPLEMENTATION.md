# OTP Implementation Guide

## Overview
This document describes the production-grade One-Time Password (OTP) implementation for both registration and password reset flows.

## Architecture

### Security Pattern
The OTP system implements a secure pattern:
1. **Generation**: Random 6-digit OTP generated on request
2. **Hashing**: OTP hashed using bcrypt (10 salt rounds) before storage
3. **Storage**: Only the hashed OTP is stored in the database
4. **Transmission**: Plain OTP sent via email to the user
5. **Verification**: User submits plain OTP, compared against hash using bcrypt.compare()

### Why This Approach?
- **Protection**: If database is compromised, OTPs cannot be directly used (only hashes exist)
- **Efficiency**: No need for database storage of registration/reset data
- **Simplicity**: Clear separation of concerns (OTP verification from user action)
- **Stateless**: User can submit registration/password data with OTP verification

## Database Schema

### OTPs Table
```sql
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,  -- Bcrypt hashed OTP
    type VARCHAR(20) NOT NULL,        -- 'registration' or 'password_reset'
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
```

## Backend Implementation

### OTP Model (models/OTP.ts)
```typescript
class OTPModel {
    // Hash OTP before storing
    private static async hashOTP(otp: string): Promise<string>
    
    // Create new OTP with auto-hashing
    static async create(email: string, otpCode: string, type: 'registration' | 'password_reset'): Promise<void>
    
    // Verify submitted OTP against stored hash
    static async verify(email: string, otpCode: string, type: 'registration' | 'password_reset'): Promise<boolean>
    
    // Cleanup methods
    static async deleteExpired(): Promise<void>
    static async deleteByEmailAndType(email: string, type: string): Promise<void>
}
```

### Auth Controller

#### Registration Flow
1. **Send OTP** (`POST /auth/send-otp`)
   - Request: `{ email, type: 'registration' }`
   - Response: Success message
   - Action: Generates OTP, hashes it, stores in DB, sends email

2. **Verify OTP & Register** (`POST /auth/verify-otp`)
   - Request: `{ email, otp, type: 'registration', username, password }`
   - Response: Access token, refresh token, user data
   - Action: Verifies OTP hash, creates user, logs them in

#### Password Reset Flow
1. **Send OTP** (`POST /auth/send-otp`)
   - Request: `{ email, type: 'password_reset' }`
   - Response: Success message
   - Action: Generates OTP, hashes it, stores in DB, sends email

2. **Verify OTP & Reset Password** (`POST /auth/verify-otp`)
   - Request: `{ email, otp, type: 'password_reset', newPassword }`
   - Response: Success message
   - Action: Verifies OTP hash, updates password, marks OTP as used

## Frontend Implementation

### Auth Service (services/authService.ts)
```typescript
// Send OTP for registration
async sendRegistrationOTP(email: string): Promise<ApiResponse>

// Complete registration after OTP verification
async verifyRegistrationOTP(email: string, otp: string, username: string, password: string): Promise<AuthResponse>

// Send OTP for password reset
async sendPasswordResetOTP(email: string): Promise<ApiResponse>

// Verify OTP and reset password
async verifyPasswordResetOTP(email: string, otp: string, newPassword?: string): Promise<ApiResponse>
```

### Registration Pages
1. **RegisterPage**
   - Collects: username, email, password, confirmPassword
   - Action: Sends email to backend for OTP request
   - Navigation: → RegistrationOTPPage with email, username, password in state

2. **RegistrationOTPPage**
   - Collects: 6-digit OTP
   - Features: 5-minute countdown timer, resend OTP button
   - Action: Sends OTP + username + password to verify endpoint
   - Navigation: → Dashboard on success

### Password Reset Pages
1. **ForgotPasswordPage**
   - Collects: email
   - Action: Sends email to backend for OTP request
   - Navigation: → PasswordResetOTPPage with email in state

2. **PasswordResetOTPPage**
   - Collects: 6-digit OTP
   - Features: 5-minute countdown timer, resend OTP button
   - Action: Verifies OTP with backend
   - Navigation: → PasswordResetNewPage with email and OTP in state

3. **PasswordResetNewPage**
   - Collects: new password, confirm password
   - Features: Password strength validation, visibility toggle
   - Action: Sends new password + OTP to verify endpoint
   - Navigation: → LoginPage on success

## Email Templates

### OTP Email (emailService.sendOTPEmail)
Sends a formatted HTML email containing:
- Greeting with user's name (or 'User' if unknown)
- 6-digit OTP in a prominent display box
- 5-minute expiration notice
- Security warning about never sharing OTP
- Professional footer

## Data Flow Diagram

### Registration Flow
```
User Registration Form
    ↓
Send email → Backend generates OTP
    ↓
Hash OTP → Store hashed OTP in DB
    ↓
Send plain OTP via email
    ↓
User enters OTP
    ↓
Submit OTP + username + password
    ↓
Verify hash match
    ↓
Create user account
    ↓
Return tokens & auto-login
```

### Password Reset Flow
```
Forgot Password Form
    ↓
Send email → Backend generates OTP
    ↓
Hash OTP → Store hashed OTP in DB
    ↓
Send plain OTP via email
    ↓
User enters OTP
    ↓
User enters new password
    ↓
Submit OTP + new password
    ↓
Verify hash match
    ↓
Update user password
    ↓
Return success message
```

## Configuration

### Environment Variables
Ensure the following are set in `.env`:
```
VITE_API_URL=http://localhost:5000/api
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
OTP_EXPIRY=300  # 5 minutes in seconds
```

### OTP Expiry
- Default: 5 minutes (300 seconds)
- Configurable in database at creation time
- Expired OTPs are automatically cleaned up

## Error Handling

### Common Issues
1. **"OTP has expired"** - User took too long to enter OTP
   - Solution: Request a new OTP via resend button

2. **"Invalid OTP"** - Hash verification failed
   - Solution: Check entered OTP, request new one if needed

3. **"User already registered"** - Email exists in system
   - Solution: Use login or password reset flow

4. **"Password requirements not met"** - Weak password
   - Solution: Must have 6+ chars, uppercase, lowercase, number

## Testing the Flow

### Manual Testing Steps

#### Registration with OTP
```bash
1. Navigate to /register
2. Enter: username, email, password, confirm password
3. Click Register
4. Check email for OTP
5. Enter OTP on verification page
6. Should be logged in and redirected to dashboard
```

#### Password Reset with OTP
```bash
1. Navigate to /login
2. Click "Forgot password?"
3. Enter email
4. Check email for OTP
5. Enter OTP on verification page
6. Enter new password
7. Click Reset Password
8. Should be redirected to login
9. Login with new password
```

## Security Considerations

1. **HTTPS Only**: Ensure all endpoints use HTTPS in production
2. **Rate Limiting**: Implement rate limiting on OTP generation (prevent enumeration)
3. **OTP Resend**: Allow max 3-5 resend attempts
4. **Cleanup**: Run periodic job to delete expired OTPs
5. **Email Verification**: Mark email_verified=true only after OTP verification
6. **Password Strength**: Enforce strong password requirements
7. **Session Management**: Use secure tokens with appropriate expiry

## Future Improvements

1. Add OTP delivery via SMS (Twilio integration)
2. Implement rate limiting on OTP endpoints
3. Add OTP resend attempt counter
4. SMS notification for security alerts
5. Multi-factor authentication with OTP as second factor
6. Backup codes for account recovery

## Rollback Instructions

If issues arise, revert to previous implementation:
```bash
git revert <commit-hash>
```

The main commits are:
- `72f128b` - OTP model with bcrypt hashing
- `9a75a90` - Auth controller updates
- `5dcb5aa` - Auth service updates
- `ab70b6e` - Registration flow updates
- `c579e21` - Password reset flow updates

## Support

For issues or questions about the OTP implementation, check:
1. Email service logs
2. Database OTP table
3. Frontend console for API errors
4. Backend logs for validation failures
