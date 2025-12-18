#!/bin/bash

set -e  # Exit on error
set -x  # Print commands as they run

echo "=== STARTING BUILD ==="
echo "Current directory: $(pwd)"
echo "Initial structure:"
ls -la

# Step 1: Build React
echo "=== STEP 1: BUILDING REACT ==="
cd frontend
echo "In frontend: $(pwd)"
ls -la

# Clean install
echo "Installing dependencies..."
npm ci --silent 2>&1 || npm install --legacy-peer-deps --silent 2>&1

echo "Building React..."
CI=false PUBLIC_URL=. npm run build

echo "React build output:"
ls -la build/
echo "Checking for index.html: $(ls build/index.html 2>/dev/null && echo 'YES' || echo 'NO')"

cd ..

# Step 2: Create frontend_build in the CORRECT location
echo "=== STEP 2: CREATING FRONTEND_BUILD ==="
echo "Current dir: $(pwd)"

# Remove old frontend_build
rm -rf /opt/render/project/src/frontend_build
rm -rf frontend_build
rm -rf backend/frontend_build

# Create frontend_build at root level (where BASE_DIR points)
mkdir -p /opt/render/project/src/frontend_build
echo "Created /opt/render/project/src/frontend_build"

# Copy build files
echo "Copying build files..."
cp -r frontend/build/* /opt/render/project/src/frontend_build/

# Also copy to backend/frontend_build (backup)
mkdir -p backend/frontend_build
cp -r frontend/build/* backend/frontend_build/

echo "Verifying copies:"
echo "Root frontend_build: $(ls -la /opt/render/project/src/frontend_build/ 2>/dev/null | head -5)"
echo "Backend frontend_build: $(ls -la backend/frontend_build/ 2>/dev/null | head -5)"

# Step 3: Set up Django
echo "=== STEP 3: SETTING UP DJANGO ==="
cd backend
echo "In backend: $(pwd)"

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate --noinput

echo "Loading seed data..."
python manage.py loaddata seed_data.json

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Step 4: Final verification
echo "=== STEP 4: FINAL VERIFICATION ==="
echo "Checking all frontend_build locations:"
find /opt/render/project -name "frontend_build" -type d 2>/dev/null

echo "Checking for index.html in common locations:"
check_locations=(
    "/opt/render/project/src/frontend_build/index.html"
    "/opt/render/project/src/backend/frontend_build/index.html"
    "$(pwd)/frontend_build/index.html"
    "/opt/render/project/src/frontend/build/index.html"
)

for loc in "${check_locations[@]}"; do
    if [ -f "$loc" ]; then
        echo "✓ FOUND: $loc"
    else
        echo "✗ NOT FOUND: $loc"
    fi
done

echo "=== BUILD COMPLETE ==="
