/**
 * Simple in-memory cache with TTL
 * Reduces API calls and improves response time
 */

class Cache {
    constructor(defaultTTL = 600) { // 10 minutes default
        this.cache = new Map();
        this.defaultTTL = defaultTTL * 1000; // Convert to milliseconds
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0
        };
    }

    /**
     * Get value from cache
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        this.stats.hits++;
        console.log(`💾 [Cache] HIT: ${key}`);
        return item.value;
    }

    /**
     * Set value in cache
     * @param {string} key
     * @param {any} value
     * @param {number} ttl - Time to live in seconds (optional)
     */
    set(key, value, ttl) {
        const ttlMs = (ttl || this.defaultTTL / 1000) * 1000;
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttlMs
        });
        this.stats.sets++;
        console.log(`💾 [Cache] SET: ${key} (TTL: ${ttlMs / 1000}s)`);
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        const item = this.cache.get(key);
        if (!item) return false;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete key from cache
     * @param {string} key
     */
    delete(key) {
        this.cache.delete(key);
        console.log(`💾 [Cache] DELETE: ${key}`);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        console.log(`💾 [Cache] CLEARED`);
    }

    /**
     * Get cache statistics
     * @returns {object}
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

        return {
            ...this.stats,
            size: this.cache.size,
            hitRate: `${hitRate}%`
        };
    }

    /**
     * Clean expired entries
     */
    cleanExpired() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`💾 [Cache] Cleaned ${cleaned} expired entries`);
        }

        return cleaned;
    }

    /**
     * Start automatic cleanup interval
     * @param {number} intervalSeconds
     */
    startAutoCleanup(intervalSeconds = 300) { // 5 minutes default
        setInterval(() => {
            this.cleanExpired();
        }, intervalSeconds * 1000);
        console.log(`💾 [Cache] Auto-cleanup started (every ${intervalSeconds}s)`);
    }
}

export { Cache };
