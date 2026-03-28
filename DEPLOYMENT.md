# Prophet Dian Platform - Deployment Guide

## Overview

Prophet Dian is a full-stack web application built with:
- **Frontend**: React 19 + Tailwind CSS 4 + Vite
- **Backend**: Express 4 + tRPC 11
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **Payments**: PayPal + Bank Transfer
- **Storage**: S3 (for images and media)

## Prerequisites

Before deploying, ensure you have:
- Node.js 22.13.0 or higher
- pnpm package manager
- PostgreSQL database
- PayPal developer account (for payments)
- Manus account (for OAuth and APIs)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/prophetdian/prophetdian.github.io.git
cd prophetdian.github.io
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all required values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/prophet_dian
JWT_SECRET=your_secure_random_string
VITE_APP_ID=your_manus_app_id
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
# ... other variables
```

### 4. Set Up Database

```bash
# Generate migrations
pnpm drizzle-kit generate

# Run migrations
pnpm drizzle-kit push
```

### 5. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Self-Host on VPS (Recommended)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

#### 2. Database Setup

```bash
sudo -u postgres psql
CREATE DATABASE prophet_dian;
CREATE USER prophet_user WITH PASSWORD 'secure_password';
ALTER ROLE prophet_user SET client_encoding TO 'utf8';
ALTER ROLE prophet_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE prophet_user SET default_transaction_deferrable TO on;
ALTER ROLE prophet_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE prophet_dian TO prophet_user;
\q
```

#### 3. Clone and Setup Application

```bash
cd /var/www
sudo git clone https://github.com/prophetdian/prophetdian.github.io.git prophet-dian
cd prophet-dian
sudo chown -R $USER:$USER .

pnpm install
cp .env.example .env
# Edit .env with production values
nano .env

# Run migrations
pnpm drizzle-kit push
```

#### 4. Build Application

```bash
pnpm build
```

#### 5. Configure Nginx

Create `/etc/nginx/sites-available/prophet-dian`:

```nginx
upstream prophet_dian {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://prophet_dian;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/prophet-dian /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Set Up SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### 7. Run Application with PM2

```bash
npm install -g pm2
cd /var/www/prophet-dian

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'prophet-dian',
    script: 'node',
    args: 'server/_core/index.ts',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Option 2: Deploy on Railway.app

1. Connect your GitHub repository to Railway
2. Add PostgreSQL addon
3. Set environment variables in Railway dashboard
4. Deploy

### Option 3: Deploy on Render.com

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `node server/_core/index.ts`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy

## Environment Variables for Production

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/prophet_dian

# Security
JWT_SECRET=generate_with_openssl_rand_-hex_32
NODE_ENV=production

# Manus OAuth
VITE_APP_ID=your_production_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Prophet Dian

# PayPal (Production)
PAYPAL_CLIENT_ID=your_production_paypal_id
PAYPAL_CLIENT_SECRET=your_production_paypal_secret
PAYPAL_MODE=live

# APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_production_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_production_frontend_key

# App
VITE_APP_TITLE=Prophet Dian
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

## Database Migrations

### Generate Migration

```bash
pnpm drizzle-kit generate
```

### Apply Migration

```bash
pnpm drizzle-kit push
```

### View Migration History

```bash
pnpm drizzle-kit studio
```

## Monitoring and Maintenance

### Logs

- Application logs: `/var/www/prophet-dian/logs/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

### Backups

```bash
# Backup database
pg_dump prophet_dian > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql prophet_dian < backup_file.sql
```

### Updates

```bash
cd /var/www/prophet-dian
git pull origin main
pnpm install
pnpm build
pm2 restart prophet-dian
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -U prophet_user -d prophet_dian -h localhost
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### PayPal Integration Issues

- Verify credentials in `.env`
- Check PayPal sandbox/live mode setting
- Review PayPal webhook configuration
- Check application logs for detailed errors

## Support

For issues or questions:
1. Check application logs
2. Review error messages in browser console
3. Verify environment variables are set correctly
4. Check database connection
5. Verify PayPal credentials and webhook setup

## Security Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated: `pnpm update`
- [ ] Regularly backup database
- [ ] Monitor application logs
- [ ] Use environment variables for secrets (never commit `.env`)
- [ ] Enable firewall rules
- [ ] Set up SSL certificates
- [ ] Configure CORS properly
- [ ] Enable database backups

## Performance Optimization

1. Enable gzip compression in Nginx
2. Use CDN for static assets
3. Optimize database queries
4. Enable caching headers
5. Monitor application performance
6. Set up monitoring and alerts

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [tRPC Documentation](https://trpc.io/)
