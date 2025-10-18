# Cloudflare Tunnel Setup

This directory is for Cloudflare Tunnel configuration (if needed in the future).

## Current Setup

The application runs on **localhost:4556** and is accessible via your separately configured Cloudflare tunnel.

## If You Want to Manage Tunnel via Docker (Optional)

If you want to manage the Cloudflare tunnel within Docker Compose:

1. **Install cloudflared CLI**:
   ```bash
   # macOS
   brew install cloudflare/cloudflare/cloudflared
   
   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Authenticate**:
   ```bash
   cloudflared tunnel login
   ```

3. **Create tunnel**:
   ```bash
   cloudflared tunnel create metsa-portal
   ```

4. **Copy credentials** to this directory:
   ```bash
   cp ~/.cloudflared/[tunnel-id].json ./cloudflare/tunnel-credentials.json
   ```

5. **Create config.yml**:
   ```yaml
   tunnel: [your-tunnel-id]
   credentials-file: /etc/cloudflared/credentials.json
   
   ingress:
     - hostname: metsa.kryptolo121.xyz
       service: http://nginx:80
     - service: http_status:404
   ```

6. **Update docker-compose.yml** to uncomment the cloudflared service and use volume mounts instead of token.

## Current Configuration

Your Cloudflare tunnel is configured separately and forwards to:
- **Local URL**: http://localhost:4556
- **Public URL**: https://metsa.kryptolo121.xyz
