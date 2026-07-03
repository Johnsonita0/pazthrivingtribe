# Quick Reference - Get Notified Feature

## ⚡ Quick Start

### Windows Users (Easiest)
```bash
# Just double-click:
start-dev.bat
```

### Manual Start (Any OS)
```bash
# Terminal 1: Start API Server
npm run dev:api

# Terminal 2: Start Vite Server  
npm run dev
```

## 🧪 Test the Feature

1. Visit: `http://localhost:5173/services/family`
2. Click "Get Notified" button
3. Enter email: `test@example.com`
4. Click "Send"
5. ✅ Should see success message + redirect to home

## 📋 Files Overview

| File | Purpose |
|------|---------|
| `src/ComingSoonPage.jsx` | Main "Get Notified" modal |
| `src/GetNotifiedModal.jsx` | Reusable component |
| `api/send-notification-email.js` | Email endpoint |
| `api-dev-server.js` | Dev API server (port 3001) |
| `vite.config.js` | Proxy config for dev |

## 🚀 Development Scripts

```bash
npm run dev              # Start Vite only (5173)
npm run dev:api         # Start API server only (3001)
npm run dev:all         # Start both (may not work on all systems)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Check code quality
```

## 🔌 Server Ports

| Server | Port | Purpose |
|--------|------|---------|
| API Dev | 3001 | Handles /api requests |
| Vite | 5173 | Frontend dev server |

## ✅ Email Validation Rules

**Valid:**
- ✅ `user@example.com`
- ✅ `john.doe@company.co.uk`
- ✅ `user+tag@domain.com`

**Invalid:**
- ❌ `notanemail`
- ❌ `user@`
- ❌ `@example.com`
- ❌ `user @domain.com` (space)

## 📝 API Endpoint

```
POST /api/send-notification-email

Request:
{
  "email": "user@example.com",
  "service": "Thriving Parents",
  "timestamp": "2024-07-03T10:30:00Z"
}

Response (Success):
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

## 🔧 Common Tasks

### View API Logs
Keep the API dev server terminal open and watch for:
```
✓ [DEV API] Email subscription recorded: email@address.com for service: Service Name
```

### Stop Servers
- Press `Ctrl+C` in each terminal

### Change Port
Edit in `api-dev-server.js` and `vite.config.js`:
```javascript
const PORT = 3001; // Change to 3002, 3003, etc.
```

### Test with Different Email
Just type any valid email in the modal (e.g., `your-name@gmail.com`)

## 📚 Documentation Files

1. **IMPLEMENTATION_COMPLETE.md** - Full summary (you are here)
2. **DEVELOPMENT_SETUP.md** - Detailed dev setup guide
3. **GET_NOTIFIED_SETUP.md** - Feature setup & customization
4. **TESTING_CHECKLIST.md** - Complete testing guide

## 🐛 If Something Goes Wrong

### "Cannot GET /api/send-notification-email"
→ API server not running on port 3001

### "Port 3001 in use"
→ Another process using that port
→ Kill it: `npx kill-port 3001`

### Email validation error on valid email
→ Clear browser cache (Ctrl+Shift+Delete)
→ Reload page

### Build fails
→ Run: `npm install`
→ Then: `npm run build`

## ✨ Features

- ✅ Beautiful modal dialog
- ✅ Real-time email validation
- ✅ Success/error messages
- ✅ Auto-redirect to home
- ✅ Responsive design
- ✅ Development API server
- ✅ Production ready

## 🎯 Next Steps

1. Test the feature locally ✓ (Already running)
2. Customize look/feel if needed
3. Deploy to Vercel: `git push`
4. Enable email service (Resend) if desired
5. Share with team!

## 💡 Pro Tips

- Keep API server running in background while developing
- Use batch file for easiest startup on Windows
- Check both console logs when debugging
- Test with various email formats
- Watch the API server logs to confirm submissions

---

**API Server Status:** ✅ Running on http://localhost:3001
**Last Updated:** 2026-07-03
