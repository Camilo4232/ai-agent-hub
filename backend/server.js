import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint (required by Railway)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.1.0'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'operational',
        agents: {
            weather: {
                name: 'Weather Agent',
                status: 'active',
                port: 3001,
                price: '0.001 USDC'
            },
            fashion: {
                name: 'Fashion Agent',
                status: 'active',
                port: 3002,
                price: '0.003 USDC'
            },
            activities: {
                name: 'Activities Agent',
                status: 'active',
                port: 3003,
                price: '0.008 USDC'
            }
        },
        blockchain: {
            network: 'Sepolia Testnet',
            chainId: 11155111,
            contracts: {
                paymentProcessor: process.env.PAYMENT_PROCESSOR_ADDRESS,
                agentRegistry: process.env.AGENT_REGISTRY_ADDRESS,
                usdc: process.env.USDC_ADDRESS
            }
        },
        x402: {
            facilitator: 'https://facilitator.ultravioletadao.xyz/',
            supportedChains: 13,
            gasless: true
        }
    });
});

// Agent proxy endpoints - forward requests to individual agent services
// In production, these would be separate microservices or running on Railway

// Weather Agent endpoint
app.post('/api/agents/weather/query', async (req, res) => {
    try {
        const { query, paymentId } = req.body;

        // Simulate weather agent response
        // In production, this would call the actual weather agent microservice
        const response = {
            success: true,
            agent: 'Weather Agent',
            query,
            paymentId,
            result: {
                location: extractLocation(query),
                temperature: Math.floor(Math.random() * 30) + 10,
                condition: ['Soleado', 'Nublado', 'Lluvioso'][Math.floor(Math.random() * 3)],
                humidity: Math.floor(Math.random() * 40) + 50,
                wind: Math.floor(Math.random() * 20) + 5
            },
            timestamp: Date.now()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fashion Agent endpoint
app.post('/api/agents/fashion/query', async (req, res) => {
    try {
        const { query, paymentId } = req.body;

        const response = {
            success: true,
            agent: 'Fashion Agent',
            query,
            paymentId,
            result: {
                location: extractLocation(query),
                recommendations: [
                    'Ropa ligera y cómoda',
                    'Lentes de sol',
                    'Zapatos deportivos'
                ],
                style: 'Casual urbano',
                season: 'Verano'
            },
            timestamp: Date.now()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Activities Agent endpoint
app.post('/api/agents/activities/query', async (req, res) => {
    try {
        const { query, paymentId } = req.body;

        const response = {
            success: true,
            agent: 'Activities Agent',
            query,
            paymentId,
            result: {
                location: extractLocation(query),
                activities: [
                    '🌅 Amanecer en la playa',
                    '🏛️ Tour por museos',
                    '🍽️ Cena en restaurante local',
                    '🌃 Vista nocturna de la ciudad'
                ],
                duration: 'Día completo',
                budget: 'Medio'
            },
            timestamp: Date.now()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to extract location from query
function extractLocation(query) {
    const cities = ['new york', 'london', 'tokyo', 'paris', 'miami', 'barcelona', 'rome', 'sydney'];
    const queryLower = query.toLowerCase();

    for (const city of cities) {
        if (queryLower.includes(city)) {
            return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }

    return 'Unknown Location';
}

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/web3', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'web3-integration.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: [
            'GET /health',
            'GET /api/status',
            'POST /api/agents/weather/query',
            'POST /api/agents/fashion/query',
            'POST /api/agents/activities/query',
            'GET /',
            'GET /web3'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AI Agent Hub Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/`);
    console.log(`🔗 Web3 Interface: http://localhost:${PORT}/web3`);
    console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
    console.log(`\n🤖 Agents available:`);
    console.log(`   - Weather Agent (0.001 USDC)`);
    console.log(`   - Fashion Agent (0.003 USDC)`);
    console.log(`   - Activities Agent (0.008 USDC)`);
    console.log(`\n💡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Network: Sepolia Testnet`);
    console.log(`✨ X402 Gasless Payments: Enabled`);
});

export default app;
