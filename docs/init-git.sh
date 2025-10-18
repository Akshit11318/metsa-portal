#!/bin/bash
# filepath: git-init.sh
# Initialize Git repository and push to remote

echo "🔧 Initializing Git repository..."

# Create .gitignore if it doesn't exist
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
**/node_modules/

# Environment variables
.env
.env.local
.env.production.local
.env.development.local
backend/.env
frontend/.env
frontend/.env.production

# Credentials (IMPORTANT: Never commit!)
credentials.txt
**/credentials.txt

# Database
backend/prisma/dev.db
backend/prisma/dev.db-journal
backend/prisma/migrations/**/migration.sql

# Uploads
backend/uploads/
**/uploads/

# Build outputs
frontend/dist/
frontend/build/
backend/dist/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Docker
docker-compose.override.yml

# Cloudflare
cloudflare/config.yml
cloudflare/*.json

# Misc
*.pem
*.key
*.cert
EOF

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: MetSA Portal v1.0

- Complete portal application with React frontend
- Express.js backend with Prisma ORM
- Docker containerization setup
- Nginx reverse proxy configuration
- CSRF protection and security headers
- Setup and run scripts for deployment
- Cloudflare tunnel support"

echo ""
echo "✅ Git repository initialized!"
echo ""
echo "📝 Next steps:"
echo "1. Create a new repository on GitHub/GitLab"
echo "2. Run the following commands (replace with your repo URL):"
echo ""
echo "   git remote add origin https://github.com/yourusername/metsa-portal.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""