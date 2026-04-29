// =====================================
// IMPORTAÇÕES
// =====================================
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, Buttons } = require("whatsapp-web.js");

// =====================================
// CONFIGURAÇÃO
// =====================================
const EMPRESA = "Verto Soluções em Licitações";

// =====================================
// CLIENTE
// =====================================
const client = new Client({
  authStrategy: new LocalAuth(),
});

// =====================================
// ESTADOS
// =====================================
const estados = {};

// =====================================
// QR CODE
// =====================================
client.on("qr", (qr) => {
  console.log("📲 Escaneie o QR Code:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot conectado - " + EMPRESA);
});

client.initialize();

// =====================================
// UTIL
// =====================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function typing(chat) {
  try {
    await chat.sendStateTyping();
    await delay(1000);
  } catch { }
}

// =====================================
// MENU PRINCIPAL (COM BOTÕES)
// =====================================
async function enviarMenu(msg, chat) {
  const nome = msg._data.notifyName || "Cliente";

  await typing(chat);

  const buttons = new Buttons(
    `Olá, ${nome}! 👋\n\n` +
    `Seja bem-vindo(a) à *${EMPRESA}*.\n\n` +
    `Somos especialistas em ajudar empresas a vender para o governo através de licitações.\n\n` +
    `Como podemos te ajudar hoje?`,
    [
      { body: "👤 Já sou cliente" },
      { body: "🎓 Aula gratuita" },
      { body: "📊 Assessoria em Licitações" },
      { body: "💻 Plataforma Selfbooking" }
    ],
    "Atendimento Verto",
    "Selecione uma opção"
  );

  await client.sendMessage(msg.from, buttons);
  estados[msg.from] = "menu";
}

// =====================================
// SUBMENU SELFBOOKING
// =====================================
async function menuSelfbooking(msg) {
  const buttons = new Buttons(
    `💻 *Plataforma Selfbooking*\n\nComo podemos te ajudar?`,
    [
      { body: "🛠 Suporte" },
      { body: "📖 Saber mais" },
      { body: "🔙 Voltar ao menu" }
    ],
    EMPRESA,
    "Escolha uma opção"
  );

  await client.sendMessage(msg.from, buttons);
  estados[msg.from] = "selfbooking";
}

// =====================================
// VOLTAR MENU AUTOMÁTICO
// =====================================
async function voltarMenu(msg, chat) {
  await delay(2500);
  await enviarMenu(msg, chat);
}

// =====================================
// EVENTO DE MENSAGEM
// =====================================
client.on("message", async (msg) => {
  try {
    if (msg.from.endsWith("@g.us")) return;

    const chat = await msg.getChat();
    const texto = msg.body?.trim().toLowerCase() || "";

    // =====================================
    // SAUDAÇÕES (CORRIGIDO)
    // =====================================
    if (/^(oi|olá|ola|bom dia|boa tarde|boa noite)$/i.test(texto)) {
      await enviarMenu(msg, chat);
      return;
    }

    // =====================================
    // COMANDO UNIVERSAL
    // =====================================
    if (texto.includes("menu") || texto.includes("voltar")) {
      await enviarMenu(msg, chat);
      return;
    }

    // =====================================
    // PRIMEIRA INTERAÇÃO
    // =====================================
    if (!estados[msg.from]) {
      await enviarMenu(msg, chat);
      return;
    }

    // =====================================
    // MENU PRINCIPAL
    // =====================================
    if (estados[msg.from] === "menu") {

      if (texto.includes("cliente")) {
        await typing(chat);
        await client.sendMessage(msg.from,
          "👤 *Atendimento ao Cliente*\n\n" +
          "Perfeito! Vou encaminhar você para um de nossos especialistas.\n" +
          "Em instantes, um atendente dará continuidade ao seu atendimento."
        );
        await voltarMenu(msg, chat);
      }

      else if (texto.includes("aula")) {
        await typing(chat);
        await client.sendMessage(msg.from,
          "🎓 *Aula Gratuita*\n\n" +
          "Participe do nosso aulão 100% gratuito sobre licitações!\n\n" +
          "👉 Entre na comunidade:\n" +
          "https://chat.whatsapp.com/DqzM4NbrhfX8qrTgf2KG08"
        );
        await voltarMenu(msg, chat);
      }

      else if (texto.includes("assessoria")) {
        await typing(chat);
        await client.sendMessage(msg.from,
          "📊 *Assessoria em Licitações*\n\n" +
          "Nós cuidamos de todo o processo para sua empresa vender para o governo.\n\n" +
          "Um especialista irá te chamar em instantes."
        );
        await voltarMenu(msg, chat);
      }

      else if (texto.includes("self")) {
        await menuSelfbooking(msg);
      }

      else {
        // 🔥 CORREÇÃO: resposta + menu no mesmo envio
        const buttons = new Buttons(
          `Não entendi sua resposta 🤔\n\nPor favor, selecione uma opção abaixo:`,
          [
            { body: "👤 Já sou cliente" },
            { body: "🎓 Aula gratuita" },
            { body: "📊 Assessoria em Licitações" },
            { body: "💻 Plataforma Selfbooking" }
          ],
          "Atendimento Verto",
          "Escolha uma opção"
        );

        await client.sendMessage(msg.from, buttons);
      }
    }

    // =====================================
    // SELFBOOKING
    // =====================================
    else if (estados[msg.from] === "selfbooking") {

      if (texto.includes("suporte")) {
        await typing(chat);
        await client.sendMessage(msg.from,
          "🛠 *Suporte Técnico*\n\n" +
          "Perfeito! Nosso time de suporte será acionado.\n" +
          "Em instantes você será atendido."
        );
        await voltarMenu(msg, chat);
      }

      else if (texto.includes("saber")) {
        await typing(chat);
        await client.sendMessage(msg.from,
          "📖 *Sobre a Plataforma*\n\n" +
          "Nossa plataforma permite que você gerencie suas vendas para o governo de forma simples, rápida e eficiente.\n\n" +
          "Um consultor irá te explicar tudo em detalhes."
        );
        await voltarMenu(msg, chat);
      }

      else {
        const buttons = new Buttons(
          "Escolha uma opção válida 👇",
          [
            { body: "🛠 Suporte" },
            { body: "📖 Saber mais" },
            { body: "🔙 Voltar ao menu" }
          ],
          EMPRESA,
          "Selecione"
        );

        await client.sendMessage(msg.from, buttons);
      }
    }

  } catch (error) {
    console.error("❌ Erro:", error);
  }
});