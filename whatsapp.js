const { List, Buttons } = require('whatsapp-web.js');

let whatsappClient = null;

function setClient(client) {
    whatsappClient = client;
}

async function sendText(to, text) {
    if (!whatsappClient) return;
    try {
        await whatsappClient.sendMessage(to, text);
    } catch (error) {
        console.error('Erro ao enviar texto:', error);
    }
}

async function sendInteractiveList(to, text, buttonText, sections) {
    if (!whatsappClient) return;
    try {
        const formattedSections = sections.map(sec => ({
            title: sec.title,
            rows: sec.rows.map(row => ({ id: row.id, title: row.title, description: row.description || '' }))
        }));
        
        const list = new List(text, buttonText, formattedSections, "VERTO", "Por favor, selecione uma opção");
        await whatsappClient.sendMessage(to, list);
    } catch (error) {
        console.error('Erro ao enviar lista interativa:', error);
    }
}

async function sendInteractiveButtons(to, text, buttonsArr) {
    if (!whatsappClient) return;
    try {
        const formattedButtons = buttonsArr.map(b => ({ body: b.title, id: b.id }));
        const buttons = new Buttons(text, formattedButtons, "Como podemos ajudá-lo(a)?", "VERTO");
        await whatsappClient.sendMessage(to, buttons);
    } catch (error) {
        console.error('Erro ao enviar botões:', error);
    }
}

module.exports = { setClient, sendText, sendInteractiveList, sendInteractiveButtons };
