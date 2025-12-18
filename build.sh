#!/bin/bash

set -e  # Exit on any error

echo "=== Starting Render Build Process ==="
echo "Current directory: $(pwd)"
echo "Initial directory structure:"
ls -la

# Build React app
echo "=== STEP 1: Building React app ==="
if [ -d "frontend" ]; then
    cd frontend
    echo "In frontend directory: $(pwd)"
    
    # Clean install
    echo "Installing npm dependencies..."
    npm ci --silent || npm install --legacy-peer-deps
    
    echo "Building React app..."
    CI=false npm run build
    
    echo "React build completed. Build directory contents:"
    ls -la build/
    
    cd ..
else
    echo "ERROR: 'frontend' directory not found!"
    echo "Available directories:"
    ls -la
    exit 1
fi

echo "=== STEP 2: Copying React build ==="
# Create frontend_build directory in backend
BACKEND_DIR="backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "ERROR: '$BACKEND_DIR' directory not found!"
    exit 1
fi

echo "Removing old frontend_build..."
rm -rf "$BACKEND_DIR/frontend_build"

echo "Creating new frontend_build directory..."
mkdir -p "$BACKEND_DIR/frontend_build"

echo "Copying build files..."
cp -r frontend/build/* "$BACKEND_DIR/frontend_build/"

echo "Verifying copy:"
ls -la "$BACKEND_DIR/frontend_build/"

echo "=== STEP 3: Setting up Django ==="
cd "$BACKEND_DIR"
echo "Now in backend directory: $(pwd)"

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate --noinput

echo "Loading seed data..."
python manage.py loaddata seed_data.json

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "=== STEP 4: Final verification ==="
echo "Final backend directory structure:"
ls -la

echo "frontend_build contents:"
ls -la frontend_build/

echo "=== Build completed successfully! ==="
