const Redis = require('ioredis');
const redisClient = new Redis(process.env.REDIS_URL);

// redisClient.on('connect', () => console.log('Redis client connected.'));
// redisClient.on('error', (err) => console.error('Redis client error:', err));

// Function to set data in Redis
const setCache = async (key, value, ttl = 300) => {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
    console.log(`Cache set for key: ${key}`);
  } catch (err) {
    console.error(`Error setting cache for key ${key}:`, err.message);
  }
};

// Function to get data from Redis
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error getting cache for key ${key}:`, err.message);
    return null;
  }
};

// Test Redis Connection
const testRedisConnection = async () => {
  try {
    const pong = await redisClient.ping();
    console.log(`Redis connection successful: ${pong}`);
  } catch (error) {
    console.error('Error connecting to Redis:', error.message);
  }
};

testRedisConnection();

module.exports = {
  setCache,
  getCache,
};
