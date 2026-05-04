# Security & Environment Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Create `.env` File
Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### 3. Generate SECRET_KEY
Replace `CHANGE-THIS-IN-PRODUCTION` with a secure key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Add to `.env`:
```
SECRET_KEY=<generated-key>
```

### 4. Configure Environment Variables

**.env file (Development)**:
```
DEBUG=True
SECRET_KEY=<your-generated-secret-key>
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**.env file (Production)**:
```
DEBUG=False
SECRET_KEY=<your-production-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
```

### 5. Add `.env` to `.gitignore`
```
echo ".env" >> .gitignore
```

## Security Features Added

✅ **Environment Variables**: All sensitive config moved to `.env`
✅ **CSRF Protection**: CSRF tokens and trusted origins configured
✅ **XSS Protection**: XSS filter and CSP headers enabled
✅ **HTTPS Ready**: SSL settings for production
✅ **HSTS**: Security headers for HTTPS enforcement
✅ **Secure Cookies**: HTTPOnly, Secure, SameSite cookies
✅ **Input Validation**: Backend validation on all forms
✅ **CORS Security**: Restricted to allowed origins

## Common Environment Variables

| Variable | Default | Development | Production |
|----------|---------|-------------|-----------|
| `DEBUG` | False | True | False |
| `SECURE_SSL_REDIRECT` | False | False | True |
| `SESSION_COOKIE_SECURE` | False | False | True |
| `CSRF_COOKIE_SECURE` | False | False | True |
| `SECURE_HSTS_SECONDS` | 0 | 0 | 31536000 |

## Running the Application

```bash
# Development
DEBUG=True python manage.py runserver

# With environment file
python manage.py runserver
```

## Important Files to Keep Private

- `.env` - Never commit to version control
- `db.sqlite3` - Database file (add to .gitignore)
- `SECRET_KEY` - Always use environment variable

## Additional Security Tips

1. **Update SECRET_KEY regularly** in production
2. **Use HTTPS** in production (use Let's Encrypt for free SSL)
3. **Enable HSTS** in production (use SECURE_HSTS_PRELOAD)
4. **Monitor JWT tokens** - Set appropriate expiration times
5. **Enable 2FA** - Consider adding two-factor authentication
6. **Regular backups** - Backup database regularly
