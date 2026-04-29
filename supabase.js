const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Busca o cliente pelo número de telefone
async function getClientByPhone(phone) {
  try {
    // O WhatsApp envia o número no formato DDI + DDD + Numero (ex: 5511999999999)
    // Precisamos ajustar dependendo de como está salvo no seu banco de dados
    
    // Tenta buscar na tabela de clientes
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }

    // Procura por um cliente cujo telefone corresponda (limpando caracteres especiais)
    const matchedClient = clients.find(c => {
      if (!c.phone) return false;
      const cleanPhone = c.phone.replace(/\D/g, '');
      // Verifica se o número do whatsapp (from) contém o número limpo do banco
      return phone.includes(cleanPhone) || cleanPhone.includes(phone.substring(2));
    });

    return matchedClient || null;
  } catch (err) {
    console.error('Erro na consulta ao Supabase:', err);
    return null;
  }
}

module.exports = { supabase, getClientByPhone };
