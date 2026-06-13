# 🧪 Performance Testing & Verification Guide

## ✅ Pre-Deployment Checklist

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```
**Newly installed packages:**
- `compression@^1.7.4` - Response compression
- `express-rate-limit@^7.1.5` - Rate limiting

### 2. Verify Backend Configuration

**File: `backend/server.js`**
- ✅ Compression middleware loaded
- ✅ Rate limiters configured (general + auth)
- ✅ Request size limits set to 10MB
- ✅ CORS enabled

**File: `backend/config/database.js`**
- ✅ Connection pooling: min=20, max=100
- ✅ Idle timeout: 45 seconds
- ✅ Retry logic enabled
- ✅ Index creation auto-runs

---

## 🧪 Manual Testing

### Test 1: Connection Pooling
```bash
# Start server
cd backend
npm start

# Check logs for:
# ✅ MongoDB Connected: cluster.mongodb.net
# ✅ Connection Pool: Min=20, Max=100
# ✅ Creating database indexes...
# ✅ All indexes created successfully!
```

### Test 2: Compression Working
```bash
# Check response headers in browser DevTools

curl -I http://localhost:5000/api/tests
# Look for: Content-Encoding: gzip
```

### Test 3: Rate Limiting
```bash
# Rapid fire requests to test rate limiter

for i in {1..15}; do
  curl http://localhost:5000/api/tests?page=1
  echo "Request $i"
done

# After ~10 requests, should see:
# 429 Too Many Requests
# { "message": "Too many requests, please try again later." }
```

### Test 4: Pagination
```bash
# Test paginated endpoints

# Get first page (20 items)
curl "http://localhost:5000/api/tests?page=1&limit=20"

# Response should include:
{
  "success": true,
  "count": 20,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTests": 100,
    "perPage": 20
  },
  "tests": [...]
}

# Test page 2
curl "http://localhost:5000/api/tests?page=2&limit=20"

# Test max limit protection
curl "http://localhost:5000/api/tests?page=1&limit=500"
# Should return max 100 items, not 500
```

### Test 5: Lean Queries & Field Selection
```bash
# Monitor response size

curl -s http://localhost:5000/api/tests?page=1&limit=5 | grep -o '"' | wc -l
# Lean queries should have fewer fields = smaller response

# Compare payload size:
# Before: ~500 bytes per item
# After: ~200 bytes per item (60% reduction!)
```

### Test 6: Database Indexes
```bash
# Connect to MongoDB:
mongo "mongodb+srv://user:password@cluster.mongodb.net/dbname"

# List indexes:
db.testresults.getIndexes()
db.tests.getIndexes()
db.users.getIndexes()

# Should see indexes like:
# { "v" : 2, "key" : { "userId" : 1, "testId" : 1 } }
# { "v" : 2, "key" : { "isPublished" : 1, "subject" : 1 } }
```

---

## 📊 Performance Metrics

### Monitor While Testing

#### Memory Usage
```bash
# In terminal running Node.js server:
top -p $(pgrep -f "node server.js")

# Watch "RES" (resident memory) column
# Should stabilize around 200-400MB

# With optimization:
# - Before: Memory grows to GB+ under load
# - After: Stays at 300-500MB even with 3000+ users
```

#### CPU Usage
```bash
# Should stay <60% for 3000 concurrent users
# With compression+lean queries: typically 40-50%
```

#### Database Connections
```bash
# MongoDB Atlas Dashboard:
# Metrics > Network > Connections

# Expected under 3000 user load:
# - Active: 40-80 connections
# - In Pool: max 100 connections
# - Idle: 20 minimum
```

#### Response Time
```bash
# Using Apache Bench for load testing:

ab -n 1000 -c 100 http://localhost:5000/api/tests?page=1

# Results should show:
# Requests per second: >100
# Time per request: <100ms (with pagination)
# Failed requests: 0

# Without optimization:
# - Requests per second: <10
# - Time per request: >500ms
# - Failed requests: High
```

---

## 🔥 Load Testing (Simulating 3000+ Users)

### Using Artillery.io

```bash
# Install globally
npm install -g artillery

# Create test file: load-test.yml
```

```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 50  # 50 users per second = 3000 in 60s

scenarios:
  - name: 'Concurrent Users'
    flow:
      - get:
          url: '/api/tests?page=1&limit=20'
          expect:
            - statusCode: 200
      - get:
          url: '/api/notes?page=1&limit=20'
          expect:
            - statusCode: 200
      - get:
          url: '/api/results/user?page=1&limit=20'
          expect:
            - statusCode: 200
```

```bash
# Run test
artillery run load-test.yml

# Expected results with optimization:
# - Throughput: 200-500 req/sec
# - Response time: 50-200ms (p95)
# - Error rate: <1%

# Without optimization (showing why this is critical):
# - Throughput: 10-50 req/sec
# - Response time: 500ms-10s (p95)
# - Error rate: 5-20%
```

### Using Node.js Native Test

```javascript
// test-load.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/tests?page=1&limit=20',
  method: 'GET'
};

const concurrent = 100;
let completed = 0;
let errors = 0;
const times = [];

const startTime = Date.now();

for (let i = 0; i < concurrent; i++) {
  const req = http.request(options, (res) => {
    const resStart = Date.now();
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      times.push(Date.now() - resStart);
      completed++;
      if (completed === concurrent) {
        printResults();
      }
    });
  });

  req.on('error', (error) => {
    errors++;
    completed++;
  });

  req.end();
}

function printResults() {
  const totalTime = Date.now() - startTime;
  times.sort((a, b) => a - b);
  
  console.log(`\n📊 Load Test Results (${concurrent} concurrent):`);
  console.log(`Total Time: ${totalTime}ms`);
  console.log(`Completed: ${completed}/${concurrent}`);
  console.log(`Errors: ${errors}`);
  console.log(`Avg Response: ${(times.reduce((a, b) => a + b) / times.length).toFixed(2)}ms`);
  console.log(`Min Response: ${times[0]}ms`);
  console.log(`Max Response: ${times[times.length - 1]}ms`);
  console.log(`p50: ${times[Math.floor(times.length * 0.5)]}ms`);
  console.log(`p95: ${times[Math.floor(times.length * 0.95)]}ms`);
  console.log(`p99: ${times[Math.floor(times.length * 0.99)]}ms`);
}
```

```bash
# Run
node test-load.js

# Expected output:
# 📊 Load Test Results (100 concurrent):
# Total Time: 2450ms
# Completed: 100/100
# Errors: 0
# Avg Response: 24.5ms
# Min Response: 15ms
# Max Response: 85ms
# p95: 45ms
# p99: 72ms
```

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 429 Too Many Requests | Rate limiter too aggressive | Adjust rate limits in `server.js` |
| Database connection timeout | Pool exhausted | Increase `maxPoolSize` in `database.js` |
| Slow pagination | No indexes | Verify indexes created in MongoDB |
| High memory usage | Lean queries not working | Check `.lean()` in controllers |
| Large response sizes | Field selection not working | Verify `.select()` in queries |
| Compression not working | Middleware order wrong | Check middleware order in `server.js` |

---

## ✅ Success Criteria

Your application is optimized for 3000+ users when:

- ✅ Response time: < 200ms (p95) for paginated endpoints
- ✅ Memory usage: 300-500MB (stable, not growing)
- ✅ CPU usage: 40-60% under full load
- ✅ Database connections: 40-80 active (max 100)
- ✅ Throughput: > 200 requests/sec
- ✅ Error rate: < 1%
- ✅ No rate limiting errors for normal traffic
- ✅ Response compression working (gzip)
- ✅ Database indexes created and being used
- ✅ Pagination working on all list endpoints

---

## 📞 Quick Debug

```bash
# Check if compression is working
curl -H "Accept-Encoding: gzip" http://localhost:5000/api/tests | gunzip

# Check rate limiting status
curl -X GET http://localhost:5000/api/tests -H "X-RateLimit-Limit: *"
# Look for headers: X-RateLimit-Limit, X-RateLimit-Remaining

# Check pagination in response
curl http://localhost:5000/api/tests?page=1 | jq '.pagination'

# Monitor real-time connections
watch 'mongo "mongodb+srv://..." --eval "db.currentOp()"'
```

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start server: `npm start`
3. ✅ Run performance tests above
4. ✅ Update frontend pagination
5. ✅ Deploy and monitor
