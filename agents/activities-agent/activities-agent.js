import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// Agent configuration
const AGENT_CONFIG = {
    name: "Activities Agent",
    description: "Asesor de actividades basado en clima y moda",
    port: 3003,
    pricePerQuery: "0.005",
    walletAddress: "0x3333333333333333333333333333333333333333" // Mock address
};

// Other agents connections
const WEATHER_AGENT = {
    endpoint: "http://localhost:3001/a2a/message",
    address: "0x1111111111111111111111111111111111111111"
};

const FASHION_AGENT = {
    endpoint: "http://localhost:3002/a2a/message",
    address: "0x2222222222222222222222222222222222222222"
};

// Activity recommendations based on weather
const getActivities = (weather) => {
    const { temp, condition } = weather;
    const isRainy = condition.toLowerCase().includes('lluv') || condition.toLowerCase().includes('rain');

    let outdoor = [];
    let indoor = [];
    let recommendation = "";

    if (isRainy) {
        indoor = [
            "Visitar museos",
            "Ir al cine",
            "Café y lectura",
            "Shopping en centros comerciales",
            "Bowling"
        ];
        outdoor = [
            "Caminar con paraguas (si es lluvia ligera)"
        ];
        recommendation = "Día perfecto para actividades bajo techo. El clima lluvioso es ideal para actividades culturales.";
    } else if (temp < 10) {
        indoor = [
            "Spa y sauna",
            "Restaurantes acogedores",
            "Museos y galerías",
            "Teatro"
        ];
        outdoor = [
            "Esquí (si hay nieve)",
            "Patinaje sobre hielo",
            "Caminata invernal corta"
        ];
        recommendation = "Hace frío. Mejor enfocarse en actividades indoor o deportes de invierno.";
    } else if (temp < 20) {
        indoor = [
            "Gimnasio",
            "Cafeterías",
            "Museos"
        ];
        outdoor = [
            "Caminata en el parque",
            "Ciclismo",
            "Visitar jardines",
            "Picnic",
            "Golf"
        ];
        recommendation = "Clima templado, perfecto para actividades al aire libre moderadas.";
    } else if (temp < 30) {
        outdoor = [
            "Picnic en el parque",
            "Ciclismo",
            "Senderismo",
            "Deportes acuáticos",
            "Playa",
            "Tenis",
            "Correr",
            "Yoga al aire libre"
        ];
        indoor = [
            "Piscina cubierta (si hace mucho calor)"
        ];
        recommendation = "¡Clima ideal! Aprovecha para actividades al aire libre.";
    } else {
        outdoor = [
            "Playa y natación",
            "Deportes acuáticos",
            "Actividades cerca del agua"
        ];
        indoor = [
            "Piscina cubierta con aire acondicionado",
            "Museos con AC",
            "Cine",
            "Centros comerciales"
        ];
        recommendation = "Hace mucho calor. Busca actividades cerca del agua o lugares con aire acondicionado.";
    }

    return { outdoor, indoor, recommendation };
};

// Query another agent via A2A
async function queryAgent(agentEndpoint, agentName, query, messageId) {
    try {
        console.log(`   🔗 Consultando ${agentName}...`);

        const response = await fetch(agentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                senderId: AGENT_CONFIG.walletAddress,
                messageId: messageId + '_' + agentName.toLowerCase().replace(' ', '_'),
                paymentProof: 'demo'
            })
        });

        if (!response.ok) {
            throw new Error(`${agentName} respondió con ${response.status}`);
        }

        const data = await response.json();
        console.log(`   ✅ Respuesta recibida de ${agentName}`);

        return data;

    } catch (error) {
        console.error(`   ❌ Error consultando ${agentName}:`, error.message);
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
        dependencies: ["Weather Agent", "Fashion Agent"],
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

        // Extract city (search for cities anywhere in the query)
        const cityMatch = query.toLowerCase().match(/(new york|london|tokyo|paris|miami)/i);
        const city = cityMatch ? cityMatch[1] : 'new york';

        // Query both agents in parallel
        const [weatherResponse, fashionResponse] = await Promise.all([
            queryAgent(WEATHER_AGENT.endpoint, "Weather Agent", `clima en ${city}`, messageId),
            queryAgent(FASHION_AGENT.endpoint, "Fashion Agent", `moda en ${city}`, messageId)
        ]);

        const weather = weatherResponse.data;
        const activities = getActivities(weather);

        const response = {
            success: true,
            agentId: AGENT_CONFIG.walletAddress,
            agentName: AGENT_CONFIG.name,
            messageId: messageId || crypto.randomUUID(),
            replyTo: messageId,
            timestamp: new Date().toISOString(),
            answer: `🎯 Plan completo para ${city}:\n\n` +
                    `Actividades outdoor: ${activities.outdoor.join(', ')}\n` +
                    `Actividades indoor: ${activities.indoor.join(', ')}\n` +
                    `💡 ${activities.recommendation}`,
            data: {
                city,
                weather,
                activities,
                fashionAdvice: fashionResponse.data
            },
            cost: AGENT_CONFIG.pricePerQuery + " USDC",
            dependencies: ["Weather Agent: 0.001 USDC", "Fashion Agent: 0.002 USDC"]
        };

        console.log(`   ✅ Plan completo enviado para ${city}`);

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

        // Extract city (search for cities anywhere in the query)
        const cityMatch = query.toLowerCase().match(/(new york|london|tokyo|paris|miami)/i);
        const city = cityMatch ? cityMatch[1] : 'new york';

        const messageId = crypto.randomUUID();

        console.log(`\n🔄 Consultando agentes dependientes en paralelo...`);

        // Query both agents in parallel for better performance
        const [weatherResponse, fashionResponse] = await Promise.all([
            queryAgent(WEATHER_AGENT.endpoint, "Weather Agent", `clima en ${city}`, messageId),
            queryAgent(FASHION_AGENT.endpoint, "Fashion Agent", `moda en ${city}`, messageId)
        ]);

        const weather = weatherResponse.data;
        const fashion = fashionResponse.data.fashion;
        const activities = getActivities(weather);

        const response = {
            success: true,
            agentName: AGENT_CONFIG.name,
            answer: `🎯 PLAN COMPLETO PARA ${city.toUpperCase()}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `☀️ CLIMA:\n` +
                    `  ${weather.condition}, ${weather.temp}°C\n` +
                    `  Humedad: ${weather.humidity}%, Viento: ${weather.wind} km/h\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🏃 ACTIVIDADES RECOMENDADAS:\n\n` +
                    `🌳 Al aire libre:\n${activities.outdoor.map(a => `  • ${a}`).join('\n')}\n\n` +
                    `🏢 Bajo techo:\n${activities.indoor.map(a => `  • ${a}`).join('\n')}\n\n` +
                    `💡 Recomendación: ${activities.recommendation}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `👔 QUÉ PONERSE:\n\n` +
                    `👕 Vestimenta:\n${fashion.outfit.map(item => `  • ${item}`).join('\n')}\n\n` +
                    `🎒 Accesorios:\n${fashion.accessories.map(item => `  • ${item}`).join('\n')}\n\n` +
                    `👟 Calzado: ${fashion.footwear}\n\n` +
                    `💡 ${fashion.tip}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `¡Disfruta tu día en ${city}! 🌟`,
            data: {
                city,
                weather,
                activities,
                fashion
            },
            cost: AGENT_CONFIG.pricePerQuery + " USDC",
            breakdown: {
                "Activities Agent": AGENT_CONFIG.pricePerQuery + " USDC",
                "Weather Agent": "0.001 USDC",
                "Fashion Agent": "0.002 USDC",
                "Total": "0.008 USDC"
            },
            agentsConsulted: 3,
            timestamp: new Date().toISOString()
        };

        console.log(`   ✅ Plan completo generado exitosamente`);

        res.json(response);

    } catch (error) {
        console.error(`❌ Error:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            hint: "Asegúrate de que Weather Agent (puerto 3001) y Fashion Agent (puerto 3002) estén corriendo"
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
        capabilities: ["activity_recommendations", "complete_planning", "multi_agent_coordination"],
        dependencies: [
            {
                name: "Weather Agent",
                address: WEATHER_AGENT.address,
                cost: "0.001 USDC"
            },
            {
                name: "Fashion Agent",
                address: FASHION_AGENT.address,
                cost: "0.002 USDC"
            }
        ],
        totalCost: "0.008 USDC (including all dependencies)"
    });
});

// Start server
app.listen(AGENT_CONFIG.port, () => {
    console.log(`\n🎯 ${AGENT_CONFIG.name} iniciado!`);
    console.log(`   Puerto: ${AGENT_CONFIG.port}`);
    console.log(`   Precio: ${AGENT_CONFIG.pricePerQuery} USDC`);
    console.log(`   Precio Total: 0.008 USDC (incluye dependencias)`);
    console.log(`   Wallet: ${AGENT_CONFIG.walletAddress}`);
    console.log(`\n   Dependencias:`);
    console.log(`   - Weather Agent (0.001 USDC)`);
    console.log(`   - Fashion Agent (0.002 USDC)`);
    console.log(`\n   Endpoints:`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/a2a/message (A2A Protocol)`);
    console.log(`   - POST http://localhost:${AGENT_CONFIG.port}/query (Public)`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/health`);
    console.log(`   - GET  http://localhost:${AGENT_CONFIG.port}/info`);
    console.log(`\n   Listo para planear tu día perfecto! 🌟\n`);
});
