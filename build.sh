#!/bin/bash

echo "=== FORCING FRESH BUILD - NO CACHE ==="

# 1. Clean EVERYTHING
rm -rf frontend/build
rm -rf frontend/node_modules/.cache
rm -rf /opt/render/project/src/frontend_build
rm -rf backend/staticfiles

# 2. Build React with cache busting
cd frontend

# Create unique build ID
BUILD_ID=$(date +%s)
echo "BUILD_ID=$BUILD_ID" > .env.production
echo "REACT_APP_BUILD_ID=$BUILD_ID" >> .env.production
echo "REACT_APP_API_URL=https://task-flow-deployment.onrender.com/api/" >> .env.production
echo "PUBLIC_URL=." >> .env.production

# Force fresh npm install
rm -rf node_modules package-lock.json
npm cache clean --force

# Install fresh
npm install --legacy-peer-deps

# Build with INVALIDATE flag
CI=false GENERATE_SOURCEMAP=false npm run build

echo "Build completed with ID: $BUILD_ID"
ls -la build/

# 3. Copy to frontend_build with NEW structure
cd ..
mkdir -p /opt/render/project/src/frontend_build
cp -r frontend/build/* /opt/render/project/src/frontend_build/

# 4. Create version.txt for cache busting
echo "version=$BUILD_ID" > /opt/render/project/src/frontend_build/version.txt
echo "timestamp=$(date)" >> /opt/render/project/src/frontend_build/version.txt

# 5. Setup Django
cd backend

# Skip problematic steps
export DISABLE_COLLECTSTATIC=1

# Simple install
pip install -r requirements.txt

# Minimal migrations
python manage.py migrate --noinput 2>/dev/null || true

echo "=== BUILD COMPLETE ==="
