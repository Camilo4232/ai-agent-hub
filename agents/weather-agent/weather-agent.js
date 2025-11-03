import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// Agent configuration
const AGENT_CONFIG = {
    name: "Weather Agent",
    description: "Proveedor de datos meteorológicos",
    port: 3001,
    pricePerQuery: "0.001",
    walletAddress: "0x1111111111111111111111111111111111111111" // Mock address
};

// Simulated weather database
const weatherData = {
    "new york": { temp: 22, condition: "Soleado", humidity: 65, wind: 15 },
    "london": { temp: 15, condition: "Nublado", humidity: 78, wind: 20 },
    "tokyo": { temp: 28, condition: "Lluvioso", humidity: 85, wind: 10 },
    "paris": { temp: 18, condition: "Parcialmente nublado", humidity: 70, wind: 12 },
    "miami": { temp: 30, condition: "Soleado", humidity: 80, wind: 8 },
    "default": { temp: 20, condition: "Templado", humidity: 60, wind: 10 }
};

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        agent: AGENT_CONFIG.name,
        description: AGENT_CONFIG.description,
        price: AGENT_CONFIG.pricePerQuery + " USDC",
        timestamp: new Date().toISOString()
    });
});

// A2A Protocol endpoint
app.post('/a2a/message', async (req, res) => {
    try {
        const { query, senderId, messageId, paymentProof } = req.body;

        console.log(`\n📨 [${AGENT_CONFIG.name}] Mensaje A2A recibido`);
        console.log(`   From: ${senderId}`);
        console.log(`   Query: ${query}`);
        console.log(`   MessageID: ${messageId}`);

        // Simulate payment verification (in production, verify on-chain)
        if (!paymentProof || paymentProof === 'demo') {
            console.log(`   💰 Payment: DEMO mode (no real payment)`);
        }

        // Extract city from query (search anywhere in text)
        const cityMatch = query.toLowerCase().match(/(new york|london|tokyo|paris|miami)/i);
        let city = cityMatch ? cityMatch[1].toLowerCase() : 'default';

        const weather = weatherData[city] || weatherData['default'];

        const response = {
            success: true,
            agentId: AGENT_CONFIG.walletAddress,
            agentName: AGENT_CONFIG.name,
            messageId: messageId || crypto.randomUUID(),
            replyTo: messageId,
            timestamp: new Date().toISOString(),
            answer: `El clima actual: ${weather.condition}, temperatura ${weather.temp}°C, humedad ${weather.humidity}%, viento ${weather.wind} km/h.`,
            data: weather,
            cost: AGENT_CONFIG.pricePerQuery + " USDC"
        };

        console.log(`   ✅ Respuesta enviada: ${weather.condition} ${weather.temp}°C`);

        res.json(response);

    } catch (error) {
        console.error(`❌ Error en ${AGENT_CONFIG.name}:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Public query endpoint (for direct user queries)
app.post('/query', async (req, res) => {
    try {
        const { query, paymentId } = req.body;

        console.log(`\n🔍 [${AGENT_CONFIG.name}] Query directa del usuario`);
        console.log(`   Query: ${query}`);
        console.log(`   PaymentID: ${paymentId}`);

        // Simulate payment verification
        if (paymentId) {
            console.log(`   💰 Payment verified: ${paymentId}`);
        }

        // Extract city from query (search anywhere in text)
        const cityMatch = query.toLowerCase().match(/(new york|london|tokyo|paris|miami)/i);
        let city = cityMatch ? cityMatch[1].toLowerCase() : 'default';

        const weather = weatherData[city] || weatherData['default'];

        const response = {
            success: true,
            agentName: AGENT_CONFIG.name,
            answer: `🌤️ Datos meteorológicos:\n\nCondición: ${weather.condition}\nTemperatura: ${weather.temp}°C\nHumedad: ${weather.humidity}%\nViento: ${weather.wind} km/h`,
            data: weather,
            cost: AGENT_CONFIG.pricePerQuery + " USDC",
            timestamp: new Date().toISOString()
        };

        console.log(`   ✅ Respuesta: ${weather.condition} ${weather.temp}°C`);

        res.json(response);

    } catch (error) {
        console.error(`❌ Error:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get agent info
app.get('/info', (req, res) => {
    res.json({
        name: AGENT_CONFIG.name,
        description: AGENT_CONFIG.description,
        pricePerQuery: AGENT_CONFIG.pricePerQuery,
        walletAddress: AGENT_CONFIG.walletAddress,
        capabilities: ["weather_data", "temperature", "humidity", "wind_speed"],
        availableCities: Object.keys(weatherData).filter(c => c !== 'default')
    });
});

// Start server
app.listen(AGENT_CONFIG.port, () => {
    console.log(`\n🌤️  ${AGENT_CONFIG.name} iniciado!`);
    console.log(`   Puerto: ${AGENT_CONFIG.port}`);
    console.log(`   Precio: ${AGENT_CONFIG.pricePerQuery} USDC`);
    console.log(`   Wallet: ${AGENT_CONFIG.walletAddress}`);
    console.log(`   Endpoints:`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/a2a/message (A2A Protocol)`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/query (Public)`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/health`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/info`);
    console.log(`\n   Listo para vender datos meteorológicos! 🌍\n`);
});
