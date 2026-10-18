// jenc-ui.js
// Ficheiro partilhado por TODAS as páginas (exceto index.html). Faz duas coisas:
//   1. Barra de navegação fixa em baixo (para voltar ao início e mudar de secção com 1 toque)
//   2. Tecla Enter (no teclado do telemóvel) executa a ação principal do formulário
// Carrega-se com:  <script src="jenc-ui.js"></script>  mesmo antes de </body>.

(function () {
  'use strict';

  // ==================================================================
  // 1. BARRA DE NAVEGAÇÃO
  // ==================================================================
  // Ícones desenhados (SVG, traço fino) em vez de emojis — ficam consistentes
  // em qualquer telemóvel/SO, ao contrário dos emojis nativos.
  const SVG = {
    inicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/></svg>',
    agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 10h16"/></svg>',
    mapa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.3" r="2.3"/></svg>',
    pontos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5C3 8.5 4.5 10 7 10"/><path d="M17 5h2.5A1.5 1.5 0 0 1 21 6.5C21 8.5 19.5 10 17 10"/><path d="M12 13v4M9 20.5h6"/></svg>',
    qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM19 14h1v1h-1zM14 19h1v1h-1zM17.5 17.5h2.5v2.5h-2.5z"/></svg>',
    contactos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="8" r="3"/><circle cx="16.5" cy="9.5" r="2.3"/><path d="M3.5 19.5c.6-3 2.5-4.8 5-4.8s4.4 1.8 5 4.8"/><path d="M14.7 14.9c2 .2 3.4 1.8 3.9 4.1"/></svg>',
    checkin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="8" r="3.3"/><path d="M3.5 20c.7-3.6 3-5.6 6-5.6M14.5 17.2l2.3 2.3 4-4.4"/></svg>',
    horario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12.5" r="8"/><path d="M12 8v4.5l3 2"/><path d="M9.5 3h5"/></svg>',
    equipa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8.3" r="3"/><path d="M3.3 19.5c.6-3.2 2.7-5 5.7-5s5.1 1.8 5.7 5"/><path d="M15.5 6a3 3 0 0 1 0 5.8"/><path d="M16 14.6c2.3.3 3.9 1.9 4.4 4.9"/></svg>',
    stock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.2 12 4l8 4.2v8.1L12 20.5l-8-4.2Z"/><path d="M4 8.2 12 12l8-3.8M12 12v8.5"/></svg>',
    compras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.3 10a2 2 0 0 1-2 1.7H8.3a2 2 0 0 1-2-1.7L5 8Z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/></svg>'
  };

  const MENU_PARTICIPANTE = [
    { href: 'inicio.html',    icone: SVG.inicio,    rotulo: 'Início' },
    { href: 'agenda.html',    icone: SVG.agenda,    rotulo: 'Agenda' },
    { href: 'mapa.html',      icone: SVG.mapa,      rotulo: 'Mapa' },
    { href: 'gamificacao.html', icone: SVG.pontos, rotulo: 'Missões' },
    { href: 'qr-code.html',   icone: SVG.qr,        rotulo: 'QR Code' },
    { href: 'perfil.html',    avatar: true,  rotulo: 'Perfil' }
  ];
  const menuEquipa = (inicio, comCompras) => [
    { href: inicio,                  icone: SVG.inicio,   rotulo: 'Início' },
    { href: 'staff-checkin.html',    icone: SVG.checkin,  rotulo: 'Check-in' },
    { href: 'staff-atividades.html', icone: SVG.agenda,   rotulo: 'Atividades' },
    { href: 'staff-horario.html',    icone: SVG.horario,  rotulo: 'Horário' },
    { href: 'staff-equipa.html',     icone: SVG.equipa,   rotulo: 'Equipa' },
    { href: 'staff-stock.html',      icone: SVG.stock,    rotulo: 'Stock' },
    ...(comCompras ? [{ href: 'logistica-compras.html', icone: SVG.compras, rotulo: 'Compras' }] : [])
  ];

  const PAGINAS_PARTICIPANTE = ['inicio.html', 'agenda.html', 'alojamento.html', 'refeicoes.html',
    'qr-code.html', 'contactos.html', 'perfil.html', 'gamificacao.html'];
  const PAGINAS_LOGISTICA = ['logistica-inicio.html', 'logistica-gestao.html', 'logistica-compras.html'];
  const PAGINAS_STAFF = ['staff-inicio.html', 'staff-checkin.html', 'staff-atividades.html',
    'staff-horario.html', 'staff-equipa.html', 'staff-stock.html'];
  const PAGINAS_NEUTRAS = ['mapa.html']; // usada por participantes e equipa

  const pagina = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // Descobre se a conta é participante, staff ou logística (guarda em cache na sessão do browser).
  async function tipoDeConta() {
    if (typeof supabaseClient === 'undefined') return null;
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return null;
      const chave = 'jenc_tipo_conta:' + session.user.id;
      try { const c = sessionStorage.getItem(chave); if (c) return c; } catch (e) {}

      let tipo = 'participante';
      const { data: st } = await supabaseClient.from('staff').select('id').eq('user_id', session.user.id).maybeSingle();
      if (st) tipo = 'staff';
      else {
        const { data: lg } = await supabaseClient.from('logistica').select('id').eq('user_id', session.user.id).maybeSingle();
        if (lg) tipo = 'logistica';
      }
      try { sessionStorage.setItem(chave, tipo); } catch (e) {}
      return tipo;
    } catch (e) {
      return null;
    }
  }

  // Iniciais do participante no botão de perfil (guardadas em cache na sessão).
  async function preencherAvatar() {
    const el = document.getElementById('avatar-nav');
    if (!el || typeof supabaseClient === 'undefined') return;
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return;
      const chave = 'jenc_iniciais:' + session.user.id;
      let ini = null;
      try { ini = sessionStorage.getItem(chave); } catch (e) {}
      if (!ini) {
        const { data } = await supabaseClient.from('participantes').select('nome').eq('user_id', session.user.id).maybeSingle();
        if (data && data.nome) {
          ini = data.nome.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
          try { sessionStorage.setItem(chave, ini); } catch (e) {}
        }
      }
      if (ini) el.textContent = ini;
    } catch (e) {}
  }

  function injetarEstilos() {
    const s = document.createElement('style');
    s.textContent = `
      #jenc-nav { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        width: calc(100% - 24px); max-width: 456px; z-index: 50; padding: 5px;
        background: rgba(12,35,64,0.95); border: 1px solid rgba(189,140,28,0.55); border-radius: 999px;
        box-shadow: 0 10px 30px rgba(12,35,64,0.35); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
      #jenc-nav .barra { display: flex; width: 100%; }
      #jenc-nav a { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 3px;
        padding: 7px 2px 6px; border-radius: 999px; text-decoration: none; color: #B5C4D8;
        font: 600 10px/1.1 'Montserrat', 'Segoe UI', system-ui, sans-serif; -webkit-tap-highlight-color: transparent;
        transition: background .25s, color .25s, transform .15s; }
      #jenc-nav a:active { transform: scale(.94); }
      #jenc-nav a .ic { display: flex; }
      #jenc-nav a .ic svg { width: 21px; height: 21px; }
      #jenc-nav a .tx { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
      #jenc-nav a.ativo { color: #E8C873; background: rgba(189,140,28,0.22); }
      #jenc-nav .avatar-nav { width: 21px; height: 21px; border-radius: 50%; border: 1.5px solid currentColor;
        display: grid; place-items: center; font-size: 8.5px; font-weight: 800; letter-spacing: 0; }
      #jenc-nav a.ativo .avatar-nav { background: #BD8C1C; border-color: #BD8C1C; color: #0C2340; }
      body.jenc-teclado #jenc-nav { display: none; }
    `;
    document.head.appendChild(s);
  }

  function desenharNav(menu) {
    if (document.getElementById('jenc-nav')) return;
    injetarEstilos();

    // Na página de gestão da logística, o separador ativo é o "Início" da logística.
    const SUB_DO_PERFIL = ['contactos.html', 'alojamento.html', 'refeicoes.html'];
    const paginaAtiva = pagina === 'logistica-gestao.html' ? 'logistica-inicio.html'
      : SUB_DO_PERFIL.includes(pagina) ? 'perfil.html' : pagina;

    const nav = document.createElement('nav');
    nav.id = 'jenc-nav';
    nav.setAttribute('aria-label', 'Navegação principal');
    const barra = document.createElement('div');
    barra.className = 'barra';
    menu.forEach(item => {
      const a = document.createElement('a');
      a.href = item.href;
      if (item.href.toLowerCase() === paginaAtiva) { a.className = 'ativo'; a.setAttribute('aria-current', 'page'); }
      const ic = document.createElement('span'); ic.className = 'ic';
      if (item.avatar) ic.innerHTML = '<span class="avatar-nav" id="avatar-nav">·</span>'; else ic.innerHTML = item.icone;
      const tx = document.createElement('span'); tx.className = 'tx'; tx.textContent = item.rotulo;
      a.append(ic, tx);
      barra.appendChild(a);
    });
    nav.appendChild(barra);
    document.body.appendChild(nav);
    if (menu.some(i => i.avatar)) preencherAvatar();

    // Quando o teclado abre, esconde a barra para não ocupar espaço.
    document.addEventListener('focusin', e => {
      if (e.target.matches && e.target.matches('input, textarea, select')) document.body.classList.add('jenc-teclado');
    });
    document.addEventListener('focusout', () => {
      setTimeout(() => {
        const a = document.activeElement;
        if (!a || !a.matches || !a.matches('input, textarea, select')) document.body.classList.remove('jenc-teclado');
      }, 100);
    });
  }

  async function iniciarNav() {
    if (PAGINAS_PARTICIPANTE.includes(pagina)) return desenharNav(MENU_PARTICIPANTE);
    if (PAGINAS_LOGISTICA.includes(pagina)) return desenharNav(menuEquipa('logistica-inicio.html', true));

    if (PAGINAS_STAFF.includes(pagina) || PAGINAS_NEUTRAS.includes(pagina)) {
      const tipo = await tipoDeConta();
      if (tipo === 'logistica') return desenharNav(menuEquipa('logistica-inicio.html', true));
      if (tipo === 'staff') return desenharNav(menuEquipa('staff-inicio.html'));
      if (tipo === 'participante') return desenharNav(MENU_PARTICIPANTE);
      // Sem sessão / sem resposta: só faz sentido mostrar barra nas páginas de staff.
      if (PAGINAS_STAFF.includes(pagina)) return desenharNav(menuEquipa('staff-inicio.html'));
    }
    // login.html e outras: sem barra.
  }

  // ==================================================================
  // 2. ENTER EXECUTA A AÇÃO PRINCIPAL
  // ==================================================================
  // Botões que contam como "ação principal" de um formulário/bloco.
  const BOTOES_PRINCIPAIS = 'button.principal, button.guardar, button.botao-guardar, button.botao-submeter, button.botao-dourado, .entrada-manual button, button[data-enter]';
  const TIPOS_TEXTO = ['text', 'email', 'password', 'number', 'search', 'tel', 'url'];

  // Procura o botão principal mais próximo do campo (sobe no máximo 6 níveis, nunca até ao body,
  // para não "disparar" um botão de outra zona da página).
  function acharBotaoPrincipal(campo) {
    let no = campo.parentElement;
    for (let i = 0; i < 6 && no && no !== document.body; i++, no = no.parentElement) {
      const botao = [...no.querySelectorAll(BOTOES_PRINCIPAIS)].find(b => !b.disabled && b.offsetParent !== null);
      if (botao) return botao;
    }
    return null;
  }

  function campoElegivel(el) {
    return el instanceof HTMLInputElement
      && TIPOS_TEXTO.includes(el.type)
      && !el.hasAttribute('onkeydown')          // campos que já têm o seu próprio Enter (ex.: stock)
      && el.dataset.semEnter === undefined;
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    const el = e.target;
    if (!campoElegivel(el)) return;
    e.preventDefault();

    const botao = acharBotaoPrincipal(el);
    if (botao) botao.click();
    else el.blur(); // sem botão (ex.: pesquisa que filtra ao escrever): fecha o teclado
  });

  // Faz o teclado do telemóvel mostrar "Ir" / "Ok" em vez de só uma seta.
  document.addEventListener('focusin', e => {
    const el = e.target;
    if (campoElegivel(el) && !el.enterKeyHint) el.enterKeyHint = acharBotaoPrincipal(el) ? 'go' : 'done';
  });

  // ==================================================================
  // 3. TRANSIÇÃO ENTRE PÁGINAS (esmorece ao sair; volta ao normal se vieres pelo botão "atrás")
  // ==================================================================
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Browsers com View Transitions fazem a transição sozinhos (sem ecrã em branco no meio).
    if ('CSSViewTransitionRule' in window) return;
    e.preventDefault();
    document.body.classList.add('jenc-saindo');
    setTimeout(() => { location.href = a.href; }, 220);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('jenc-saindo'));

  // ==================================================================
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarNav);
  else iniciarNav();
})();
