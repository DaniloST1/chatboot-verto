require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { handleMessage } = require('./flow');
const { setClient } = require('./whatsapp');
const express = require('express');
const cors = require('cors');

// Cria um servidor web para expor a API do QR Code
const app = express();
app.use(cors()); // Permite que o Verto acesse a API
const port = process.env.PORT || 3000;

let currentQR = null;
let isConnected = false;

app.get('/', (req, res) => {
  res.send('O robô do WhatsApp está rodando!');
});

// Endpoint que o painel Verto vai chamar
app.get('/api/qr', (req, res) => {
  res.json({ qr: currentQR, connected: isConnected });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // <- Essa flag salva muita memória no Docker
          '--disable-gpu'
        ]
    }
});

setClient(client);

client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('📱 ESCANEIE O QR CODE ABAIXO COM O SEU WHATSAPP');
    console.log('=========================================\n');
    qrcode.generate(qr, { small: true });
    
    currentQR = qr; // Salva o QR Code para a API
    isConnected = false;
});

client.on('ready', () => {
    console.log('\n✅ Tudo pronto! O Robô do WhatsApp está conectado!\n');
    currentQR = null;
    isConnected = true;
});

client.on('disconnected', () => {
    isConnected = false;
    currentQR = null;
});

client.on('message', async (msg) => {
    if (msg.from.includes('@g.us') || msg.from === 'status@broadcast') return;

    let userText = msg.body;
    if (msg.type === 'list_response') {
        userText = msg.selectedRowId || msg.body;
    } else if (msg.type === 'buttons_response') {
        userText = msg.selectedButtonId || msg.body;
    }

    await handleMessage(msg.from, userText);
});

client.initialize();
