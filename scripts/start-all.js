import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║       🚀 AI Agent Hub - Starting All Services                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

const processes = [];

function startProcess(name, command, args, cwd) {
  console.log(`\n▶️  Starting ${name}...`);

  const proc = spawn(command, args, {
    cwd: cwd || path.join(__dirname, '..'),
    shell: true,
    stdio: 'pipe'
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`[${name}] ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`[${name}] ${line}`);
      }
    });
  });

  proc.on('close', (code) => {
    console.log(`\n❌ ${name} exited with code ${code}`);
  });

  processes.push({ name, proc });

  return proc;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down all services...\n');

  processes.forEach(({ name, proc }) => {
    console.log(`   Stopping ${name}...`);
    proc.kill();
  });

  setTimeout(() => {
    console.log('\n✅ All services stopped\n');
    process.exit(0);
  }, 1000);
});

// Start server
console.log('\n📋 Services to start:');
console.log('   1. Backend Server (port 3000)');
console.log('   2. Agent Demo (optional)\n');

setTimeout(() => {
  startProcess('Server', 'node', ['backend/server.js']);

  console.log('\n💡 Server starting...');
  console.log('   API: http://localhost:3000');
  console.log('   Health: http://localhost:3000/health');
  console.log('   Frontend: Open frontend/web3-integration.html in browser\n');

  console.log('💡 To run demo agent (in another terminal):');
  console.log('   npm run agent\n');

  console.log('🛑 Press Ctrl+C to stop all services\n');
  console.log('═'.repeat(63) + '\n');
}, 1000);
