#!/bin/bash

echo "=== STARTING BUILD ==="

# Step 1: FIRST, fix the package.json
echo "1. Fixing package.json..."
cd frontend

# Create a clean package.json
cat > package.json.clean << 'EOF'
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": ".",
  "dependencies": {
    "axios": "1.10.0",
    "bootstrap": "5.3.7",
    "bootstrap-icons": "1.13.1",
    "chart.js": "4.5.0",
    "date-fns": "4.1.0",
    "react": "19.1.0",
    "react-bootstrap": "2.10.10",
    "react-chartjs-2": "5.3.0",
    "react-circular-progressbar": "2.2.0",
    "react-dom": "19.1.0",
    "react-icons": "5.5.0",
    "react-router-dom": "7.7.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# Replace the package.json
mv package.json.clean package.json

# Validate JSON
echo "Validating package.json..."
if python3 -c "import json; json.load(open('package.json'))"; then
    echo "✓ package.json is valid JSON"
else
    echo "✗ package.json is invalid!"
    exit 1
fi

# Step 2: Install dependencies
echo "2. Installing dependencies..."
npm install --no-audit --fund false

# Step 3: Build React
echo "3. Building React..."
CI=false npm run build

# Verify build
if [ -f "build/index.html" ]; then
    echo "✓ React build successful!"
    ls -la build/
else
    echo "✗ React build failed!"
    exit 1
fi

cd ..

# Step 4: Copy to frontend_build
echo "4. Creating frontend_build..."
rm -rf /opt/render/project/src/frontend_build
mkdir -p /opt/render/project/src/frontend_build
cp -r frontend/build/* /opt/render/project/src/frontend_build/

echo "Frontend_build contents:"
ls -la /opt/render/project/src/frontend_build/

# Step 5: Setup Django
echo "5. Setting up Django..."
cd backend

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate --noinput

echo "Loading seed data..."
python manage.py loaddata seed_data.json

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "=== BUILD COMPLETE ==="
