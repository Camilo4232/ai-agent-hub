import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.LOGS_AGENT_PORT || 3004;

app.use(cors());
app.use(express.json());

// In-memory storage for logs (in production, use a database)
const logs = [];
const MAX_LOGS = 1000; // Keep last 1000 logs

// System statistics
const stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    paymentsProcessed: 0,
    totalRevenue: 0,
    agentCalls: {
        weather: 0,
        fashion: 0,
        activities: 0
    },
    errors: [],
    startTime: Date.now()
};

// Log levels
const LogLevel = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS'
};

// Helper function to add log
function addLog(level, category, message, data = {}) {
    const logEntry = {
        id: logs.length + 1,
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data,
        uptime: Math.floor((Date.now() - stats.startTime) / 1000)
    };

    logs.unshift(logEntry); // Add to beginning

    // Keep only last MAX_LOGS
    if (logs.length > MAX_LOGS) {
        logs.pop();
    }

    // Console output with color
    const colors = {
        INFO: '\x1b[36m',    // Cyan
        WARNING: '\x1b[33m', // Yellow
        ERROR: '\x1b[31m',   // Red
        SUCCESS: '\x1b[32m'  // Green
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[${level}]${reset} [${category}] ${message}`);

    return logEntry;
}

// ==================== AGENT INFO ====================
app.get('/info', (req, res) => {
    res.json({
        name: 'Logs Agent',
        version: '1.0.0',
        description: 'System monitoring and logging agent for AI Agent Hub',
        agentId: '0x4444444444444444444444444444444444444444',
        price: '0.0005 USDC per query',
        endpoints: {
            info: '/info',
            query: '/query',
            logs: '/logs',
            stats: '/stats',
            health: '/health',
            a2a: '/a2a/message'
        },
        capabilities: [
            'System monitoring',
            'Log aggregation',
            'Statistics tracking',
            'Error reporting',
            'A2A communication'
        ]
    });
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
    res.json({
        status: 'healthy',
        uptime: `${Math.floor(uptime / 60)} minutes`,
        logsCount: logs.length,
        totalRequests: stats.totalRequests
    });
});

// ==================== QUERY ENDPOINT ====================
app.post('/query', async (req, res) => {
    try {
        const { query, paymentId } = req.body;

        stats.totalRequests++;

        addLog(LogLevel.INFO, 'Query', 'Received query request', {
            query,
            paymentId
        });

        // Simulate payment verification (in production, verify on-chain)
        if (!paymentId) {
            stats.failedRequests++;
            addLog(LogLevel.ERROR, 'Payment', 'Missing payment ID');
            return res.status(402).json({
                error: 'Payment Required',
                message: 'Payment ID is required',
                code: 'PAYMENT_MISSING'
            });
        }

        // Parse query to determine what logs to return
        const response = await processLogsQuery(query);

        stats.successfulRequests++;
        addLog(LogLevel.SUCCESS, 'Query', 'Query processed successfully', {
            paymentId,
            resultCount: response.logs ? response.logs.length : 0
        });

        res.json({
            success: true,
            agent: 'Logs Agent',
            query,
            paymentId,
            result: response,
            timestamp: Date.now()
        });

    } catch (error) {
        stats.failedRequests++;
        addLog(LogLevel.ERROR, 'Query', `Query error: ${error.message}`);

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// ==================== GET LOGS ====================
app.get('/logs', (req, res) => {
    const {
        level,
        category,
        limit = 100,
        offset = 0
    } = req.query;

    let filteredLogs = logs;

    // Filter by level
    if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    // Filter by category
    if (category) {
        filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    // Pagination
    const paginatedLogs = filteredLogs.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
    );

    res.json({
        total: filteredLogs.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        logs: paginatedLogs
    });
});

// ==================== GET STATISTICS ====================
app.get('/stats', (req, res) => {
    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);

    res.json({
        uptime: {
            seconds: uptime,
            formatted: formatUptime(uptime)
        },
        requests: {
            total: stats.totalRequests,
            successful: stats.successfulRequests,
            failed: stats.failedRequests,
            successRate: stats.totalRequests > 0
                ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%'
                : '0%'
        },
        payments: {
            processed: stats.paymentsProcessed,
            totalRevenue: stats.totalRevenue.toFixed(6) + ' USDC'
        },
        agentCalls: stats.agentCalls,
        logs: {
            total: logs.length,
            byLevel: {
                INFO: logs.filter(l => l.level === 'INFO').length,
                WARNING: logs.filter(l => l.level === 'WARNING').length,
                ERROR: logs.filter(l => l.level === 'ERROR').length,
                SUCCESS: logs.filter(l => l.level === 'SUCCESS').length
            }
        },
        recentErrors: stats.errors.slice(-10)
    });
});

// ==================== LOG AN EVENT ====================
app.post('/log', (req, res) => {
    const { level, category, message, data } = req.body;

    if (!level || !category || !message) {
        return res.status(400).json({
            error: 'Missing required fields: level, category, message'
        });
    }

    const logEntry = addLog(level, category, message, data);

    // Track error
    if (level === LogLevel.ERROR) {
        stats.errors.push({
            timestamp: logEntry.timestamp,
            category,
            message
        });
    }

    res.json({
        success: true,
        logId: logEntry.id
    });
});

// ==================== A2A ENDPOINT ====================
app.post('/a2a/message', async (req, res) => {
    try {
        const { query, senderId, messageId } = req.body;

        addLog(LogLevel.INFO, 'A2A', 'Received A2A message', {
            senderId,
            messageId,
            query
        });

        const response = await processLogsQuery(query);

        res.json({
            success: true,
            agentId: '0x4444444444444444444444444444444444444444',
            agentName: 'Logs Agent',
            messageId: `msg_${Date.now()}`,
            replyTo: messageId,
            timestamp: new Date().toISOString(),
            answer: `Found ${response.logs ? response.logs.length : 0} log entries`,
            data: response,
            cost: '0.0005 USDC'
        });

    } catch (error) {
        addLog(LogLevel.ERROR, 'A2A', `A2A error: ${error.message}`);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

// Process logs query with natural language
async function processLogsQuery(query) {
    const queryLower = query.toLowerCase();

    // Determine what user is asking for
    if (queryLower.includes('error') || queryLower.includes('problema') || queryLower.includes('fallo')) {
        return {
            description: 'Recent errors',
            logs: logs.filter(l => l.level === 'ERROR').slice(0, 10),
            count: logs.filter(l => l.level === 'ERROR').length
        };
    }

    if (queryLower.includes('payment') || queryLower.includes('pago')) {
        return {
            description: 'Payment-related logs',
            logs: logs.filter(l => l.category === 'Payment').slice(0, 20),
            count: logs.filter(l => l.category === 'Payment').length
        };
    }

    if (queryLower.includes('stats') || queryLower.includes('statistics') || queryLower.includes('estadísticas')) {
        const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
        return {
            description: 'System statistics',
            stats: {
                uptime: formatUptime(uptime),
                totalRequests: stats.totalRequests,
                successRate: stats.totalRequests > 0
                    ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%'
                    : '0%',
                payments: stats.paymentsProcessed,
                revenue: stats.totalRevenue.toFixed(6) + ' USDC',
                errorCount: logs.filter(l => l.level === 'ERROR').length
            }
        };
    }

    if (queryLower.includes('recent') || queryLower.includes('latest') || queryLower.includes('últim')) {
        return {
            description: 'Recent logs',
            logs: logs.slice(0, 20),
            count: logs.length
        };
    }

    // Default: return overview
    return {
        description: 'System overview',
        summary: {
            totalLogs: logs.length,
            uptime: formatUptime(Math.floor((Date.now() - stats.startTime) / 1000)),
            totalRequests: stats.totalRequests,
            errorCount: logs.filter(l => l.level === 'ERROR').length
        },
        recentLogs: logs.slice(0, 5)
    };
}

// Format uptime in human-readable format
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}

// ==================== START SERVER ====================
app.listen(PORT, () => {
    addLog(LogLevel.SUCCESS, 'System', `Logs Agent started on port ${PORT}`);
    console.log('\n' + '='.repeat(60));
    console.log('📊 Logs Agent - System Monitoring');
    console.log('='.repeat(60));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/health`);
    console.log(`📋 Logs: http://localhost:${PORT}/logs`);
    console.log(`📊 Stats: http://localhost:${PORT}/stats`);
    console.log(`🤖 A2A: http://localhost:${PORT}/a2a/message`);
    console.log('='.repeat(60) + '\n');
});

export default app;
