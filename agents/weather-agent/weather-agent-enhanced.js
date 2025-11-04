import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import xss from 'xss';
import { paymentVerifier } from '../shared/payment-verifier.js';
import { Cache } from '../shared/cache.js';

const app = express();
app.use(cors());
app.use(express.json());

// Agent configuration
const AGENT_CONFIG = {
    name: "Weather Agent",
    description: "Proveedor de datos meteorológicos con IA",
    port: 3001,
    pricePerQuery: "0.001",
    walletAddress: "0x1111111111111111111111111111111111111111",
    version: "2.0.0"
};

// Initialize cache
const weatherCache = new Cache(600); // 10 minutes TTL
weatherCache.startAutoCleanup(300); // Clean every 5 minutes

// Analytics
const analytics = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    totalRevenue: 0,
    cacheHits: 0,
    cacheMisses: 0,
    startTime: Date.now()
};

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to query endpoints
app.use('/query', limiter);
app.use('/a2a/message', rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute for A2A
}));

// Simulated weather database (in production, use real weather API)
const weatherData = {
    "new york": { temp: 22, condition: "Soleado", humidity: 65, wind: 15, precipitation: 10 },
    "london": { temp: 15, condition: "Nublado", humidity: 78, wind: 20, precipitation: 60 },
    "tokyo": { temp: 28, condition: "Lluvioso", humidity: 85, wind: 10, precipitation: 80 },
    "paris": { temp: 18, condition: "Parcialmente nublado", humidity: 70, wind: 12, precipitation: 30 },
    "miami": { temp: 30, condition: "Soleado", humidity: 80, wind: 8, precipitation: 5 },
    "default": { temp: 20, condition: "Templado", humidity: 60, wind: 10, precipitation: 20 }
};

/**
 * Input validation and sanitization
 */
function validateAndSanitizeInput(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Invalid input');
    }

    // Remove XSS attempts
    const sanitized = xss(input.trim());

    // Validate length
    if (sanitized.length < 2 || sanitized.length > 100) {
        throw new Error('Input length must be between 2 and 100 characters');
    }

    // Check for SQL injection attempts
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/i;
    if (sqlPatterns.test(sanitized)) {
        throw new Error('Invalid input detected');
    }

    return sanitized.toLowerCase();
}

/**
 * Get weather data (with caching)
 */
function getWeatherData(city) {
    // Check cache first
    const cacheKey = `weather:${city}`;
    const cached = weatherCache.get(cacheKey);

    if (cached) {
        analytics.cacheHits++;
        return cached;
    }

    analytics.cacheMisses++;

    // Get fresh data
    const data = weatherData[city] || weatherData.default;
    const result = {
        city: city.charAt(0).toUpperCase() + city.slice(1),
        ...data,
        timestamp: new Date().toISOString(),
        cached: false
    };

    // Cache it
    weatherCache.set(cacheKey, result, 600); // 10 minutes

    return result;
}

/**
 * Format weather response
 */
function formatWeatherResponse(data) {
    return `${data.condition} ${data.temp}°C - Humedad: ${data.humidity}%, Viento: ${data.wind} km/h`;
}

// Health check
app.get('/health', (req, res) => {
    const cacheStats = weatherCache.getStats();

    res.json({
        status: 'healthy',
        agent: AGENT_CONFIG.name,
        version: AGENT_CONFIG.version,
        description: AGENT_CONFIG.description,
        price: AGENT_CONFIG.pricePerQuery + " USDC",
        wallet: AGENT_CONFIG.walletAddress,
        analytics: {
            ...analytics,
            uptime: Math.floor((Date.now() - analytics.startTime) / 1000) + 's',
            averageRevenue: analytics.successfulQueries > 0
                ? (analytics.totalRevenue / analytics.successfulQueries).toFixed(6) + ' USDC'
                : '0 USDC'
        },
        cache: cacheStats,
        timestamp: new Date().toISOString()
    });
});

// Info endpoint
app.get('/info', (req, res) => {
    res.json({
        agent: AGENT_CONFIG.name,
        version: AGENT_CONFIG.version,
        wallet: AGENT_CONFIG.walletAddress,
        price: AGENT_CONFIG.pricePerQuery + " USDC",
        capabilities: ["weather", "temperature", "humidity", "conditions"],
        endpoints: {
            public: "POST /query",
            a2a: "POST /a2a/message",
            health: "GET /health",
            info: "GET /info",
            analytics: "GET /analytics"
        },
        paymentMethods: ["USDC", "on-chain verification"],
        rateLimit: "100 requests per 15 minutes"
    });
});

// Analytics endpoint
app.get('/analytics', (req, res) => {
    const cacheStats = weatherCache.getStats();

    res.json({
        agent: AGENT_CONFIG.name,
        analytics: {
            ...analytics,
            uptime: Math.floor((Date.now() - analytics.startTime) / 1000),
            successRate: analytics.totalQueries > 0
                ? ((analytics.successfulQueries / analytics.totalQueries) * 100).toFixed(2) + '%'
                : '0%',
            averageRevenue: analytics.successfulQueries > 0
                ? (analytics.totalRevenue / analytics.successfulQueries).toFixed(6)
                : '0'
        },
        cache: cacheStats,
        timestamp: new Date().toISOString()
    });
});

// A2A Protocol endpoint (for other agents)
app.post('/a2a/message', async (req, res) => {
    analytics.totalQueries++;

    try {
        const { query, senderId, messageId, paymentProof } = req.body;

        console.log(`\n📨 [${AGENT_CONFIG.name}] Mensaje A2A recibido`);
        console.log(`   From: ${senderId}`);
        console.log(`   Query: ${query}`);
        console.log(`   MessageID: ${messageId}`);

        // Validate input
        const sanitizedQuery = validateAndSanitizeInput(query);

        // For A2A, we trust other agents (they already paid)
        // In production, verify their payment proof
        console.log(`   💰 Payment: ${paymentProof || 'DEMO mode (no real payment)'}`);

        // Extract city from query
        const cityMatch = sanitizedQuery.match(/clima|weather|tiempo|temperatura/i);
        const city = cityMatch ? sanitizedQuery.replace(/clima en |weather in |tiempo en |temperatura de /gi, '').trim() : 'default';

        const weatherInfo = getWeatherData(city);
        const response = formatWeatherResponse(weatherInfo);

        analytics.successfulQueries++;
        analytics.totalRevenue += parseFloat(AGENT_CONFIG.pricePerQuery);

        console.log(`   ✅ Respuesta enviada: ${response}`);

        res.json({
            success: true,
            response: response,
            data: weatherInfo,
            messageId: messageId,
            agentId: AGENT_CONFIG.walletAddress,
            cost: AGENT_CONFIG.pricePerQuery + " USDC"
        });

    } catch (error) {
        analytics.failedQueries++;
        console.error(`❌ [${AGENT_CONFIG.name}] Error:`, error.message);

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Public query endpoint (requires payment verification)
app.post('/query', async (req, res) => {
    analytics.totalQueries++;

    try {
        const { query, paymentId } = req.body;

        console.log(`\n🔍 [${AGENT_CONFIG.name}] Query directa del usuario`);
        console.log(`   Query: ${query}`);
        console.log(`   PaymentID: ${paymentId}`);

        // Validate input
        const sanitizedQuery = validateAndSanitizeInput(query);

        // REAL PAYMENT VERIFICATION (if paymentId provided)
        if (paymentId && paymentId !== 'undefined') {
            console.log(`   🔒 Verificando pago on-chain...`);

            const verification = await paymentVerifier.verifyPayment(
                paymentId,
                AGENT_CONFIG.walletAddress,
                AGENT_CONFIG.pricePerQuery
            );

            if (!verification.verified) {
                analytics.failedQueries++;
                console.log(`   ❌ Pago no verificado: ${verification.error}`);

                return res.status(402).json({
                    success: false,
                    error: 'Payment verification failed',
                    details: verification.error,
                    requiredPayment: {
                        agent: AGENT_CONFIG.walletAddress,
                        amount: AGENT_CONFIG.pricePerQuery + " USDC"
                    }
                });
            }

            console.log(`   ✅ Pago verificado on-chain!`);
            console.log(`   Payer: ${verification.details.payer}`);
            console.log(`   Amount: ${verification.details.amount} USDC`);
        } else {
            console.log(`   ⚠️ DEMO mode (no payment verification)`);
        }

        // Extract city from query
        const city = sanitizedQuery.replace(/clima en |weather in |tiempo en /gi, '').trim() || 'default';

        const weatherInfo = getWeatherData(city);
        const response = formatWeatherResponse(weatherInfo);

        analytics.successfulQueries++;
        if (paymentId && paymentId !== 'undefined') {
            analytics.totalRevenue += parseFloat(AGENT_CONFIG.pricePerQuery);
        }

        console.log(`   ✅ Respuesta: ${response}`);

        res.json({
            success: true,
            answer: response,
            data: weatherInfo,
            cost: AGENT_CONFIG.pricePerQuery + " USDC",
            paymentVerified: paymentId && paymentId !== 'undefined'
        });

    } catch (error) {
        analytics.failedQueries++;
        console.error(`❌ [${AGENT_CONFIG.name}] Error:`, error.message);

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(AGENT_CONFIG.port, () => {
    console.log(`\n🌤️  ${AGENT_CONFIG.name} v${AGENT_CONFIG.version} iniciado!`);
    console.log(`   Puerto: ${AGENT_CONFIG.port}`);
    console.log(`   Precio: ${AGENT_CONFIG.pricePerQuery} USDC`);
    console.log(`   Wallet: ${AGENT_CONFIG.walletAddress}`);
    console.log(`   Mejoras activadas:`);
    console.log(`   ✅ Verificación de pagos on-chain`);
    console.log(`   ✅ Caching (TTL: 10 min)`);
    console.log(`   ✅ Rate limiting (100/15min)`);
    console.log(`   ✅ Input sanitization`);
    console.log(`   ✅ Analytics en tiempo real`);
    console.log(`   Endpoints:`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/a2a/message (A2A Protocol)`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/query (Public)`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/health`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/info`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/analytics`);
    console.log(`\n   Listo para vender datos meteorológicos! 🌍\n`);
});
