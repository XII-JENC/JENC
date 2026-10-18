// jenc-agenda.js
// Calendário de atividades PARTILHADO por participante, staff e logística.
// Uso (na página, depois de supabaseClient.js):
//   <div class="abas-dias" id="abas-dias"></div>
//   <div id="area-calendario"></div>
//   <div id="detalhe-atividade"></div>      (opcional)
//   <script src="jenc-agenda.js"></script>
//   JencAgenda.montar({ detalhes: true });  // detalhes:true => toque num bloco mostra sala/capacidade/responsável
// Qualquer alteração ao aspeto do calendário faz-se AQUI e aparece nos 3 perfis.
(function () {
  'use strict';

  const PX_HORA = 56, ALTURA_MIN = 26, DURACAO_OMISSA = 45, PAUSA_MIN = 45;
  const CORES = [['#F8D7DA','#5A1F27'],['#D6E4F7','#0C2340'],['#FCE5C8','#5C3A0A'],['#D8EBD9','#1D4A2A'],['#E6DCF3','#3A2A5C'],['#F6EBC0','#5A4510']];
  const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const CSS = `
  .abas-dias { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 8px; margin-bottom: 14px; scrollbar-width: none; }
  .abas-dias::-webkit-scrollbar { display: none; }
  .abas-dias .aba-dia { flex-shrink: 0; min-width: 62px; padding: 8px 12px !important; border-radius: 16px !important; text-align: center; cursor: pointer; font-size: 11px; font-weight: 600; line-height: 1.2; }
  .aba-dia .dia-num { display: block; font-size: 20px; font-weight: 800; margin-top: 1px; }
  .aba-dia .dia-hoje { display: block; font-size: 9.5px; font-weight: 700; margin-top: 1px; color: var(--gold-texto); }
  .aba-dia.ativa .dia-hoje { color: #0C2340; }
  .calendario { position: relative; margin-top: 4px; background: rgba(12,35,64,.5); border: 1px solid rgba(255,255,255,.12); border-radius: 12px; overflow: hidden; }
  .hora-linha { position: absolute; left: 0; right: 0; height: 0; border-top: 1px solid rgba(255,255,255,.16); }
  .hora-linha.meia { border-top: 1px dotted rgba(255,255,255,.1); }
  .hora-linha span { position: absolute; left: 0; top: -7px; width: 42px; text-align: center; font-size: 10.5px; font-weight: 600; color: var(--suave); }
  .coluna-horas { position: absolute; left: 42px; top: 0; bottom: 0; border-left: 1px solid rgba(255,255,255,.16); }
  .area-blocos { position: absolute; left: 46px; right: 4px; top: 0; bottom: 0; }
  .bloco { position: absolute; border-radius: 6px; padding: 4px 7px; overflow: hidden; display: flex; flex-direction: column; gap: 1px;
    background: var(--c-bg, #DCE6F7); color: var(--c-tx, #0C2340); border: 1px solid var(--c-bd, rgba(12,35,64,.08)); line-height: 1.2; }
  .bloco.clicavel { cursor: pointer; }
  .bloco.sel { box-shadow: 0 0 0 2px #BD8C1C inset; }
  .bloco .hora-b { font-size: 10.5px; font-weight: 700; opacity: .8; }
  .bloco .nome-b { font-size: 12px; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .bloco .local-b { font-size: 10.5px; opacity: .78; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bloco.compacto { flex-direction: row; align-items: center; gap: 6px; padding: 2px 7px; }
  .bloco.compacto .nome-b { -webkit-line-clamp: 1; white-space: nowrap; text-overflow: ellipsis; display: block; }
  .bloco.agora { box-shadow: 0 0 0 2px #F6F1E4 inset; }
  .bloco.agora.sel { box-shadow: 0 0 0 2px #F6F1E4 inset, 0 0 0 4px #BD8C1C; }
  .etiqueta { position: absolute; top: 3px; right: 5px; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 999px; background: #0C2340; color: #F6F1E4; }
  .pausa { position: absolute; border-radius: 6px; display: flex; align-items: center; justify-content: center; text-align: center;
    border: 1px dashed rgba(189,140,28,.6); background: rgba(189,140,28,.06); color: var(--gold-texto); font-size: 10.5px; font-weight: 600; }
  .agora-linha { position: absolute; left: 38px; right: 0; height: 0; border-top: 2px solid #B3382C; z-index: 5; pointer-events: none; }
  .agora-linha::before { content: ''; position: absolute; left: -1px; top: -5px; width: 8px; height: 8px; border-radius: 50%; background: #B3382C; }
  .vazio-agenda, .carregamento-agenda { text-align: center; color: var(--suave); padding: 40px 0; font-size: 14px; }
  .detalhe-ativ { margin-top: 14px; padding: 14px 16px; }
  .detalhe-ativ .d-nome { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
  .detalhe-ativ .d-hora { font-size: 13px; font-weight: 700; color: var(--gold-texto); }
  .detalhe-ativ .d-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
  .detalhe-ativ .d-rot { font-size: 11px; color: var(--suave); margin-bottom: 2px; }
  .detalhe-ativ .d-val { font-size: 13px; font-weight: 600; }
  .detalhe-ativ .d-dica { font-size: 12px; color: var(--suave); }
  `;

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const minutos = t => { const [h, m] = t.split(':'); return (+h) * 60 + (+m); };
  const hhmm = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  function duracaoTexto(min) { const h = Math.floor(min / 60), m = min % 60; return h && m ? `${h} h ${m}` : h ? `${h} h` : `${m} min`; }
  function corDoLocal(txt) { let h = 0; for (const c of String(txt ?? '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return CORES[h % CORES.length]; }
  function hojeISO() { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }

  function montar(opcoes = {}) {
    const o = Object.assign({ abas: '#abas-dias', area: '#area-calendario', detalhe: '#detalhe-atividade', carregamento: '#carregamento', detalhes: false }, opcoes);
    const elAbas = document.querySelector(o.abas);
    const elArea = document.querySelector(o.area);
    const elDet = document.querySelector(o.detalhe);
    const elCarr = document.querySelector(o.carregamento);

    if (!document.getElementById('jenc-agenda-css')) {
      const s = document.createElement('style'); s.id = 'jenc-agenda-css'; s.textContent = CSS; document.head.appendChild(s);
    }

    let porDia = {}, diaSel = null, idSel = null;

    function msg(t) { if (elCarr) { elCarr.style.display = 'block'; elCarr.textContent = t; } }

    async function buscar() {
      const base = 'id, nome, data, hora_inicio, hora_fim, local';
      const extra = o.detalhes ? ', capacidade, staff_responsavel' : '';
      let r = await supabaseClient.from('atividades').select(base + extra)
        .order('data', { ascending: true }).order('hora_inicio', { ascending: true });
      if (r.error && extra) { // coluna em falta? tenta só o essencial
        console.warn('Agenda: a repetir sem colunas extra:', r.error.message);
        r = await supabaseClient.from('atividades').select(base)
          .order('data', { ascending: true }).order('hora_inicio', { ascending: true });
      }
      if (r.error) { console.error('Erro ao ir buscar atividades:', r.error.message, r.error.details, r.error.hint); return null; }
      return r.data ?? [];
    }

    function renderAbas() {
      elAbas.innerHTML = '';
      const hoje = hojeISO();
      Object.keys(porDia).sort().forEach(dataISO => {
        const d = new Date(dataISO + 'T00:00:00');
        const aba = document.createElement('div');
        aba.className = 'aba-dia' + (dataISO === diaSel ? ' ativa' : '');
        aba.innerHTML = `${SEMANA[d.getDay()]}<span class="dia-num">${d.getDate()}</span>${dataISO === hoje ? '<span class="dia-hoje">Hoje</span>' : ''}`;
        aba.onclick = () => {
          if (dataISO === diaSel) return;
          diaSel = dataISO; idSel = null; mostrarDetalhe(null);
          renderAbas(); renderCalendario(dataISO, true);
        };
        elAbas.appendChild(aba);
        if (dataISO === diaSel) aba.scrollIntoView({ inline: 'center', block: 'nearest' });
      });
    }

    function mostrarDetalhe(a) {
      if (!o.detalhes || !elDet) return;
      if (!a) { elDet.innerHTML = '<div class="d-dica" style="text-align:center;margin-top:12px;">Toca numa atividade para ver sala, capacidade e responsável.</div>'; return; }
      const horas = `${a.hora_inicio.slice(0, 5)}${a.hora_fim ? ' – ' + a.hora_fim.slice(0, 5) : ''}`;
      elDet.innerHTML = `<div class="card-atividade detalhe-ativ">
        <div class="d-nome">${esc(a.nome)}</div><div class="d-hora">${horas}</div>
        <div class="d-grid">
          <div><div class="d-rot">Local</div><div class="d-val">${esc(a.local ?? '—')}</div></div>
          <div><div class="d-rot">Capacidade</div><div class="d-val">${esc(a.capacidade ?? '—')}</div></div>
          <div><div class="d-rot">Responsável</div><div class="d-val">${esc(a.staff_responsavel ?? '—')}</div></div>
        </div></div>`;
    }

    function renderCalendario(dataISO, primeiraVez) {
      const lista = porDia[dataISO] || [];
      if (lista.length === 0) { elArea.innerHTML = '<div class="vazio-agenda">Sem atividades neste dia.</div>'; return; }

      const agora = new Date(), eHoje = dataISO === hojeISO();
      const agoraMin = agora.getHours() * 60 + agora.getMinutes();
      const minVisual = Math.ceil(ALTURA_MIN * 60 / PX_HORA);

      const itens = lista.map(a => {
        const s = minutos(a.hora_inicio);
        const e = a.hora_fim ? minutos(a.hora_fim) : s + DURACAO_OMISSA;
        return { a, s, e: Math.max(e, s + 1), ve: Math.max(e, s + minVisual) };
      }).sort((x, y) => x.s - y.s || x.e - y.e);

      const grupos = [];
      itens.forEach(it => {
        const g = grupos[grupos.length - 1];
        if (g && it.s < g.fim) { g.itens.push(it); g.fim = Math.max(g.fim, it.ve); }
        else grupos.push({ itens: [it], fim: it.ve });
      });
      grupos.forEach(g => {
        const colunas = [];
        g.itens.forEach(it => {
          let c = colunas.findIndex(fim => fim <= it.s);
          if (c === -1) { c = colunas.length; colunas.push(0); }
          colunas[c] = it.ve; it.col = c;
        });
        g.itens.forEach(it => { it.ncol = colunas.length; });
      });

      const inicioDia = Math.floor(Math.min(...itens.map(i => i.s)) / 60) * 60;
      const fimDia = Math.ceil(Math.max(...itens.map(i => i.ve)) / 60) * 60;
      const topo = m => 10 + (m - inicioDia) * PX_HORA / 60;
      const altura = 20 + ((fimDia - inicioDia) / 60 * PX_HORA);

      let html = `<div class="calendario${primeiraVez ? ' anima' : ''}" style="height:${altura}px">`;
      for (let m = inicioDia; m <= fimDia; m += 60) {
        html += `<div class="hora-linha" style="top:${topo(m)}px"><span>${hhmm(m)}</span></div>`;
        if (m < fimDia) html += `<div class="hora-linha meia" style="top:${topo(m + 30)}px"></div>`;
      }
      html += '<div class="coluna-horas"></div><div class="area-blocos">';

      for (let i = 0; i < grupos.length - 1; i++) {
        const fimReal = Math.max(...grupos[i].itens.map(x => x.e));
        const proximo = grupos[i + 1].itens[0].s;
        const folga = proximo - fimReal;
        const fimVisual = Math.max(...grupos[i].itens.map(x => x.ve));
        if (folga >= PAUSA_MIN && proximo - fimVisual >= 25) {
          html += `<div class="pausa" style="top:${topo(fimVisual) + 3}px;height:${(proximo - fimVisual) * PX_HORA / 60 - 6}px;left:0;right:0">Intervalo · ${duracaoTexto(folga)}</div>`;
        }
      }

      const proxima = eHoje ? itens.find(it => it.s > agoraMin) : null;

      itens.forEach(it => {
        const a = it.a;
        const h = (it.ve - it.s) * PX_HORA / 60 - 2;
        const aDecorrer = eHoje && agoraMin >= it.s && agoraMin <= it.e;
        const ehProxima = proxima && proxima === it;
        const compacto = h < 40;
        const larg = 100 / it.ncol;
        const [cbg, ctx] = corDoLocal(a.local ?? a.nome);
        const horas = `${a.hora_inicio.slice(0, 5)}${a.hora_fim ? '–' + a.hora_fim.slice(0, 5) : ''}`;
        const etiqueta = aDecorrer ? '<span class="etiqueta">Agora</span>' : ehProxima && !compacto ? '<span class="etiqueta">A seguir</span>' : '';
        const mostraLocal = h >= 66 && a.local;
        const cls = 'bloco' + (compacto ? ' compacto' : '') + (aDecorrer ? ' agora' : '') + (o.detalhes ? ' clicavel' : '') + (a.id === idSel ? ' sel' : '');

        html += `<div class="${cls}" data-id="${esc(a.id)}" style="--c-bg:${cbg};--c-tx:${ctx};top:${topo(it.s) + 1}px;height:${h}px;left:calc(${it.col * larg}% + ${it.col ? 2 : 0}px);width:calc(${larg}% - ${it.ncol > 1 ? 2 : 0}px)">
          ${compacto
            ? `<div class="hora-b">${a.hora_inicio.slice(0, 5)}</div><div class="nome-b">${esc(a.nome)}</div>`
            : `<div class="hora-b">${horas}</div><div class="nome-b" style="${etiqueta ? 'padding-right:46px' : ''}">${esc(a.nome)}</div>${mostraLocal ? `<div class="local-b">${esc(a.local)}</div>` : ''}`}
          ${etiqueta}
        </div>`;
      });
      html += '</div>';

      if (eHoje && agoraMin >= inicioDia && agoraMin <= fimDia) {
        html += `<div class="agora-linha" id="agora-linha" style="top:${topo(agoraMin)}px"></div>`;
      }
      html += '</div>';
      elArea.innerHTML = html;

      if (primeiraVez && eHoje) {
        const alvo = elArea.querySelector('.bloco.agora') || document.getElementById('agora-linha');
        if (alvo) setTimeout(() => alvo.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
    }

    if (o.detalhes) {
      elArea.addEventListener('click', e => {
        const b = e.target.closest('.bloco'); if (!b) return;
        idSel = b.dataset.id;
        const a = (porDia[diaSel] || []).find(x => String(x.id) === idSel);
        elArea.querySelectorAll('.bloco').forEach(x => x.classList.toggle('sel', x === b));
        mostrarDetalhe(a);
      });
    }

    (async function iniciar() {
     try {
      const atividades = await buscar();
      if (atividades === null) { msg('Não foi possível carregar a agenda.'); return; }
      if (atividades.length === 0) { msg('Ainda não há atividades publicadas (ou esta conta não tem permissão para as ver).'); return; }

      atividades.forEach(a => (porDia[a.data] = porDia[a.data] || []).push(a));
      const hoje = hojeISO();
      const dias = Object.keys(porDia).sort();
      diaSel = dias.includes(hoje) ? hoje : (dias.find(d => d > hoje) ?? dias[dias.length - 1]);

      renderAbas();
      renderCalendario(diaSel, true);
      mostrarDetalhe(null);
      if (elCarr) elCarr.style.display = 'none';

      setInterval(() => { if (diaSel === hojeISO()) renderCalendario(diaSel, false); }, 60000);
     } catch (e) { console.error('Agenda:', e); msg('Erro na agenda: ' + (e && e.message ? e.message : e)); }
    })();
  }

  window.JencAgenda = { montar };
})();
