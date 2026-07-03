# PAZ Thriving Tribe - Development Environment Setup

## 🚀 Quick Start (Windows)

### Option 1: Easy - Using Batch File (Recommended)
```bash
# Just double-click this file in File Explorer:
start-dev.bat
```
This will automatically start both servers in separate windows.

### Option 2: Manual - Using Two Terminals
**Terminal 1: Start API Server**
```bash
npm run dev:api
```
You should see:
```
╔════════════════════════════════════════════════════════════╗
║  PAZ Thriving Tribe - Development API Server              ║
║  Running on http://localhost:3001                         ║
║  ...
╚════════════════════════════════════════════════════════════╝
```

**Terminal 2: Start Vite Server**
```bash
npm run dev
```
You should see:
```
  VITE v8.0.14  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Option 3: Single Terminal (Node.js only)
```bash
node start-dev-servers.js
```
This starts both servers in the same terminal.

## 📋 What Gets Started

### API Development Server (Port 3001)
- Runs on: `http://localhost:3001`
- Handles: `/api/send-notification-email` requests
- Validates email format
- Returns mock success responses for testing
- Logs all subscription attempts

### Vite Development Server (Port 5173)
- Runs on: `http://localhost:5173`
- Serves your React application
- Auto-reloads on file changes
- Proxies API requests to port 3001

## 🧪 Testing the Feature

1. **Ensure both servers are running**
   - API Server: Port 3001 ✓
   - Vite Server: Port 5173 ✓

2. **Navigate to a Coming Soon page**
   - Visit: `http://localhost:5173/services/family`
   - Or any other coming soon page

3. **Test the Email Submission**
   - Click "Get Notified" button
   - Enter your email: `test@example.com`
   - Click "Send"
   - Should see success message ✓
   - Should redirect to home page ✓

4. **Check the Console**
   - Both console logs should show request details:
   ```
   ✓ [DEV API] Email subscription recorded: test@example.com for service: Thriving Parents
   ```

## ⚙️ How It Works

```
Browser Request
    ↓
Vite Dev Server (localhost:5173)
    ↓
Proxy Rule: /api → localhost:3001
    ↓
API Dev Server (localhost:3001)
    ↓
Validates Email
    ↓
Returns JSON Response
    ↓
Browser Shows Success/Error Message
    ↓
Redirects to Home
```

## 📝 Logs You'll See

### Success
```
✓ [DEV API] Email subscription recorded: user@example.com for service: Thriving Parents
```

### Validation Error
```
✗ [DEV API] Invalid email validation
```

### Missing Fields
```
✗ [DEV API] Missing required fields
```

## 🐛 Troubleshooting

### "Cannot find module" Error
```
Error: Cannot find module 'http'
```
**Solution:** This means you're not in the right directory. Run:
```bash
cd "c:\Users\AG AfahaEKET\Documents\JOHNSON'S DOC\PAZ\pazthrivingtribe"
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Another process is using port 3001. Either:
- Close the other process
- Kill the process: `npx kill-port 3001`
- Use a different port (edit vite.config.js and api-dev-server.js)

### "Cannot find npm"
**Solution:** Install Node.js from https://nodejs.org

### API requests still returning 404
**Solution:** 
1. Check if API server is running on port 3001
2. Check if Vite proxy is configured correctly in `vite.config.js`
3. Check browser console for network errors
4. Restart both servers

### Email won't submit
**Solutions:**
1. Email must be valid format: `username@domain.com`
2. Try clearing browser cache (Ctrl+Shift+Delete)
3. Check browser console for errors
4. Verify API server is running

## 🔄 Stopping the Servers

- **Batch file**: Close the windows or press Ctrl+C
- **Manual terminals**: Press Ctrl+C in each terminal
- **Combined terminal**: Press Ctrl+C once

## 🌐 Production Deployment

When you deploy to Vercel:
1. Delete or ignore: `api-dev-server.js`, `start-dev-servers.js`, `start-dev.bat`
2. Vercel will automatically use the `/api` Vercel Functions
3. Everything will work exactly as configured

## 📚 API Documentation

### POST /api/send-notification-email

**Request:**
```json
{
  "email": "user@example.com",
  "service": "Thriving Parents",
  "timestamp": "2024-07-03T10:30:00Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you for subscribing! Check your email for confirmation.",
  "data": {
    "email": "user@example.com",
    "service": "Thriving Parents",
    "subscribedAt": "2024-07-03T10:30:00Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Invalid email address" 
}
```

## 💡 Tips

- Keep the API server running in the background while developing
- The batch file is the easiest way for Windows users
- Check both console logs when debugging issues
- Email validation is done both on frontend and backend

## 🚀 Next Steps

1. Start the development servers
2. Test the "Get Notified" feature
3. When satisfied, commit your changes
4. Deploy to Vercel - it will use the real `/api` Vercel Functions
5. In production, remove the dev server files from deployment

---

**Last Updated:** 2026-07-03
**Status:** ✅ Ready for Testing
