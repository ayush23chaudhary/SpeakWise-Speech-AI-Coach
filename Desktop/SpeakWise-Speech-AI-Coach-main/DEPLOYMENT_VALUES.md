# 🚀 SpeakWise Deployment Values

**Date:** November 26, 2025  
**Repository:** https://github.com/ayush23chaudhary/SpeakWise-Speech-AI-Coach

---

## 📋 Copy These Values for Deployment

### 🔴 **STEP 1: Deploy Backend to Render**

#### Go to: https://render.com/dashboard

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** → Select GitHub → Authorize Render
3. Select repository: **`ayush23chaudhary/SpeakWise-Speech-AI-Coach`**

#### Configure Build Settings:
```
Name: speakwise-backend (or any name you like)
Region: Choose closest to you
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
```s

#### Add Environment Variables:
Click **"Advanced"** → **"Add Environment Variable"** and add each of these:

**1. MONGODB_URI**
```
mongodb+srv://akshat:$b2z4nwAKSHAT@speakwise-cluster.uuhgeb8.mongodb.net/speakwise?retryWrites=true&w=majority
```

**2. JWT_SECRET**
```
your-super-secret-jwt-key-change-this-in-production-2024
```

**3. GOOGLE_CREDENTIALS_BASE64** (Copy the entire block below)
```
ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAic3BlYWt3aXNlLTQ3ODIxNiIsCiAgInByaXZhdGVfa2V5X2lkIjogImQ2ZTFmMjY0MDI5MzFjZGQyOTViODY5NmU2MmQ1YWJjZmQ4YmVkZjEiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRGJDSCt0TUNCbUIzMjVcbkJqNzdFVVRKWnlVOVhFWEx5RnZXZGNiSmgvTXU4Tjd5SUswZkV2eEdKR2pnTWl5bW5paWdmalRyeHozQ3RQMXhcbjRXWDd6biswTlJTREtrTTJqRVFOcVlIZExrNGFUb01STG50S25qMENQWjZLaFRCL0ZrQkJrVTBMWGlUcmdMcnpcblpGQUNUbU9YYk5GV3FqcUU5bFBQR3BwbkdMeFNROGhiTlU5QzlzalBvMkgrVDBVR05zYzNJT0NJSXRMUnBRa3BcbmpjTFd4RHNYQzJaMyt3ZU1OeU1na1loZTZZUjFPaXZNd1hDM3NNKzkwQ2ZIc2V5Z20vbVF0eXg3c0U0cFQ5TDJcbkV2RmdoNDlrMnYwWFFLR08rS2R6TFpLdyt2LzlzR0RqbTc1QUF5MVE5ZFhjY0lPTkQ1aFRxdjV0M2xDc3lmRVBcblZ4ZkE0bFpiQWdNQkFBRUNnZ0VBR1cwQ0lvdVIvSkM2dDhObTJqbVFuNW5qODhjd3FhTG5nNXl4RW15VlU5OU5cbmgyazRUNEYzc1hqQk1vMVYxajJlZjdXY0ttYVFOU0w4d2hSNmhJd3pFaXM3UEsxU1FoUnU3ZkJvWW53MmxYZlpcbnRTRTMyZ1h4RlJVc0ZlNWlIbmsvR2tnUXNTb2c1UW1tS2d6Uis0S05XR0wwWmcxbFg2YVhQS3BjNld6YlVqMHBcbngwTE5PUHM4OFV5R05jU0xtT1pDSjRwV0FPSVI1ZlE3dFdGMnN6eWt3K25rdG4zMVRDTG05ekk4NGdFSFg2WFZcblBWSVlLWHBJWDdmYWVnOVNsOEZlQW9qcmJwSzJmbkNlWEkzY0VhZmlOUWF1L09jaHNOVzFjYVkrK0FvczJNQ25cbjFaVkRFNThZaUtYWEgvUVVRRjRpNTVpRkJ6TUpxbFV1NkZHcy9uc0llUUtCZ1FEdE5vOHVLTGVudmc4NlRFOFdcblEvUlFUTDA5K2Z4QzRCSFFmZGFvd0JVMlFIRGNkSVgwd0FaLzRIekhKbXB4WS9iY1dnY2t4SXJhVVdnQ2pHL0RcbjdHL21xelRORy9qdnEreVYwdG81c3ZXYWFEOGE2d0JjSE1HdHNzNzhqV0pVMERtN05BMmoxZVRRdDZrVC90QUdcblhNbTRNQVV5L3UyRkI4SW5ObVFVdjVEOGRRS0JnUURzWVZpQkdsSWlCc1hDeDVGSzhWbzRRL3U5QWh0aTg5TkNcbkNkem1UNWpkb05IUkR3V0toYWIrVTduWi9ZaHFvdVR5bEZnbEliMHFZTE01VFJtT0NJampud2FLYXg1dEovckFcbkRjR25NY2ljRURnd1FXRWdxdVFLYmc5bDExK29ZRGF1UlE5YXBVVWNRY1lzMHczS0Zqbk84UmMxYmhCQWQwVnFcbm5JekNydG50andLQmdBRzUvTzdNRXhJZ2V3SGtua3ErTWVBSHZ2VGRoZTJDcmY2RGUvVjhlR3NOcXdTZndIM1lcbmkvT1FVYmd0V21iNjRFZ1lTNmNEMnpMZGx0RTE3blpSbVRybmtoblFFMDdEUkpTT2xWSUlNR3R3U00xTVdwTlJcbkRrUFNZbGxLT2lYOTRmMnYwazJYOS9OZzh0VVhiTEl2S0xTemZNWXpQczFTRWlLdzdhZU5BV1FsQW9HQkFKdzFcbk5GU1V2VVFwTDVVcFp0V2NxMTlWWmMyZ3o5SlRpUDh5SDEyL3FpaUQ5MFB0Wmw4Rk5iY0tRMTVRVWs4TitMaHBcbjJkb244cWRIb2dpeTc3bFI0SXh6Y2RJVk9kVXV2MkVkZGlUMEhEc3Q2TVBTNE1uQ3hOSXpxMDlFeGIweVg5QklcbmFQNGhDNHZCMTZHVms1NUJrOUF5dUlDaGpISGRuK3oxS1h3YUtuLzNBb0dBSVU0dmRCODNCekxNdUtRUGtjeVFcbklobks2anVBQnR4MWVBNjNVdms1N2JaaG5DWDVCWkQvTHNib1VDRmNHTy85bi9SS0JNR25keGdzVTdmS0ZRblFcbjlpNGg3M2EwWklMMmJKS05yMVk2ODQyQzgyS0dwQ0lHWlRQM0g3M00vRDVDbjB0ME9SRmpjb1l4amVmRjQ5NG5cbmlJOUlyYjJaZE03WnFTQms1MlAwY2lNPVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogInNwZWFrd2lzZUBzcGVha3dpc2UtNDc4MjE2LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAiY2xpZW50X2lkIjogIjEwMzU5OTMxMzA2MTExMTY1OTQ5MSIsCiAgImF1dGhfdXJpIjogImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwKICAidG9rZW5fdXJpIjogImh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwKICAiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS9jZXJ0cyIsCiAgImNsaWVudF94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3JvYm90L3YxL21ldGFkYXRhL3g1MDkvc3BlYWt3aXNlJTQwc3BlYWt3aXNlLTQ3ODIxNi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQo=
```

**4. GEMINI_API_KEY**
```
AIzaSyALuGnOwnfy7tE8F3wjhUT1SE71SCUS5KU
```

**5. PORT**
```
5001
```

**6. NODE_ENV**
```
production
```

**7. CORS_ORIGIN** (Leave this blank for now, we'll add it after Vercel deployment)
```
(leave empty for now)
```

4. Click **"Create Web Service"** → Wait 5-10 minutes for deployment
5. **COPY YOUR BACKEND URL** (e.g., `https://speakwise-backend.onrender.com`)

---

## 🔵 **STEP 2: Deploy Frontend to Vercel**

#### Go to: https://vercel.com/new

1. Click **"Import Project"**
2. Click **"Import Git Repository"** → Select **`ayush23chaudhary/SpeakWise-Speech-AI-Coach`**

#### Configure Project:
```
Project Name: speakwise (or any name you like)
Framework Preset: Vite
Root Directory: client

⚠️ IMPORTANT: Leave Build Command, Output Directory, and Install Command EMPTY
   (They will be read from vercel.json automatically)
```

#### Add Environment Variable:
Click **"Environment Variables"** and add:

**VITE_API_URL** (Use your Render backend URL from Step 1)
```
https://speakwise-backend.onrender.com
```
(Replace with YOUR actual Render URL - no trailing slash!)

3. Click **"Deploy"** → Wait 3-5 minutes
4. **COPY YOUR FRONTEND URL** (e.g., `https://speakwise.vercel.app`)

---

## 🔧 **STEP 3: Update CORS Configuration**

1. Go back to **Render Dashboard** → Your backend service
2. Click **"Environment"** tab
3. Find **CORS_ORIGIN** variable
4. Update with your Vercel URL:
```
https://speakwise.vercel.app
```
(Use YOUR actual Vercel URL - no trailing slash!)

5. Click **"Save Changes"** → Backend will auto-redeploy (2-3 minutes)

---

## 🌱 **STEP 4: Seed Production Database**

Run this command in your terminal (replace with YOUR backend URL):

```bash
curl -X POST https://speakwise-backend-yuh6.onrender.com/api/practice-hub/seed-exercises
```
https://speakwise-backend-yuh6.onrender.com/

Expected response:
```json
{
  "message": "Successfully seeded 10 exercises"
}
```

---

## ✅ **STEP 5: Test Your Application**

### Open your Vercel URL in browser:
```
https://speakwise.vercel.app
```

### Test Checklist:
- [ ] Homepage loads correctly
- [ ] Sign up / Login works
- [ ] Performance Studio: Record and analyze speech
- [ ] Practice Hub: View exercises
- [ ] Practice Hub: Complete an exercise
- [ ] Check user progress updates
- [ ] Test on mobile device

---

## 📊 **Your Deployment URLs**

**Frontend (Vercel):** `https://speak-wise-speech-ai-coach.vercel.app`

**Backend (Render):** `https://speakwise-backend-yuh6.onrender.com`

✅ **Status:** Both deployed and database seeded!

---

## 🔍 **Troubleshooting**

### If frontend can't connect to backend:
1. Check VITE_API_URL in Vercel environment variables
2. Check CORS_ORIGIN in Render environment variables
3. Verify both URLs have no trailing slashes
4. Redeploy frontend after changing environment variables

### If Google Speech API fails:
1. Verify GOOGLE_CREDENTIALS_BASE64 is set correctly in Render
2. Check Render logs for "Google credentials" messages
3. Ensure the base64 string is complete (no line breaks)

### If exercises don't load:
1. Run the seed command again
2. Check MongoDB connection in Render logs
3. Verify MONGODB_URI is correct

---

## 📚 **Additional Resources**

- **Full Guide:** `DEPLOYMENT_GUIDE.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Render Logs:** https://dashboard.render.com → Your service → Logs
- **Vercel Logs:** https://vercel.com/dashboard → Your project → Deployments

---

## 🎉 **Success Indicators**

✅ Render shows "Live" status with green dot  
✅ Vercel shows "Ready" status  
✅ Frontend opens without errors  
✅ Can login/signup  
✅ Performance Studio analyzes speech  
✅ Practice Hub shows 10 exercises  
✅ Progress tracking works  

---

**Good luck with your deployment! 🚀**
