#!/bin/bash

echo "=== Starting Render Build Process ==="

# Build React app
echo "1. Building React app..."
cd frontend
npm install --legacy-peer-deps
npm run build

echo "2. Copying React build to correct location..."
cd ..
rm -rf backend/frontend_build
mkdir -p backend/frontend_build
cp -r frontend/build/* backend/frontend_build/

echo "3. Listing frontend_build contents..."
ls -la backend/frontend_build/

# Install Python dependencies
echo "4. Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Run Django migrations
echo "5. Running Django migrations..."
python manage.py migrate --noinput

# Load seed data
echo "6. Loading seed data..."
python manage.py loaddata seed_data.json

# Collect static files
echo "7. Collecting static files..."
python manage.py collectstatic --noinput

echo "8. Verifying file structure..."
echo "Current directory: $(pwd)"
echo "BASE_DIR would be: $(pwd)"
echo "frontend_build exists: $(ls -d frontend_build 2>/dev/null && echo 'YES' || echo 'NO')"

echo "=== Build completed successfully! ==="
