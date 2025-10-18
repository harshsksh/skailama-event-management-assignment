# Vercel Deployment Guide

## Environment Variables Setup

Add these environment variables in your Vercel dashboard:

### Required Variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NEXTAUTH_SECRET`: A random secret key (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your Vercel app URL (will be provided after deployment)

### Example Values:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## Deployment Steps:

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Important Notes:

- The backend API will be available at `/api/*` routes
- Frontend will be served from the root
- MongoDB Atlas is required for production
- Make sure to whitelist Vercel IPs in MongoDB Atlas
