# 🚀 Deploy to Vercel - Step by Step Guide

## 📋 Prerequisites
- ✅ GitHub repository: https://github.com/ramakrishnanyadav/402Xstacks
- ✅ Vercel account (free): https://vercel.com/signup

---

## 🎯 Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended - Easiest)

#### Step 1: Go to Vercel
1. Visit: https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Sign in with your **GitHub account** (ramakrishnanyadav)

#### Step 2: Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Find **"402Xstacks"** in your repositories
3. Click **"Import"**

#### Step 3: Configure Frontend Deployment
1. **Project Name**: `x402-nexus` (or any name you like)
2. **Framework Preset**: `Vite`
3. **Root Directory**: `packages/frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

#### Step 4: Add Environment Variables
Click **"Environment Variables"** and add:
```
VITE_API_URL=https://x402-nexus-backend.vercel.app
```
(We'll deploy backend separately and update this)

#### Step 5: Deploy Frontend
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend will be live! 🎉

#### Step 6: Deploy Backend (Separate Project)
1. Go back to Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. Import **same repository** (402Xstacks)
4. **Project Name**: `x402-nexus-backend`
5. **Root Directory**: `packages/backend`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`

Add backend environment variables:
```
NODE_ENV=production
PORT=3001
STACKS_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
CONTRACT_NAME=x402-nexus-escrow
DEMO_MODE=true
```

#### Step 7: Update Frontend Environment
1. Go to frontend project settings
2. Update `VITE_API_URL` to your backend URL
3. Example: `https://x402-nexus-backend.vercel.app`
4. Redeploy frontend

---

### Option 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy Frontend
```bash
cd packages/frontend
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** x402-nexus-frontend
- **Directory?** ./
- **Override settings?** No

#### Step 4: Deploy Backend
```bash
cd ../backend
vercel --prod
```

---

## 🔧 Post-Deployment Configuration

### Update Environment Variables

#### Frontend Environment (Vercel Dashboard)
```
VITE_API_URL=https://your-backend-url.vercel.app
```

#### Backend Environment (Vercel Dashboard)
```
NODE_ENV=production
STACKS_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
CONTRACT_NAME=x402-nexus-escrow
DEMO_MODE=true
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain
1. Go to project **Settings** → **Domains**
2. Add your domain (e.g., `x402-nexus.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

---

## ✅ Verify Deployment

### Frontend Checklist
- [ ] Landing page loads correctly
- [ ] Professional hero page displays
- [ ] Dashboard is accessible
- [ ] No console errors

### Backend Checklist
- [ ] Health endpoint works: `https://your-backend.vercel.app/api/health`
- [ ] Metrics endpoint: `https://your-backend.vercel.app/api/metrics`
- [ ] CORS configured correctly
- [ ] WebSocket connections working

### Test URLs
```bash
# Test backend health
curl https://your-backend.vercel.app/api/health

# Test metrics
curl https://your-backend.vercel.app/api/metrics
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Build Failed
**Solution**: Make sure all dependencies are in `package.json`
```bash
cd packages/frontend
npm install
npm run build  # Test locally first
```

### Issue 2: Environment Variables Not Working
**Solution**: 
- Frontend env vars must start with `VITE_`
- Redeploy after changing env vars
- Check Vercel dashboard → Settings → Environment Variables

### Issue 3: WebSocket Not Connecting
**Solution**: Vercel serverless functions have limitations
- Consider using Vercel's Edge Runtime
- Or use a separate WebSocket service (Pusher, Ably)
- Or deploy backend to Railway/Render instead

### Issue 4: 404 on Routes
**Solution**: Add `vercel.json` with rewrites (already included)

---

## 🎯 Alternative: Deploy Both as Monorepo

### Root vercel.json Configuration
Already created! Just run:
```bash
vercel --prod
```

This will deploy both frontend and backend together.

---

## 📊 Performance Optimization

### Enable Vercel Features
1. **Edge Functions**: For faster API responses
2. **Image Optimization**: Automatic image optimization
3. **Analytics**: Track performance
4. **Speed Insights**: Monitor Core Web Vitals

---

## 🔗 Final URLs

After deployment, you'll have:
- **Frontend**: `https://x402-nexus.vercel.app`
- **Backend**: `https://x402-nexus-backend.vercel.app`

Update these in:
1. README.md
2. Hackathon submission
3. Demo video description

---

## 💡 Pro Tips

1. **Auto-Deploy**: Every push to `main` auto-deploys
2. **Preview Deployments**: Each PR gets a preview URL
3. **Rollback**: Easy rollback from Vercel dashboard
4. **Monitoring**: Check deployment logs for errors

---

## 🎉 Ready to Deploy!

**Quickest Path:**
1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click "Import Project"
4. Select "402Xstacks"
5. Deploy!

**Your app will be live in ~3 minutes! 🚀**

---

## 📝 After Deployment

Update your README.md with live demo link:
```markdown
## 🌐 Live Demo

- **Frontend**: https://x402-nexus.vercel.app
- **Backend API**: https://x402-nexus-backend.vercel.app
- **GitHub**: https://github.com/ramakrishnanyadav/402Xstacks
```

Good luck! 🎯
