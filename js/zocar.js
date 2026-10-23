/* Zocar Rio | pátio, dossiê e cotação */
(function () {
  var WHATSAPP = window.ZOCAR_WHATSAPP || '';
  var DEMO = true; /* prévia: o formulário não envia nada */
  var UNIDADES = window.ZOCAR_PATIO || [];
  var porId = {};
  UNIDADES.forEach(function (u) { porId[u.id] = u; });

  var esc = function (t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; };
  var doisDigitos = function (n) { return (n < 10 ? '0' : '') + n; };
  var operacaoTexto = function (u) { return u.operacao.map(function (o) { return o === 'locacao' ? 'Locação' : 'Venda'; }).join(' e '); };

  /* ---------- Movimento: só com JS e sem preferência por menos movimento ---------- */
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!menosMovimento) document.documentElement.classList.add('mexe');
  var obs = ('IntersectionObserver' in window && !menosMovimento) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' }) : null;
  function observar(els) { els.forEach(function (el) { if (obs) obs.observe(el); else el.classList.add('visivel'); }); }
  observar(document.querySelectorAll('[data-revela]'));

  var cab = document.querySelector('.cabecalho');
  var foto = document.querySelector('[data-paralaxe] img');
  var panorama = document.querySelector('[data-panorama]');
  var largo = window.matchMedia('(min-width: 900px)');
  var pedido = false;
  var aoRolar = function () {
    pedido = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (cab) cab.classList.toggle('rolou', y > 40);
    if (menosMovimento) return;
    if (foto && largo.matches && y < vh * 1.2) foto.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
    if (panorama) {
      var r = panorama.getBoundingClientRect();
      /* 1 quando o topo da seção está no pé da tela, 0 quando ela chega ao meio */
      var fecha = Math.min(1, Math.max(0, (r.top - vh * 0.15) / (vh * 0.75)));
      panorama.style.setProperty('--fecha', fecha.toFixed(3));
    }
  };
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(aoRolar); } }, { passive: true });
  aoRolar();

  document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Cotação: lista de unidades marcadas (guardada só neste navegador) ---------- */
  var CHAVE = 'zocar-cotacao';
  var cotacao = [];
  try { cotacao = JSON.parse(localStorage.getItem(CHAVE) || '[]').filter(function (id) { return porId[id]; }); } catch (e) { cotacao = []; }
  var guardar = function () { try { localStorage.setItem(CHAVE, JSON.stringify(cotacao)); } catch (e) {} };

  var mensagemWhats = function () {
    var linhas = cotacao.map(function (id) { var u = porId[id]; return id + ' · ' + u.nome + ' (' + u.local + ')'; });
    var texto = 'Olá! Vim pelo site da Zocar Rio e quero cotar' + (linhas.length ? ':\n' + linhas.join('\n') : ' um equipamento.');
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  };

  var atualizarCotacao = function () {
    var total = cotacao.length;
    document.querySelectorAll('[data-cotacao-total]').forEach(function (el) { el.textContent = doisDigitos(total); });
    document.querySelectorAll('[data-cotacao-atalho]').forEach(function (el) { el.classList.toggle('tem', total > 0); });
    var barra = document.querySelector('[data-cotacao]');
    if (barra) {
      barra.hidden = total === 0;
      document.body.classList.toggle('tem-cotacao', total > 0);
      barra.querySelector('[data-cotacao-lista]').textContent = cotacao.join(' · ');
      barra.querySelector('[data-cotacao-whats]').href = mensagemWhats();
    }
    document.querySelectorAll('[data-unidade]').forEach(function (el) {
      var marcada = cotacao.indexOf(el.getAttribute('data-unidade')) > -1;
      el.classList.toggle('na-cotacao', marcada);
      var b = el.querySelector('.marcar');
      if (b) { b.setAttribute('aria-pressed', String(marcada)); b.textContent = marcada ? '✓ Na cotação' : '+ Cotação'; }
    });
    var noDossie = document.querySelector('[data-dossie-marcar]');
    if (noDossie) {
      var m = cotacao.indexOf(noDossie.getAttribute('data-dossie-marcar')) > -1;
      noDossie.textContent = m ? '✓ Na cotação (remover)' : 'Adicionar à cotação';
      noDossie.className = m ? 'botao botao--claro' : 'botao';
    }
    preencherFormulario();
  };

  var alternar = function (id) {
    var i = cotacao.indexOf(id);
    if (i > -1) cotacao.splice(i, 1); else cotacao.push(id);
    guardar(); atualizarCotacao();
  };

  var limpar = document.querySelector('[data-cotacao-limpar]');
  if (limpar) limpar.addEventListener('click', function () { cotacao = []; guardar(); atualizarCotacao(); });

  /* ---------- Pátio: folha de contato com filtros e busca ---------- */
  var patio = document.getElementById('patio');
  var filtro = { operacao: 'todas', tipo: 'todos', busca: '' };

  /* Larguras em linhas de 12 colunas: 7+5, 4+4+4, 5+7. A última linha incompleta se estica. */
  var LARGURAS = [7, 5, 4, 4, 4, 5, 7];
  var ALTURAS = { 7: 'clamp(280px, 34vw, 540px)', 5: 'clamp(280px, 34vw, 540px)', 4: 'clamp(220px, 24vw, 380px)', 12: 'clamp(300px, 42vw, 620px)' };
  var larguras = function (n) {
    if (n === 1) return [8];
    var out = [], linha = 0;
    for (var i = 0; i < n; i++) { var c = LARGURAS[i % LARGURAS.length]; out.push(c); linha = (linha + c) % 12; }
    if (linha) out[out.length - 1] += 12 - linha;
    return out;
  };
  var unidadeHTML = function (u, i, cols) {
    var col = cols[i], alto = ALTURAS[col] || ALTURAS[col >= 7 ? 7 : 4];
    return '<li class="unidade" data-unidade="' + u.id + '" data-revela style="--col:' + col + ';--alto:' + alto + ';--i:' + (i % 3) + '">' +
      '<button class="unidade__foto" type="button" data-abrir="' + u.id + '" aria-label="Abrir o dossiê da unidade ' + u.id + ', ' + esc(u.nome) + '">' +
      '<img src="img/patio/' + u.foto + (col >= 5 ? '.jpg' : '-p.jpg') + '" alt="" width="1200" height="800" loading="lazy"></button>' +
      '<div class="unidade__legenda">' +
      '<span class="unidade__id">' + u.id + '</span>' +
      '<span class="unidade__nome">' + esc(u.nome) + '</span>' +
      '<button class="marcar" type="button" data-marcar="' + u.id + '" aria-pressed="false">+ Cotação</button>' +
      '<span class="unidade__meta">' + operacaoTexto(u) + ' · ' + esc(u.local) + '</span>' +
      '</div></li>';
  };

  var desenharPatio = function () {
    if (!patio) return;
    var termo = filtro.busca.toLowerCase();
    var lista = UNIDADES.filter(function (u) {
      return (filtro.operacao === 'todas' || u.operacao.indexOf(filtro.operacao) > -1) &&
             (filtro.tipo === 'todos' || u.tipo === filtro.tipo) &&
             (!termo || (u.id + ' ' + u.nome + ' ' + u.local).toLowerCase().indexOf(termo) > -1);
    });
    var contagem = document.querySelector('[data-patio-contagem]');
    if (contagem) contagem.textContent = doisDigitos(lista.length) + (lista.length === 1 ? ' unidade' : ' unidades');
    var cols = larguras(lista.length);
    patio.innerHTML = lista.length ? lista.map(function (u, i) { return unidadeHTML(u, i, cols); }).join('') :
      '<li class="patio-vazio">Nenhuma unidade com esse filtro. Peça pelo WhatsApp: a equipe procura para você.</li>';
    atualizarCotacao();
    observar(patio.querySelectorAll('[data-revela]'));
  };

  document.querySelectorAll('[data-filtro]').forEach(function (b) {
    b.addEventListener('click', function () {
      var tipo = b.getAttribute('data-filtro');
      filtro[tipo] = b.getAttribute('data-valor');
      document.querySelectorAll('[data-filtro="' + tipo + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      desenharPatio();
    });
  });
  var busca = document.querySelector('[data-busca]');
  if (busca) busca.addEventListener('input', function () { filtro.busca = busca.value.trim(); desenharPatio(); });

  /* ---------- Dossiê da unidade ---------- */
  var dossie = document.querySelector('[data-dossie]');
  var pendente = '<dd class="pendente">[A CONFIRMAR]</dd>';
  var vistas = ['Perfil esquerdo', 'Frente', 'Traseira', 'Painel e horímetro'];

  var abrirDossie = function (id) {
    var u = porId[id];
    if (!u || !dossie) return;
    var msg = encodeURIComponent('Olá! Vim pelo site da Zocar Rio. Quero saber mais sobre a unidade ' + u.id + ' (' + u.nome + ').');
    dossie.innerHTML =
      '<div class="dossie__grade">' +
        '<div class="dossie__fotos">' +
          '<div class="principal"><img src="img/patio/' + u.foto + '.jpg" alt="' + esc(u.nome) + ', unidade ' + u.id + '" width="1200" height="800"></div>' +
          vistas.map(function (v, i) { return i === 0 ? '<div class="vista atual"><img src="img/patio/' + u.foto + '-p.jpg" alt="' + v + '"></div>' : '<div class="vista">' + v + ' · a fotografar</div>'; }).join('') +
        '</div>' +
        '<div class="dossie__dados">' +
          '<div class="dossie__topo"><div><span class="mono">' + u.id + '</span><h2 id="dossie-titulo">' + esc(u.nome) + '</h2></div>' +
          '<button class="dossie__fechar" type="button" data-fechar aria-label="Fechar o dossiê">×</button></div>' +
          '<dl>' +
            '<dt>Operação</dt><dd>' + operacaoTexto(u) + '</dd>' +
            '<dt>Pátio</dt><dd>' + esc(u.local) + '</dd>' +
            '<dt>Marca e modelo</dt>' + pendente +
            '<dt>Ano</dt>' + pendente +
            '<dt>Horímetro ou km</dt>' + pendente +
            '<dt>Procedência</dt>' + pendente +
            '<dt>Revisão</dt>' + pendente +
          '</dl>' +
          '<div class="dossie__acoes">' +
            '<button class="botao" type="button" data-dossie-marcar="' + u.id + '">Adicionar à cotação</button>' +
            '<a class="link" href="https://wa.me/' + WHATSAPP + '?text=' + msg + '" target="_blank" rel="noopener">Perguntar sobre esta unidade no WhatsApp</a>' +
          '</div>' +
          '<p class="dossie__credito">Foto: ' + esc(u.credito) + '</p>' +
        '</div>' +
      '</div>';
    if (!dossie.open) dossie.showModal();
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    atualizarCotacao();
  };

  var fecharDossie = function () {
    if (dossie && dossie.open) dossie.close();
  };
  if (dossie) {
    dossie.addEventListener('close', function () { if (/^#Z-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); });
    dossie.addEventListener('click', function (e) { if (e.target === dossie) fecharDossie(); });
  }

  /* Um só ouvinte para os cliques do pátio e do dossiê */
  document.addEventListener('click', function (e) {
    var alvo = e.target.closest('[data-abrir],[data-marcar],[data-dossie-marcar],[data-fechar]');
    if (!alvo) return;
    if (alvo.hasAttribute('data-abrir')) abrirDossie(alvo.getAttribute('data-abrir'));
    else if (alvo.hasAttribute('data-marcar')) alternar(alvo.getAttribute('data-marcar'));
    else if (alvo.hasAttribute('data-dossie-marcar')) alternar(alvo.getAttribute('data-dossie-marcar'));
    else if (alvo.hasAttribute('data-fechar')) fecharDossie();
  });

  /* ---------- Formulário de contato: leva a cotação junto ---------- */
  var form = document.getElementById('form-contato');
  function preencherFormulario() {
    if (!form) return;
    var caixa = form.querySelector('[data-form-cotacao]');
    var campo = form.querySelector('input[name="unidades"]');
    caixa.hidden = cotacao.length === 0;
    caixa.querySelector('ul').innerHTML = cotacao.map(function (id) { return '<li><span class="mono">' + id + '</span> ' + esc(porId[id].nome) + '</li>'; }).join('');
    campo.value = cotacao.join(', ');
  }
  if (form) {
    var aviso = form.querySelector('.form__aviso');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.nome.value.trim() || !form.telefone.value.trim()) {
        aviso.className = 'form__aviso erro';
        aviso.textContent = 'Preencha nome e telefone para a equipe conseguir retornar.';
        return;
      }
      aviso.className = 'form__aviso ok';
      aviso.textContent = DEMO ?
        'Prévia de demonstração: nada foi enviado. Na versão final, o pedido chega à equipe comercial com as unidades marcadas.' :
        'Pedido enviado. A equipe retorna em breve.';
    });
  }

  document.querySelectorAll('[data-total-patio]').forEach(function (el) { el.textContent = doisDigitos(UNIDADES.length) + ' unidades'; });
  desenharPatio();
  atualizarCotacao();
  if (/^#Z-\d+$/.test(location.hash)) abrirDossie(location.hash.slice(1));
})();
