const { sendText, sendInteractiveList, sendInteractiveButtons } = require('./whatsapp');
const { getClientByPhone } = require('./supabase');

const userSessions = new Map();

async function handleMessage(from, message) {
  const session = userSessions.get(from) || { state: 'START' };
  const text = message.trim().toLowerCase(); // Padroniza o que a pessoa digitou

  switch (session.state) {
    case 'START':
      // 1. Busca os dados do cliente no Supabase
      const clientData = await getClientByPhone(from);
      const name = clientData && clientData.name ? clientData.name.split(' ')[0] : '';
      
      // 2. Saudação Personalizada
      const greeting = name 
        ? `Olá, *${name}*! 👋\n\nSeja muito bem-vindo(a) à *VERTO*! 🏛️\n\nSerá um enorme prazer atendê-lo(a). Estou à sua disposição para fornecer informações, esclarecer dúvidas e auxiliar no que você precisar. ✨`
        : `Olá! 👋\n\nSeja muito bem-vindo(a) à *VERTO*! 🏛️\n\nSerá um enorme prazer atendê-lo(a). Estou à sua disposição para fornecer informações, esclarecer dúvidas e auxiliar no que você precisar. ✨`;
      
      await sendText(from, greeting);

      // 3. Menu Principal
      const listSections = [
        {
          title: "Opções de Atendimento",
          rows: [
            { id: '1', title: "Já sou cliente" },
            { id: '2', title: "Saber mais sobre a aula", description: "Aula grátis do LicitAgências" },
            { id: '3', title: "Assessoria Licitações", description: "Saber mais sobre Assessoria" },
            { id: '4', title: "Selfbooking", description: "Falar sobre a plataforma" }
          ]
        }
      ];

      await sendInteractiveList(
        from, 
        "Por favor, escolha uma das opções abaixo para continuarmos:", 
        "Ver Opções ⬇️", 
        listSections
      );

      userSessions.set(from, { state: 'AWAIT_MAIN_MENU' });
      break;

    case 'AWAIT_MAIN_MENU':
      if (text === '1' || text === 'já sou cliente') {
        await sendText(from, "Perfeito! ✅\n\nEm instantes, um de nossos especialistas dará continuidade ao seu atendimento. 👨‍💻\n\n_(Para voltar ao menu inicial, digite *menu*)_");
        await notifyAttendant(from, "Gerentes de carteiras");
        userSessions.set(from, { state: 'IN_ATTENDANCE' });
      } 
      else if (text === '2' || text.includes('saber mais sobre a aula')) {
        await sendText(from, "📅 *DIA 7 DE MAIO* acontecerá nossa *aula 100% gratuita* sobre licitações para agências de viagens!\n\nNão perca essa oportunidade e acompanhe tudo na nossa comunidade VIP! 🚀\n\n👉 *Acesse aqui:* https://chat.whatsapp.com/DqzM4NbrhfX8qrTgf\n\n_(Para voltar ao menu inicial, digite *menu*)_");
        userSessions.delete(from); // Fim de fluxo
      }
      else if (text === '3' || text.includes('assessoria licitações')) {
        await sendText(from, "Excelente escolha! 🎯\n\nEm instantes, um de nossos consultores comerciais dará continuidade ao seu atendimento para tirar todas as suas dúvidas.\n\n_(Para voltar ao menu inicial, digite *menu*)_");
        await notifyAttendant(from, "Comercial");
        userSessions.set(from, { state: 'IN_ATTENDANCE' });
      }
      else if (text === '4' || text === 'selfbooking') {
        const buttons = [
          { id: '1', title: "Falar com Suporte" },
          { id: '2', title: "Saber mais" }
        ];
        
        await sendInteractiveButtons(
          from,
          "Como podemos ajudar você hoje com a nossa plataforma? 💻",
          buttons
        );
        userSessions.set(from, { state: 'AWAIT_SELF_BOOKING' });
      } else {
        await sendText(from, "🤔 Desculpe, não entendi. Por favor, clique em um dos botões ou digite o número da opção desejada.");
      }
      break;

    case 'AWAIT_SELF_BOOKING':
      if (text === '1' || text === 'falar com suporte') {
        await sendText(from, "Tudo certo! 🛠️\n\nEm instantes, a nossa equipe de suporte técnico vai te ajudar com a plataforma.\n\n_(Para voltar ao menu inicial, digite *menu*)_");
        await notifyAttendant(from, "Suporte");
        userSessions.set(from, { state: 'IN_ATTENDANCE' });
      }
      else if (text === '2' || text === 'saber mais') {
        await sendText(from, "Maravilha! ✨\n\nEm instantes, um de nossos especialistas vai te explicar tudo sobre as vantagens da nossa plataforma.\n\n_(Para voltar ao menu inicial, digite *menu*)_");
        await notifyAttendant(from, "Comercial");
        userSessions.set(from, { state: 'IN_ATTENDANCE' });
      }
      else {
        await sendText(from, "🤔 Desculpe, não entendi. Por favor, clique em um dos botões para continuarmos.");
      }
      break;

    case 'IN_ATTENDANCE':
      // Se a pessoa digitar "sair" ou "voltar", reiniciamos o bot
      if (text === 'sair' || text === 'voltar' || text === 'menu') {
         userSessions.set(from, { state: 'START' });
         await handleMessage(from, 'start');
      }
      break;
  }
}

async function notifyAttendant(clientPhone, department) {
  console.log(`\n===========================================`);
  console.log(`[ATENÇÃO] TRANSFERÊNCIA PARA ATENDENTE!`);
  console.log(`Departamento: ${department}`);
  console.log(`Cliente/Telefone: ${clientPhone}`);
  console.log(`===========================================\n`);
}

module.exports = { handleMessage };
