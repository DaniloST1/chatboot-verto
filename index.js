require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { handleMessage } = require('./flow');
const { setClient } = require('./whatsapp');
const express = require('express');

// Cria um servidor web básico apenas para manter as plataformas de nuvem felizes
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('O robô do WhatsApp está rodando perfeitamente!');
});

app.listen(port, () => {
  console.log(`Servidor de monitoramento rodando na porta ${port}`);
});

// Inicializa o cliente do WhatsApp Web simulado
const client = new Client({
    authStrategy: new LocalAuth(), // Salva a sessão para você não precisar ler o QR Code toda hora
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Fornece a instância do cliente para o arquivo whatsapp.js
setClient(client);

client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('📱 ESCANEIE O QR CODE ABAIXO COM O SEU WHATSAPP');
    console.log('=========================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n✅ Tudo pronto! O Robô do WhatsApp está conectado e ouvindo mensagens!\n');
});

client.on('message', async (msg) => {
    // Ignora mensagens de grupos ou mensagens do sistema
    if (msg.from.includes('@g.us') || msg.from === 'status@broadcast') return;

    // Se o usuário clicar em um botão ou lista, extraímos o ID ou o Título
    let userText = msg.body;
    if (msg.type === 'list_response') {
        userText = msg.selectedRowId || msg.body;
    } else if (msg.type === 'buttons_response') {
        userText = msg.selectedButtonId || msg.body;
    }

    await handleMessage(msg.from, userText);
});

client.initialize();
