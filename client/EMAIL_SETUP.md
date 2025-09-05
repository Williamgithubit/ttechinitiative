# Email Service Setup for Admission Notifications

This document explains how to set up the email service for sending admission ID notifications to applicants.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

3. **Configure Environment Variables**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## How It Works

1. **Form Submission**: When a user submits their admission application
2. **Application Processing**: The application is saved to Firebase
3. **Email Notification**: An email is automatically sent to the applicant containing:
   - Welcome message
   - Admission ID for tracking
   - Instructions on how to check application status
   - Next steps information

## Email Template Features

The email includes:
- Professional HTML formatting
- TTech Initiative branding
- Clear admission ID display
- Instructions for status checking
- Contact information
- Mobile-responsive design

## Testing

To test the email functionality:

1. Set up your environment variables
2. Submit a test application through the admission form
3. Check that the email is received
4. Verify all information is correct

## Troubleshooting

### Common Issues:

1. **Authentication Failed**:
   - Verify your email and password/app password
   - Ensure 2FA is enabled for Gmail
   - Check that the app password is correct

2. **Connection Timeout**:
   - Verify SMTP host and port
   - Check firewall settings
   - Ensure your hosting provider allows SMTP

3. **Email Not Received**:
   - Check spam/junk folder
   - Verify the recipient email address
   - Check email service logs

### Debug Mode:

Add this to your environment for debugging:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0  # Only for development
```

## Security Notes

- Never commit your `.env.local` file to version control
- Use app passwords instead of regular passwords
- Consider using environment-specific email addresses
- Monitor email sending limits to avoid being blocked

## Production Considerations

For production deployment:
- Use a dedicated email service (SendGrid, AWS SES, etc.)
- Set up proper DNS records (SPF, DKIM, DMARC)
- Monitor email delivery rates
- Implement email queuing for high volume
