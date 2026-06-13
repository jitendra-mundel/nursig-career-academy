# 🚀 3000+ Concurrent Users के लिए Scaling Guide

## ✅ Already Implemented

### 1. **Database Connection Pooling**
- Min 20, Max 100 connections
- Idle timeout: 45 seconds
- Retry logic enabled

### 2. **Response Compression**
- gzip compression सभी responses पर
- Bandwidth 60-80% कम

### 3. **Rate Limiting**
- General: 300 requests/15 min
- Auth: 10 login attempts/15 min
- DDoS attack protection

### 4. **Query Optimization**
- `.lean()` queries for read operations
- Field selection (only needed fields return करना)
- Pagination (20-100 items per page)

### 5. **Request Size Limits**
- Max 10MB JSON payload
- Max 10MB URL-encoded data

---

## 📦 Installation

```bash
cd backend
npm install
```

---

## 🔧 Performance Tuning

### ENV Variables Update

```env
# Database Configuration
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db?maxPoolSize=100&minPoolSize=20

# Server
PORT=5000
NODE_ENV=production
API_URL=https://api.example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=300
```

---

## 🏗️ Deployment Architecture (3000+ Users)

### ✅ Recommended Setup:

```
                 CloudFlare / CDN
                       |
            ┌───────────┼───────────┐
            |           |           |
          Load Balancer (nginx)
            |           |           |
       Node.js #1   Node.js #2   Node.js #3
       (port 5001) (port 5002) (port 5003)
            |           |           |
            └───────────┼───────────┘
                   |
            MongoDB Cluster
         (Replica Set with backups)
                   |
           Redis Cache (optional)
```

### PM2 Clustering (Same Server):

```bash
npm install -g pm2

# Create pm2-config.json:
{
  "apps": [{
    "name": "api",
    "script": "./server.js",
    "instances": 4,           # CPU cores
    "exec_mode": "cluster",
    "watch": false,
    "max_memory_restart": "500M",
    "env": { "NODE_ENV": "production" }
  }]
}

# Start:
pm2 start pm2-config.json
pm2 logs api
```

---

## 🚨 Critical Indexes (MongoDB)

```javascript
// backend/models/TestResult.js में add करना है:

testResultSchema.index({ userId: 1, testId: 1 });  // Unique attempt check
testResultSchema.index({ testId: 1, percentage: -1 }); // Ranking
testResultSchema.index({ createdAt: -1 });  // Latest results

// backend/models/Test.js:
testSchema.index({ isPublished: 1, subject: 1 }); // Filter queries
testSchema.index({ createdAt: -1 });

// backend/models/User.js:
userSchema.index({ email: 1 }, { unique: true }); // Email lookup
```

---

## 🔍 Monitoring (3000+ Users)

### Check Points:

```bash
# Database Connections
db.serverStatus().connections

# Query Performance
db.testresults.find({testId: ObjectId("...")}).explain("executionStats")

# Memory Usage
top -p $(pgrep -f "node server.js")
```

### Key Metrics to Watch:

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| DB Connection Pool | 20-80 | >80 | 100+ |
| Avg Response Time | <100ms | 100-500ms | >500ms |
| Memory Usage | <300MB | 300-500MB | >500MB |
| CPU Usage | <60% | 60-80% | >80% |
| Request Queue | <10 | 10-50 | >50 |

---

## 🐛 Common Bottlenecks

### 1. N+1 Query Problem
```javascript
// ❌ BAD:
const results = await TestResult.find();
for (const r of results) {
  const test = await Test.findById(r.testId); // N queries
}

// ✅ GOOD:
const results = await TestResult.find().populate('testId').lean();
```

### 2. Memory Leaks
```javascript
// ❌ BAD:
app.get('/data', async (req, res) => {
  const hugeArray = await db.find({}); // सभी data load करना
});

// ✅ GOOD:
app.get('/data', async (req, res) => {
  const page = req.query.page || 1;
  const data = await db.find()
    .skip((page-1)*20)
    .limit(20)
    .lean();
});
```

### 3. Slow Queries
```javascript
// ❌ BAD:
const result = await Test.find({ subject: "Math" });

// ✅ GOOD (with index):
const result = await Test.find({ subject: "Math" })
  .lean()
  .select('title totalMarks -__v')
  .limit(20);
```

---

## 📊 Expected Performance

### With These Optimizations:

| Users | Response Time | Database Load | Memory |
|-------|---------------|---------------|--------|
| 500   | <50ms         | 10-20 conn    | 150MB  |
| 1000  | 50-100ms      | 30-50 conn    | 250MB  |
| 2000  | 100-150ms     | 60-80 conn    | 400MB  |
| 3000+ | 150-250ms     | 80-100 conn   | 450MB  |

---

## ⚡ Further Optimization (Advanced)

### 1. **Redis Caching**
```bash
npm install redis ioredis
```
Cache frequently accessed data (tests, notes).

### 2. **Database Sharding**
Distribute users across multiple MongoDB collections by region.

### 3. **GraphQL**
Reduce over-fetching of data.

### 4. **Webhook Queuing**
Use Bull/RabbitMQ for async operations.

### 5. **CDN**
Serve static files from CloudFlare/AWS CloudFront.

---

## 🎯 Quick Checklist

- [x] Connection pooling configured
- [x] Compression enabled
- [x] Rate limiting applied
- [x] Pagination implemented
- [ ] Database indexes created
- [ ] PM2 clustering configured
- [ ] Monitoring dashboard setup
- [ ] Redis caching (optional)
- [ ] Load testing done
- [ ] Production error logs enabled

---

## 📞 Support

यदि performance issue हो:
1. `pm2 logs api` चेक करो
2. MongoDB connection pool stats देखो
3. Slow query log enable करो
4. Response time में API endpoints compare करो
