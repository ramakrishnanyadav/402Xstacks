# x402-Nexus Deployment Guide

## Prerequisites

- Node.js 20+
- Redis 7+
- PostgreSQL 15+ (optional, for analytics)
- Clarinet (for contract deployment)
- Stacks wallet with testnet/mainnet STX

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/x402-nexus/x402-nexus.git
cd x402-nexus
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspace packages.

### 3. Setup Redis

**Using Docker**:
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Using local installation**:
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
```

### 4. Configure Environment

Create `.env` file in `packages/backend/`:

```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# Stacks
STACKS_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
CONTRACT_NAME=x402-nexus-escrow

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
API_KEY_SECRET=your-secret-key-change-this

# Demo Mode
DEMO_MODE=true
```

### 5. Deploy Smart Contract

```bash
cd packages/contracts

# Check contract
clarinet check

# Test contract
clarinet test

# Deploy to testnet
clarinet deploy --testnet
```

**Important**: Copy the deployed contract address to your `.env` file as `CONTRACT_ADDRESS`.

### 6. Start Development Servers

**Terminal 1** - Backend:
```bash
npm run dev:backend
```

**Terminal 2** - Frontend:
```bash
npm run dev:frontend
```

**Terminal 3** - Redis (if not running):
```bash
redis-server
```

### 7. Access Dashboard

Open browser to: http://localhost:3000

---

## Production Deployment

### Option 1: Railway (Recommended for Backend)

1. **Create Railway Project**:
```bash
npm install -g @railway/cli
railway login
railway init
```

2. **Add Redis**:
```bash
railway add redis
```

3. **Configure Environment**:
```bash
railway variables set STACKS_NETWORK=mainnet
railway variables set CONTRACT_ADDRESS=SP...
railway variables set API_KEY_SECRET=your-production-secret
```

4. **Deploy**:
```bash
railway up
```

### Option 2: Vercel (Frontend)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy Frontend**:
```bash
cd packages/frontend
vercel --prod
```

3. **Configure Environment**:
```bash
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.railway.app
```

### Option 3: Docker

**Backend Dockerfile** (`packages/backend/Dockerfile`):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci --workspace=packages/backend

# Copy source
COPY packages/backend ./packages/backend

# Build
RUN npm run build --workspace=packages/backend

EXPOSE 3001

CMD ["npm", "start", "--workspace=packages/backend"]
```

**Build and Run**:
```bash
docker build -t x402-nexus-backend -f packages/backend/Dockerfile .
docker run -d \
  -p 3001:3001 \
  -e REDIS_HOST=redis \
  -e STACKS_NETWORK=mainnet \
  --name x402-nexus-backend \
  x402-nexus-backend
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - STACKS_NETWORK=mainnet
      - CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
      - API_KEY_SECRET=${API_KEY_SECRET}
    depends_on:
      - redis

  frontend:
    build:
      context: .
      dockerfile: packages/frontend/Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:3001

volumes:
  redis-data:
```

Run with:
```bash
docker-compose up -d
```

---

## Smart Contract Deployment

### Testnet Deployment

1. **Setup Clarinet**:
```bash
cd packages/contracts
clarinet integrate
```

2. **Deploy**:
```bash
clarinet deploy --testnet
```

3. **Verify Deployment**:
```bash
clarinet console
# In console:
(contract-call? .x402-nexus-escrow get-stats)
```

### Mainnet Deployment

⚠️ **CRITICAL**: Audit contract before mainnet deployment!

1. **Security Audit**:
   - Run automated analysis: `clarinet check`
   - Manual code review
   - Third-party audit (recommended)

2. **Deploy to Mainnet**:
```bash
clarinet deploy --mainnet
```

3. **Verify**:
```bash
# Check on Stacks Explorer
https://explorer.stacks.co/txid/YOUR_TX_ID
```

---

## Environment Variables Reference

### Backend

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | API server port | 3001 |
| `NODE_ENV` | No | Environment | development |
| `STACKS_NETWORK` | Yes | testnet or mainnet | testnet |
| `STACKS_API_URL` | Yes | Stacks API endpoint | https://api.testnet.hiro.so |
| `CONTRACT_ADDRESS` | Yes | Deployed contract address | - |
| `CONTRACT_NAME` | No | Contract name | x402-nexus-escrow |
| `REDIS_HOST` | Yes | Redis hostname | localhost |
| `REDIS_PORT` | No | Redis port | 6379 |
| `REDIS_PASSWORD` | No | Redis password | - |
| `API_KEY_SECRET` | Yes | API key encryption secret | - |
| `DEMO_MODE` | No | Enable demo features | false |

### Frontend

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | http://localhost:3001 |

---

## Monitoring & Logging

### Logging

**Winston** is configured for structured logging:

```typescript
logger.info('Payment processed', { paymentId, status });
logger.error('Error processing payment', { error, paymentId });
```

**Log Levels**:
- `error`: Critical errors
- `warn`: Warnings
- `info`: Informational messages
- `debug`: Debug information

**Configure log level**:
```bash
export LOG_LEVEL=debug
```

### Monitoring

**Recommended Tools**:
- **Datadog**: Application monitoring
- **Sentry**: Error tracking
- **Grafana**: Metrics visualization

**Key Metrics to Monitor**:
- Payment success rate
- Average processing time
- API response times
- Redis memory usage
- WebSocket connection count

### Health Checks

**Kubernetes Readiness Probe**:
```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
```

**Kubernetes Liveness Probe**:
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
```

---

## Scaling

### Horizontal Scaling

**API Servers**:
- Stateless design allows multiple instances
- Use load balancer (nginx, AWS ALB)
- Sticky sessions not required

**WebSocket Servers**:
- Use Redis pub/sub for multi-node WebSocket
- Configure Socket.io adapter:

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

**Verifier Service**:
- Run single instance (leader election)
- Use Redis-based lock for coordination

### Vertical Scaling

**Redis**:
- Monitor memory usage
- Scale RAM as needed
- Consider Redis Cluster for large deployments

**API Servers**:
- CPU: 2-4 cores recommended
- RAM: 2-4 GB per instance

---

## Backup & Recovery

### Redis Backup

**Automated Snapshots**:
```bash
# In redis.conf
save 900 1
save 300 10
save 60 10000
```

**Manual Backup**:
```bash
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/
```

### State Recovery

If Redis data is lost:

1. **Rebuild from blockchain**:
```bash
npm run rebuild-state --workspace=packages/backend
```

2. **Verify integrity**:
```bash
npm run verify-state --workspace=packages/backend
```

---

## Security Checklist

- [ ] Change default `API_KEY_SECRET`
- [ ] Use HTTPS in production
- [ ] Enable Redis authentication
- [ ] Implement rate limiting
- [ ] Setup CORS properly
- [ ] Use environment variables (never commit secrets)
- [ ] Enable API key rotation
- [ ] Audit smart contracts
- [ ] Setup monitoring/alerting
- [ ] Configure firewall rules
- [ ] Use secure WebSocket (WSS)

---

## Troubleshooting

### Backend won't start

**Error**: `Redis connection refused`
- Check Redis is running: `redis-cli ping`
- Verify `REDIS_HOST` and `REDIS_PORT`

**Error**: `Contract not found`
- Verify `CONTRACT_ADDRESS` is correct
- Check network setting (`STACKS_NETWORK`)

### Payments failing

**Check logs**:
```bash
npm run dev:backend
# Watch for error messages
```

**Verify contract**:
```bash
curl https://api.testnet.hiro.so/v2/contracts/interface/ST.../x402-nexus-escrow
```

### Dashboard not connecting

**Check WebSocket**:
```javascript
// Browser console
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected!'));
```

**Verify CORS**:
- Check backend CORS configuration
- Ensure frontend URL is allowed

---

## Support

For deployment assistance:
- **GitHub Issues**: https://github.com/x402-nexus/x402-nexus/issues
- **Discord**: https://discord.gg/x402nexus
- **Email**: support@x402-nexus.xyz
