const db = require('./db');

class TiDBStore {
    init(options) {
        this.windowMs = options.windowMs;
    }

    async increment(key) {
        const now = Date.now();
        const resetTimeInt = now + this.windowMs;

        const query = `
            INSERT INTO rate_limits (ip, hits, reset_time)
            VALUES (?, 1, ?)
            ON DUPLICATE KEY UPDATE
            hits = IF(reset_time <= ?, 1, hits + 1),
            reset_time = IF(reset_time <= ?, ?, reset_time)
        `;
        
        // Execute the upsert
        await db.query(query, [key, resetTimeInt, now, now, resetTimeInt]);

        // Fetch the updated values
        const [rows] = await db.query('SELECT hits, reset_time FROM rate_limits WHERE ip = ?', [key]);
        
        if (!rows || rows.length === 0) {
            return { totalHits: 1, resetTime: new Date(resetTimeInt) };
        }

        const hit = rows[0];
        return {
            totalHits: hit.hits,
            resetTime: new Date(Number(hit.reset_time))
        };
    }

    async decrement(key) {
        await db.query(`
            UPDATE rate_limits 
            SET hits = GREATEST(0, hits - 1) 
            WHERE ip = ?
        `, [key]);
    }

    async resetKey(key) {
        await db.query('DELETE FROM rate_limits WHERE ip = ?', [key]);
    }
}

module.exports = TiDBStore;
