import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// Agent configuration
const AGENT_CONFIG = {
    name: "Fashion Agent",
    description: "Asesor de moda según el clima",
    port: 3002,
    pricePerQuery: "0.002",
    walletAddress: "0x2222222222222222222222222222222222222222" // Mock address
};

// Weather Agent connection
const WEATHER_AGENT = {
    endpoint: "http://localhost:3001/a2a/message",
    address: "0x1111111111111111111111111111111111111111"
};

// Fashion recommendations based on weather
const getFashionAdvice = (weather) => {
    const { temp, condition, humidity } = weather;

    let outfit = [];
    let accessories = [];
    let footwear = "";

    // Temperature-based recommendations
    if (temp < 10) {
        outfit = ["Abrigo grueso", "Suéter de lana", "Pantalones largos", "Capa térmica"];
        accessories = ["Bufanda", "Guantes", "Gorro"];
        footwear = "Botas resistentes";
    } else if (temp < 18) {
        outfit = ["Chaqueta ligera", "Suéter", "Pantalones o jeans"];
        accessories = ["Bufanda ligera"];
        footwear = "Zapatos cerrados";
    } else if (temp < 25) {
        outfit = ["Camisa de manga larga", "Pantalones ligeros"];
        accessories = ["Gafas de sol"];
        footwear = "Zapatillas deportivas";
    } else {
        outfit = ["Camiseta ligera", "Shorts o falda", "Ropa de algodón"];
        accessories = ["Gafas de sol", "Sombrero"];
        footwear = "Sandalias o zapatos abiertos";
    }

    // Condition-based additions
    if (condition.toLowerCase().includes('lluv') || condition.toLowerCase().includes('rain')) {
        accessories.push("Paraguas", "Impermeable");
        footwear = "Botas de lluvia";
    }

    if (humidity > 75) {
        outfit.push("Telas transpirables");
    }

    return {
        outfit,
        accessories,
        footwear,
        tip: temp > 25 ? "Usa protector solar" : temp < 15 ? "Lleva capas adicionales" : "Clima ideal para cualquier estilo"
    };
};

// Query Weather Agent via A2A
async function queryWeatherAgent(city, messageId) {
    try {
        console.log(`   🔗 Consultando Weather Agent para: ${city}`);

        const response = await fetch(WEATHER_AGENT.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `clima en ${city}`,
                senderId: AGENT_CONFIG.walletAddress,
                messageId: messageId,
                paymentProof: 'demo' // In production, include real payment proof
            })
        });

        if (!response.ok) {
            throw new Error(`Weather Agent respondió con ${response.status}`);
        }

        const data = await response.json();
        console.log(`   ✅ Datos recibidos del Weather Agent`);

        return data;

    } catch (error) {
        console.error(`   ❌ Error consultando Weather Agent:`, error.message);
        throw error;
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        agent: AGENT_CONFIG.name,
        description: AGENT_CONFIG.description,
        price: AGENT_CONFIG.pricePerQuery + " USDC",
        dependencies: ["Weather Agent"],
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

        // Extract city from query (search anywhere in text)
        const cityMatch = query.toLowerCase().match(/(new york|london|tokyo|paris|miami)/i);
        const city = cityMatch ? cityMatch[1] : 'new york';

        // Query Weather Agent first
        const weatherResponse = await queryWeatherAgent(city, messageId + '_weather');
        const weather = weatherResponse.data;

        // Generate fashion advice
        const fashion = getFashionAdvice(weather);

        const response = {
            success: true,
            agentId: AGENT_CONFIG.walletAddress,
            agentName: AGENT_CONFIG.name,
            messageId: messageId || crypto.randomUUID(),
            replyTo: messageId,
            timestamp: new Date().toISOString(),
            answer: `👔 Recomendaciones de moda para ${city}:\n\n` +
                    `Vestimenta: ${fashion.outfit.join(', ')}\n` +
                    `Accesorios: ${fashion.accessories.join(', ')}\n` +
                    `Calzado: ${fashion.footwear}\n` +
                    `💡 Consejo: ${fashion.tip}`,
            data: {
                city,
                weather,
                fashion
            },
            cost: AGENT_CONFIG.pricePerQuery + " USDC",
            dependencies: ["Weather Agent: 0.001 USDC"]
        };

        console.log(`   ✅ Recomendación enviada para ${city}`);

        res.json(response);

    } catch (error) {
        console.error(`❌ Error en ${AGENT_CONFIG.name}:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Public query endpoint
app.post('/query', async (req, res) => {
    try {
        const { query, paymentId } = req.body;

        console.log(`\n🔍 [${AGENT_CONFIG.name}] Query directa del usuario`);
        console.log(`   Query: ${query}`);

        // Extract city (search anywhere in text)
        const cityMatch = query.toLowerCase().match(/(new york|london|tokyo|paris|miami)/i);
        const city = cityMatch ? cityMatch[1] : 'new york';

        // Query Weather Agent
        const messageId = crypto.randomUUID();
        const weatherResponse = await queryWeatherAgent(city, messageId);
        const weather = weatherResponse.data;

        // Generate fashion advice
        const fashion = getFashionAdvice(weather);

        const response = {
            success: true,
            agentName: AGENT_CONFIG.name,
            answer: `👔 Recomendaciones de moda para ${city.toUpperCase()}:\n\n` +
                    `☀️ Clima: ${weather.condition}, ${weather.temp}°C\n\n` +
                    `👕 Vestimenta:\n${fashion.outfit.map(item => `  • ${item}`).join('\n')}\n\n` +
                    `🎒 Accesorios:\n${fashion.accessories.map(item => `  • ${item}`).join('\n')}\n\n` +
                    `👟 Calzado: ${fashion.footwear}\n\n` +
                    `💡 Consejo: ${fashion.tip}`,
            data: {
                city,
                weather,
                fashion
            },
            cost: AGENT_CONFIG.pricePerQuery + " USDC",
            breakdown: {
                "Fashion Agent": AGENT_CONFIG.pricePerQuery + " USDC",
                "Weather Agent": "0.001 USDC",
                "Total": "0.003 USDC"
            },
            timestamp: new Date().toISOString()
        };

        console.log(`   ✅ Recomendación completa enviada`);

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
        capabilities: ["fashion_advice", "outfit_recommendation", "weather_based_styling"],
        dependencies: [{
            name: "Weather Agent",
            address: WEATHER_AGENT.address,
            cost: "0.001 USDC"
        }]
    });
});

// Start server
app.listen(AGENT_CONFIG.port, () => {
    console.log(`\n👔 ${AGENT_CONFIG.name} iniciado!`);
    console.log(`   Puerto: ${AGENT_CONFIG.port}`);
    console.log(`   Precio: ${AGENT_CONFIG.pricePerQuery} USDC (+ 0.001 USDC Weather Agent)`);
    console.log(`   Wallet: ${AGENT_CONFIG.walletAddress}`);
    console.log(`   Endpoints:`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/a2a/message (A2A Protocol)`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/query (Public)`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/health`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/info`);
    console.log(`\n   Listo para dar recomendaciones de moda! 👗\n`);
});
