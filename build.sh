#!/bin/bash

# Exit on any error
set -e

echo "=== STARTING CLEAN BUILD ==="

# 1. Enter frontend and remove old build artifacts
cd frontend
rm -rf build
rm -rf node_modules

# 2. Re-create package.json to ensure homepage is correct
echo "Creating clean package.json..."
cat > package.json << 'EOF'
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": "/",
  "dependencies": {
    "axios": "^1.6.0",
    "bootstrap": "^5.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "build": "react-scripts build"
  }
}
EOF

# 3. Install and Build React
npm install
CI=false npm run build

# 4. Prepare the folder for Django
cd ..
rm -rf frontend_build
mkdir -p frontend_build
cp -r frontend/build/* frontend_build/

# 5. Setup Backend
cd backend
pip install -r requirements.txt

# This is the most important part for your MIME error fix
python manage.py collectstatic --noinput
python manage.py migrate --noinput

echo "=== BUILD FINISHED SUCCESSFULLY ==="
