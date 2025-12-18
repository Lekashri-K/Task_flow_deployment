#!/bin/bash

echo "=== Starting Render Build Process ==="

# Build React app
echo "1. Building React app..."
cd frontend
npm install --legacy-peer-deps
npm run build

echo "2. Creating frontend_build directory in backend..."
cd ..
mkdir -p backend/frontend_build

echo "3. Copying React build to backend/frontend_build..."
cp -r frontend/build/* backend/frontend_build/

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

echo "=== Build completed successfully! ==="
