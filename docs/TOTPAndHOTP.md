# HOTP vs TOTP: One-Time Password Algorithms

HOTP and TOTP are authentication algorithms that generate one-time passwords (OTPs) for two-factor authentication (2FA). The key difference is how they generate codes and their validity periods.

## HOTP (HMAC-based One-Time Password)

**How it works:** Uses a counter that increments each time you generate a new code.

**Example:** Hardware security tokens like RSA SecurID fobs where you press a button to generate a new 6-digit code.

**Key characteristics:**

- Code remains valid until used or a new one is generated
- Requires button press or manual action to generate new code
- Both client and server must keep counters synchronized
- More vulnerable to replay attacks due to longer validity period

**Standard:** RFC 4226

## TOTP (Time-based One-Time Password)

**How it works:** Uses current time divided by a time interval (usually 30 seconds) as the counter.

**Example:** Authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator that show a 6-digit code that changes every 30 seconds.

**Key characteristics:**

- Code is valid for only 30-60 seconds
- Automatically generates new codes without user action
- Requires accurate time synchronization between client and server
- More secure due to short validity window

**Standard:** RFC 6238

## Quick Comparison

| Aspect               | HOTP                             | TOTP                      |
| -------------------- | -------------------------------- | ------------------------- |
| **Trigger**          | Button press/manual action       | Time-based (auto-refresh) |
| **Validity**         | Until used or new code generated | 30-60 seconds             |
| **Example**          | RSA SecurID hardware token       | Google Authenticator app  |
| **Security**         | Moderate (longer validity)       | Higher (short validity)   |
| **Sync Requirement** | Counter synchronization          | Time synchronization      |
| **Common Usage**     | Hardware tokens, less common     | Mobile apps, widely used  |

## Real-World Examples

**HOTP Example:**

```
User presses button on hardware token
→ Token generates: 123456
→ Code stays valid until used or next button press
→ User can take their time to enter it
```

**TOTP Example:**

```
09:30:00 - App shows: 567890 (valid for 30 seconds)
09:30:30 - App shows: 234567 (new code, old one expired)
09:31:00 - App shows: 789012 (another new code)
```

**Why TOTP is preferred:** Most modern 2FA implementations use TOTP because the short validity window makes intercepted codes useless within seconds, significantly improving security against phishing and replay attacks.
