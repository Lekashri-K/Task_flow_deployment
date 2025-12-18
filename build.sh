#!/bin/bash

set -e  # Exit on error
set -x  # Print commands

echo "=== STARTING BUILD ==="
echo "Current directory: $(pwd)"
echo "Initial structure:"
ls -la

# Step 1: Fix package.json if needed
echo "=== STEP 1: VERIFYING PACKAGE.JSON ==="
cd frontend
echo "Checking package.json..."
if python3 -m json.tool package.json > /dev/null 2>&1; then
    echo "✓ package.json is valid JSON"
else
    echo "✗ package.json has errors. Attempting to fix..."
    # Remove JavaScript comments
    sed -i 's|//.*||g' package.json
    # Remove trailing commas
    sed -i 's|, *}|}|g' package.json
    sed -i 's|, *\]|\]|g' package.json
    echo "Fixed package.json"
fi

# Step 2: Build React
echo "=== STEP 2: BUILDING REACT ==="
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building React app..."
CI=false npm run build

echo "Build created successfully!"
ls -la build/
cd ..

# Step 3: Create frontend_build directory
echo "=== STEP 3: SETTING UP FRONTEND_BUILD ==="
# Remove old builds
rm -rf /opt/render/project/src/frontend_build
rm -rf frontend_build
rm -rf backend/frontend_build

# Create in root (where BASE_DIR points)
mkdir -p /opt/render/project/src/frontend_build
echo "Created: /opt/render/project/src/frontend_build"

# Copy build
echo "Copying build files..."
cp -r frontend/build/* /opt/render/project/src/frontend_build/

# Also copy to backend for backup
mkdir -p backend/frontend_build
cp -r frontend/build/* backend/frontend_build/

echo "Verifying copy:"
ls -la /opt/render/project/src/frontend_build/

# Step 4: Setup Django
echo "=== STEP 4: SETTING UP DJANGO ==="
cd backend
echo "Now in: $(pwd)"

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate --noinput

echo "Loading seed data..."
python manage.py loaddata seed_data.json

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Step 5: Final verification
echo "=== STEP 5: FINAL VERIFICATION ==="
echo "Checking index.html locations:"
check_paths=(
    "/opt/render/project/src/frontend_build/index.html"
    "/opt/render/project/src/backend/frontend_build/index.html"
    "$(pwd)/frontend_build/index.html"
)

for path in "${check_paths[@]}"; do
    if [ -f "$path" ]; then
        echo "✓ FOUND: $path"
    else
        echo "✗ NOT FOUND: $path"
    fi
done

echo "=== BUILD COMPLETE ==="
