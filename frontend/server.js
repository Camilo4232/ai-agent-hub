const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './web3-integration.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Error del servidor: ' + error.code);
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('  🚀 Servidor Web Local - AI Agent Hub');
    console.log('========================================');
    console.log('');
    console.log(`✓ Servidor corriendo en: http://localhost:${PORT}`);
    console.log('');
    console.log('📱 Abre en tu navegador:');
    console.log(`   http://localhost:${PORT}/web3-integration.html`);
    console.log('');
    console.log('🔍 Diagnóstico de wallet:');
    console.log(`   http://localhost:${PORT}/test-wallet-detection.html`);
    console.log('');
    console.log('⏹️  Presiona Ctrl+C para detener el servidor');
    console.log('========================================');
    console.log('');
});
