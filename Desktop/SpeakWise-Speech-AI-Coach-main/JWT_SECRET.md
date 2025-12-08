# 🔐 JWT Secret Key for Render

**Generated:** November 26, 2025  
**Purpose:** Authentication token signing

---

## 🔑 Your JWT Secret Key:

```
f37df15fd3f20f0eb2d2045e571bbec1ea7b8dc221a17f2fb0b6971c893f4becf05a704e694d435d2df374688b5d551bf125e929fabef83e6fa16c4bbd3f6dc3
```

---

## ✅ Add This to Render Now:

1. Go to: **https://dashboard.render.com**
2. Click: **`speakwise-backend-yuh6`**
3. Go to: **Environment** tab
4. Click: **"Add Environment Variable"**
5. Add:
   ```
   Key: JWT_SECRET
   Value: f37df15fd3f20f0eb2d2045e571bbec1ea7b8dc221a17f2fb0b6971c893f4becf05a704e694d435d2df374688b5d551bf125e929fabef83e6fa16c4bbd3f6dc3
   ```
6. Click: **"Save Changes"**
7. Wait 2-3 minutes for redeploy

---

## ⚠️ IMPORTANT: Security Note

- **Keep this secret!** Never share it publicly
- This key is used to sign authentication tokens
- Without it, user login/signup won't work
- If compromised, generate a new one and update

---

## 📋 Complete Render Environment Variables:

After adding JWT_SECRET, you should have:

1. **MONGODB_URI** ✓
2. **JWT_SECRET** ← ADD THIS NOW
3. **GOOGLE_CREDENTIALS_BASE64** ✓
4. **GEMINI_API_KEY** ✓
5. **PORT** ✓
6. **NODE_ENV** ✓
7. **CORS_ORIGIN** ← Also update to: `https://speak-wise-speech-ai-coach.vercel.app`

---

## 🚀 Next Steps:

1. **Add JWT_SECRET** to Render (use the key above)
2. **Update CORS_ORIGIN** to your Vercel URL
3. **Fix Vercel build settings** (remove custom install/build commands)
4. **Add VITE_API_URL** to Vercel
5. **Redeploy** both services
6. **Test** the application

---

**Copy the JWT secret from above and add it to Render now!** 🔐
