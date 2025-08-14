# Environment Variables Setup Guide

This guide will help you set up all the necessary environment variables for your Recursion Explorer project.

## Quick Setup

### Option 1: Using the Setup Scripts (Recommended)

#### Windows Batch File
```bash
setup-env.bat
```

#### PowerShell Script
```powershell
.\setup-env.ps1
```

### Option 2: Manual Setup

1. Copy the example file:
   ```bash
   copy env.example .env
   ```

2. Edit the `.env` file with your specific values

## Environment Variables Overview

### 🔐 Backend Variables

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ **Already configured** | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-here-change-this-in-production` | **Yes - Change this!** |
| `JWT_EXPIRE` | JWT token expiration time | `7d` | No |
| `PORT` | Backend server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | No |

### 🌐 Frontend Variables

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` | No |
| `VITE_APP_NAME` | Application name | `Recursion Explorer` | No |
| `VITE_DEV_MODE` | Development mode flag | `true` | No |

### 📧 Email Configuration (Future Features)

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` | No |
| `EMAIL_PORT` | SMTP server port | `587` | No |
| `EMAIL_USER` | Email username | `your-email@gmail.com` | **Yes - If using email features** |
| `EMAIL_PASS` | Email app password | `your-app-password` | **Yes - If using email features** |

## Critical Security Steps

### 1. Change JWT Secret
**IMPORTANT**: The JWT secret is used to sign authentication tokens. You MUST change this to a secure random string.

```bash
# Generate a secure random string (32+ characters)
openssl rand -base64 32
```

Or use an online generator and update the `JWT_SECRET` in your `.env` file.

### 2. Update Email Credentials
If you plan to use email features:
- Set `EMAIL_USER` to your email address
- Set `EMAIL_PASS` to your email app password (not your regular password)

## Production Deployment

When deploying to production:

1. Set `NODE_ENV=production`
2. Use a production MongoDB URI
3. Set `FRONTEND_URL` to your production domain
4. Ensure `JWT_SECRET` is a strong, unique value
5. Consider using environment-specific `.env` files

## File Structure

```
recursion-explorer/
├── .env                    # Your actual environment file (create this)
├── env.example            # Template with all variables
├── backend/
│   └── env.example        # Backend-specific template
├── setup-env.bat          # Windows batch setup script
├── setup-env.ps1          # PowerShell setup script
└── ENV_SETUP.md           # This guide
```

## Troubleshooting

### Common Issues

1. **"MongoDB connection error"**
   - Check your `MONGODB_URI` is correct
   - Ensure MongoDB Atlas IP whitelist includes your IP

2. **"JWT verification failed"**
   - Verify `JWT_SECRET` is set correctly
   - Check token expiration with `JWT_EXPIRE`

3. **"CORS error"**
   - Ensure `FRONTEND_URL` matches your frontend URL exactly
   - Check that the backend is running on the correct port

### Verification

After setup, verify your configuration:

1. Start the backend: `cd backend && npm start`
2. Check console for "MongoDB connected successfully"
3. Start the frontend: `npm run dev`
4. Test API connection in browser console

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all required environment variables are set
3. Ensure no typos in variable names or values
4. Check that the `.env` file is in the root directory

---

**Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`. 