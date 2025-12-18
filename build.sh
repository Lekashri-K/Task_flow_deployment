#!/bin/bash
set -e

echo "=== STARTING CLEAN BUILD ==="

# Step 1: Fix package.json with ALL required dependencies
echo "1. Fixing package.json..."
cd frontend
rm -rf build

cat > package.json << 'EOF'
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": "/",
  "dependencies": {
    "axios": "^1.6.0",
    "bootstrap": "^5.3.0",
    "bootstrap-icons": "^1.11.0",
    "chart.js": "^4.4.0",
    "react": "^18.2.0",
    "react-bootstrap": "^2.10.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^5.0.0",
    "react-router-dom": "^6.22.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "build": "react-scripts build"
  }
}
EOF

# Step 2: Install and Build
echo "2. Installing and Building React..."
npm install
CI=false npm run build
cd ..

# Step 3: Move Build to Backend
echo "3. Moving build files..."
rm -rf backend/frontend_build
mkdir -p backend/frontend_build
cp -r frontend/build/* backend/frontend_build/

# Step 4: Django Setup
echo "4. Setting up Django..."
cd backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput

echo "=== BUILD COMPLETE ==="
