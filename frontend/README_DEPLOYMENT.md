# Deployment Notes

## Frontend (Netlify)
- Build command: npm run build
- Publish directory: dist
- Environment variable:
  - VITE_API_URL=https://your-backend-url/api

## Backend (Render)
- Use the provided render.yaml
- The backend expects these environment variables:
  - PORT
  - DB_HOST
  - DB_PORT
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - JWT_SECRET

## Important
- Netlify only hosts the frontend.
- Products, banners, auth, and cart come from the backend.
- You must deploy the backend and point the frontend to its URL.
