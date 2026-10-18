// supabaseClient.js
// Ficheiro único e partilhado por TODAS as páginas (participante e staff).
// Se mudares o projeto Supabase, só precisas de alterar estas duas linhas.
//
// IMPORTANTE: este ficheiro NÃO usa "import". É carregado como script normal.
// No HTML, tem de vir DEPOIS da linha:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// porque é essa linha que cria o objeto global "window.supabase".

const SUPABASE_URL = 'https://akdkuwmenqazsmpqbifo.supabase.co'; // <-- Project Settings > API
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZGt1d21lbnFhenNtcHFiaWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5Nzk2OTAsImV4cCI6MjEwNDU1NTY5MH0._M9hNI2ovVUv22ZbMExTb-dqsLBXvWgPqwgiIee_430';   // <-- Project Settings > API (anon public key)

// Cria o cliente a partir do objeto global disponibilizado pelo script da CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -----------------------------------------------------------------------
// Função auxiliar: garante que há sessão ativa. Se não houver, manda
// o utilizador para o login. Chama-se no topo de CADA página protegida.
// Devolve o objeto "user" da sessão quando existe.
// -----------------------------------------------------------------------
async function exigirSessao() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session.user;
}

// -----------------------------------------------------------------------
// Função auxiliar: vai buscar a linha da tabela `participantes`
// correspondente ao utilizador logado.
// -----------------------------------------------------------------------
async function getParticipanteAtual(user) {
  // 1. Busca simples, sem depender de nenhuma foreign key / embed.
  //    Isto funciona seja qual for o estado atual da tua tabela.
  const { data: participante, error } = await supabaseClient
    .from('participantes')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Erro ao ir buscar o participante:');
    console.error('  message:', error.message);
    console.error('  details:', error.details);
    console.error('  hint:', error.hint);
    console.error('  code:', error.code);
    return null;
  }

  // 2. A coluna `alojamento` guarda o UUID do alojamento (não o nome).
  //    Vamos buscar o nome correspondente numa segunda query.
  if (participante.alojamento) {
    const { data: alojamento, error: erroAlojamento } = await supabaseClient
      .from('alojamentos')
      .select('nome')
      .eq('id', participante.alojamento)
      .single();

    if (!erroAlojamento && alojamento) {
      participante.nome_alojamento = alojamento.nome;
    } else {
      console.warn('Não foi possível buscar o nome do alojamento:', erroAlojamento);
    }
  }

  // 3. A coluna `quarto_id` guarda o UUID do quarto específico.
  //    Vamos buscar o número desse quarto.
  if (participante.quarto_id) {
    const { data: quarto, error: erroQuarto } = await supabaseClient
      .from('quartos')
      .select('numero')
      .eq('id', participante.quarto_id)
      .single();

    if (!erroQuarto && quarto) {
      participante.numero_quarto = quarto.numero;
    } else {
      console.warn('Não foi possível buscar o número do quarto:', erroQuarto);
    }
  }

  return participante;
}

// -----------------------------------------------------------------------
// Equivalentes das funções acima, mas para o STAFF.
// -----------------------------------------------------------------------
async function exigirSessaoStaff() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session.user;
}

async function getStaffAtual(user) {
  const { data: staff, error } = await supabaseClient
    .from('staff')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao ir buscar o staff:', error.message, error.details, error.hint);
    return null;
  }
  if (staff) return { ...staff, tipo_conta: 'staff' };

  // Se não é staff, procura na tabela logistica
  const { data: log, error: erroLog } = await supabaseClient
    .from('logistica')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (erroLog) {
    console.error('Erro ao ir buscar a logística:', erroLog.message, erroLog.details, erroLog.hint);
    return null;
  }
  return log ? { ...log, tipo_conta: 'logistica' } : null;
}

// -----------------------------------------------------------------------
// Alojamento e quarto só existem nos pacotes Madragoa e Santos.
// Para incluir outro pacote no futuro, basta acrescentar o nome aqui.
// -----------------------------------------------------------------------
const PACOTES_COM_ALOJAMENTO = ['madragoa', 'santos'];

function pacoteTemAlojamento(nomePacote) {
  const n = String(nomePacote ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return PACOTES_COM_ALOJAMENTO.some(p => n.includes(p));
}

// A política de segurança só devolve o pacote do próprio participante.
async function getPacoteDoParticipante(p) {
  if (!p?.pacote_id) return null;
  const { data, error } = await supabaseClient
    .from('pacotes')
    .select('nome, descricao')
    .eq('id', p.pacote_id)
    .maybeSingle();
  if (error) { console.error('Erro ao ir buscar o pacote:', error.message, error.details, error.hint); return null; }
  return data;
}
