#!/bin/bash

echo "=== Starting Render Build Process ==="
echo "Current directory: $(pwd)"
echo "Directory structure:"
ls -la

# Build React app
echo "1. Building React app..."
cd frontend
echo "Frontend directory: $(pwd)"
npm install --legacy-peer-deps
echo "Running React build..."
npm run build

echo "2. Checking React build..."
ls -la build/

echo "3. Copying React build to backend/frontend_build..."
cd ..
rm -rf backend/frontend_build
mkdir -p backend/frontend_build
cp -r frontend/build/* backend/frontend_build/

echo "4. Verifying copied files..."
ls -la backend/frontend_build/

# Install Python dependencies
echo "5. Installing Python dependencies..."
cd backend
echo "Backend directory: $(pwd)"
pip install -r requirements.txt

# Run Django migrations
echo "6. Running Django migrations..."
python manage.py migrate --noinput

# Load seed data
echo "7. Loading seed data..."
python manage.py loaddata seed_data.json

# Collect static files
echo "8. Collecting static files..."
python manage.py collectstatic --noinput

echo "9. Final directory structure in backend:"
ls -la

echo "=== Build completed successfully! ==="
