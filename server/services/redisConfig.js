const { RedisMemoryServer } = require('redis-memory-server');

let redisServer;
let redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null // BullMQ requirement
};

async function getRedisOptions() {
    if (process.env.NODE_ENV !== 'production') {
        try {
            if (!redisServer) {
                console.log('[RedisMock] Initializing RedisMemoryServer...');
                redisServer = new RedisMemoryServer();
                await redisServer.start();
                console.log('[RedisMock] RedisMemoryServer started successfully');
            }
            redisOptions.host = await redisServer.getHost();
            redisOptions.port = await redisServer.getPort();
            console.log(`[RedisMock] Connected to local Redis at ${redisOptions.host}:${redisOptions.port}`);
        } catch (error) {
            console.error('[RedisMock] CRITICAL: Failed to start RedisMemoryServer', error);
            // Fallback to default options if start fails
            console.warn('[RedisMock] Falling back to default Redis connection settings');
        }
    }
    return redisOptions;
}

module.exports = { getRedisOptions };
