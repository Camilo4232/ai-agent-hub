/**
 * Demo A2A Communication
 *
 * Este script demuestra la comunicación entre los 3 agentes:
 * 1. Weather Agent (puerto 3001)
 * 2. Fashion Agent (puerto 3002) - consulta a Weather Agent
 * 3. Activities Agent (puerto 3003) - consulta a Weather y Fashion Agents
 */

const CITIES = ['new york', 'london', 'tokyo', 'paris', 'miami'];

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const printHeader = (title) => {
    console.log('\n' + '='.repeat(80));
    console.log(title.toUpperCase().padStart((80 + title.length) / 2));
    console.log('='.repeat(80) + '\n');
};

const printSection = (title) => {
    console.log('\n' + '─'.repeat(80));
    console.log('🔹 ' + title);
    console.log('─'.repeat(80));
};

// Test individual agent
async function testAgent(name, url, query) {
    printSection(`Probando ${name}`);

    console.log(`📍 Endpoint: ${url}`);
    console.log(`❓ Query: "${query}"\n`);

    try {
        const startTime = Date.now();
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, paymentId: 'demo_payment_123' })
        });

        const data = await response.json();
        const elapsed = Date.now() - startTime;

        if (data.success) {
            console.log(`✅ Respuesta recibida en ${elapsed}ms\n`);
            console.log(data.answer);

            if (data.breakdown) {
                console.log(`\n💰 Desglose de costos:`);
                Object.entries(data.breakdown).forEach(([key, value]) => {
                    console.log(`   ${key}: ${value}`);
                });
            }

            if (data.agentsConsulted) {
                console.log(`\n🤖 Agentes consultados: ${data.agentsConsulted}`);
            }
        } else {
            console.log(`❌ Error: ${data.error}`);
            if (data.hint) {
                console.log(`💡 ${data.hint}`);
            }
        }

        return { success: data.success, elapsed, data };

    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Check if all agents are running
async function checkAgents() {
    printSection('Verificando estado de los agentes');

    const agents = [
        { name: 'Weather Agent', port: 3001 },
        { name: 'Fashion Agent', port: 3002 },
        { name: 'Activities Agent', port: 3003 }
    ];

    const results = [];

    for (const agent of agents) {
        try {
            const response = await fetch(`http://localhost:${agent.port}/health`, {
                method: 'GET'
            });
            const data = await response.json();

            if (data.status === 'healthy') {
                console.log(`✅ ${agent.name} - Running on port ${agent.port}`);
                results.push({ ...agent, status: 'running', data });
            } else {
                console.log(`⚠️  ${agent.name} - Unhealthy`);
                results.push({ ...agent, status: 'unhealthy' });
            }
        } catch (error) {
            console.log(`❌ ${agent.name} - Not running (port ${agent.port})`);
            results.push({ ...agent, status: 'offline', error: error.message });
        }
    }

    const allRunning = results.every(r => r.status === 'running');

    if (!allRunning) {
        console.log(`\n⚠️  No todos los agentes están corriendo.`);
        console.log(`💡 Inicia los agentes con: npm run agents:start\n`);
        return false;
    }

    console.log(`\n✅ Todos los agentes están corriendo correctamente!\n`);
    return true;
}

// Demo sequence
async function runDemo() {
    printHeader('🤖 Demo de Comunicación A2A - AI Agent Hub');

    console.log('Este demo muestra cómo los agentes se comunican entre sí:');
    console.log('  1️⃣  Weather Agent - Proporciona datos meteorológicos');
    console.log('  2️⃣  Fashion Agent - Consulta a Weather y recomienda ropa');
    console.log('  3️⃣  Activities Agent - Consulta a ambos y sugiere actividades\n');

    // Check if all agents are running
    const allRunning = await checkAgents();
    if (!allRunning) {
        console.log('❌ Demo abortado. Por favor inicia todos los agentes primero.\n');
        return;
    }

    await sleep(1000);

    // Select random city
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    console.log(`🎯 Ciudad seleccionada para el demo: ${city.toUpperCase()}\n`);

    await sleep(500);

    // Test 1: Weather Agent (standalone)
    printHeader('Test 1: Weather Agent (Standalone)');
    await testAgent(
        'Weather Agent',
        'http://localhost:3001/query',
        `clima en ${city}`
    );

    await sleep(2000);

    // Test 2: Fashion Agent (calls Weather Agent)
    printHeader('Test 2: Fashion Agent (Consulta a Weather Agent)');
    console.log('Fashion Agent consultará automáticamente al Weather Agent vía A2A...\n');
    await sleep(1000);

    await testAgent(
        'Fashion Agent',
        'http://localhost:3002/query',
        `qué ropa usar en ${city}`
    );

    await sleep(2000);

    // Test 3: Activities Agent (calls both agents)
    printHeader('Test 3: Activities Agent (Consulta a ambos agentes)');
    console.log('Activities Agent consultará a Weather y Fashion Agents en paralelo vía A2A...\n');
    await sleep(1000);

    await testAgent(
        'Activities Agent',
        'http://localhost:3003/query',
        `qué actividades hacer en ${city}`
    );

    await sleep(1000);

    // Summary
    printHeader('🎉 Demo Completado');
    console.log('Has visto cómo:');
    console.log('  ✅ Weather Agent proporciona datos meteorológicos');
    console.log('  ✅ Fashion Agent consulta a Weather Agent vía A2A');
    console.log('  ✅ Activities Agent consulta a ambos agentes en paralelo');
    console.log('  ✅ Los costos se suman automáticamente (0.008 USDC total)');
    console.log('  ✅ Todo funciona en tiempo real con comunicación entre agentes\n');

    console.log('💡 Próximos pasos:');
    console.log('  - Prueba con diferentes ciudades: new york, london, tokyo, paris, miami');
    console.log('  - Consulta cada agente individualmente en su puerto');
    console.log('  - Revisa los logs de cada agente para ver la comunicación A2A\n');

    console.log('📚 Documentación: Ver AGENTS_README.md para más detalles\n');
}

// Run the demo
console.log('🚀 Iniciando demo en 2 segundos...\n');
sleep(2000).then(runDemo).catch(error => {
    console.error('❌ Error ejecutando demo:', error);
    process.exit(1);
});
