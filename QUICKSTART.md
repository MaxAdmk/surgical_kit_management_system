# Quick Start Guide - Backend Setup

## Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- Django 6.0.4
- Django REST Framework
- JWT Authentication
- CORS Headers
- python-decouple (for environment variables)

## Step 2: Create `.env` File

```bash
cp .env.example .env
```

## Step 3: Generate Secret Key

Run this command to generate a secure SECRET_KEY:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and update your `.env` file:

```
SECRET_KEY=<paste-the-generated-key-here>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Step 4: Run Migrations

```bash
python manage.py migrate
```

## Step 5: Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

## Step 6: Run Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

---

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## Testing Login/Registration

### Test Registration:
1. Go to http://localhost:5173
2. Click "Register"
3. Fill in the form with:
   - Name: John Doe
   - Email: john@example.com
   - Password: SecurePass123!
   - Position: Nurse
   - Hospital ID: 1

### Test Login:
1. Use the credentials from registration
2. You should be redirected on successful login

---

## Production Checklist

Before deploying to production:

- [ ] Generate a new SECRET_KEY
- [ ] Set `DEBUG=False`
- [ ] Set `SECURE_SSL_REDIRECT=True`
- [ ] Set `SESSION_COOKIE_SECURE=True`
- [ ] Set `CSRF_COOKIE_SECURE=True`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Enable `SECURE_HSTS_SECONDS` (31536000)
- [ ] Update `CORS_ALLOWED_ORIGINS` with your domain
- [ ] Use HTTPS (Let's Encrypt certificate)
- [ ] Database: Switch from SQLite to PostgreSQL
- [ ] Use Redis for session/cache
- [ ] Enable email verification
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerts

---

## Environment Variables Reference

### Development (.env)
```
DEBUG=True
SECRET_KEY=your-development-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
ACCESS_TOKEN_LIFETIME=5
REFRESH_TOKEN_LIFETIME=1
```

### Production (.env)
```
DEBUG=False
SECRET_KEY=your-production-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
ACCESS_TOKEN_LIFETIME=30
REFRESH_TOKEN_LIFETIME=7
```

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'decouple'"
```bash
pip install python-decouple
```

### "ModuleNotFoundError: No module named 'rest_framework'"
```bash
pip install -r requirements.txt
```

### CORS Errors
Make sure `CORS_ALLOWED_ORIGINS` in `.env` matches your frontend URL.

### 403 CSRF Token Missing
Ensure `CSRF_TRUSTED_ORIGINS` is configured correctly in settings.

---

## Need Help?

- Check `.env` file exists and is configured
- Verify all dependencies are installed: `pip list`
- Check Django migrations: `python manage.py showmigrations`
- Run tests: `python manage.py test`
