// --- ELEMENTOS DO DOM ---
const tipoSelect = document.getElementById('tipoSelect');
const bairroSelect = document.getElementById('bairroSelect');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const form = document.getElementById('searchForm');
const removeFiltroBtn = document.getElementById('remove-filter-btn');

// --- ESTADO DA APLICAÇÃO ---
let imoveis = [];
// Começamos sem filtro de finalidade para mostrar todos os imóveis ao carregar.
let finalidadeAtual = '';

// --- FUNÇÕES ---

/**
 * Carrega todos os imóveis do backend, armazena localmente e inicia a renderização.
 */
async function carregarImoveisFiltro() {
  try {
    const response = await fetch('https://api-geral-g6bc.onrender.com/imoveis');
    const data = await response.json();
    imoveis = data.imoveis;

    // Atualiza os campos de filtro (dropdowns)
    atualizarCampos();
    // Renderiza a lista inicial (mostrará todos, pois finalidadeAtual está vazia)
    renderizarImoveisFiltrados();
    // Garante que o botão de remover filtro esteja no estado correto ao carregar
    atualizarVisibilidadeBotaoRemover();
  } catch (error) {
    console.error('Erro ao carregar imóveis para filtro:', error);
  }
}

/**
 * Atualiza os dropdowns de 'tipo' e 'bairro' com base na finalidade selecionada.
 */
function atualizarCampos() {
  const imoveisParaFiltro = finalidadeAtual
    ? imoveis.filter(imovel => imovel.finalidade === finalidadeAtual)
    : imoveis;

  const tipos = [...new Set(imoveisParaFiltro.map(imovel => imovel.tipo))];
  tipoSelect.innerHTML = '<option value="">Tipo do imóvel</option>';
  tipos.forEach(tipo => {
    const opt = document.createElement('option');
    opt.value = tipo;
    opt.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    tipoSelect.appendChild(opt);
  });

  bairroSelect.innerHTML = '<option value="">Bairro</option>';
  bairroSelect.disabled = tipos.length === 0;
}

/**
 * Mostra ou esconde o botão de limpar filtro com base no estado atual.
 */
function atualizarVisibilidadeBotaoRemover() {
  if (removeFiltroBtn) {
    // Mostra o botão se uma finalidade, tipo ou bairro for selecionado.
    if (finalidadeAtual || tipoSelect.value || bairroSelect.value) {
      removeFiltroBtn.style.display = 'flex';
    } else {
      removeFiltroBtn.style.display = 'none';
    }
  }
}

// --- EVENT LISTENERS ---

/**
 * Atualiza a lista de bairros quando um tipo de imóvel é selecionado.
 */
tipoSelect.addEventListener('change', () => {
  const tipoSelecionado = tipoSelect.value;
  bairroSelect.innerHTML = '<option value="">Bairro</option>';

  if (!tipoSelecionado) {
    atualizarVisibilidadeBotaoRemover(); // Atualiza visibilidade caso o tipo seja desmarcado
    return;
  }

  const imoveisParaFiltro = finalidadeAtual
    ? imoveis.filter(imovel => imovel.finalidade === finalidadeAtual)
    : imoveis;

  const bairros = [...new Set(
    imoveisParaFiltro
      .filter(imovel => imovel.tipo === tipoSelecionado)
      .map(imovel => imovel.bairro)
  )];

  bairros.forEach(bairro => {
    const opt = document.createElement('option');
    opt.value = bairro;
    opt.textContent = bairro;
    bairroSelect.appendChild(opt);
  });

  atualizarVisibilidadeBotaoRemover(); // Atualiza visibilidade após selecionar um tipo
});

/**
 * Oculta/mostra o botão de limpar ao selecionar um bairro
 */
bairroSelect.addEventListener('change', () => {
    atualizarVisibilidadeBotaoRemover();
});


/**
 * Filtra os imóveis IMEDIATAMENTE ao clicar em 'Venda' ou 'Locação'.
 */
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    finalidadeAtual = btn.dataset.type;

    atualizarCampos();
    renderizarImoveisFiltrados();
    atualizarVisibilidadeBotaoRemover();
  });
});

/**
 * Limpa o filtro de finalidade e mostra todos os imóveis novamente.
 */
if (removeFiltroBtn) {
  removeFiltroBtn.addEventListener('click', () => {
    toggleButtons.forEach(b => b.classList.remove('active'));
    finalidadeAtual = ''; // Limpa a finalidade
    
    // Reseta os dropdowns
    tipoSelect.value = '';
    bairroSelect.value = '';
    
    atualizarCampos();
    renderizarImoveisFiltrados();
    atualizarVisibilidadeBotaoRemover();
  });
}

/**
 * Submete o formulário com filtros avançados.
 */
form.addEventListener('submit', e => {
  e.preventDefault();
  const tipo = tipoSelect.value;
  const bairro = bairroSelect.value;

  renderizarImoveisFiltrados({
    finalidade: finalidadeAtual,
    tipo: tipo || null,
    bairro: bairro || null
  });
  atualizarVisibilidadeBotaoRemover();
});

// --- FUNÇÕES DE RENDERIZAÇÃO E FORMATAÇÃO ---

/**
 * Formata um número como moeda brasileira ou retorna a string 'CONSULTAR VALOR'.
 */
function formatarPreco(preco) {
  if (typeof preco === 'string' && preco.trim().toUpperCase() === 'CONSULTAR VALOR') {
    return 'CONSULTAR VALOR';
  }
  const numero = Number(preco);
  if (isNaN(numero)) return preco;
  return `R$ ${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Renderiza a lista de imóveis na tela com base nos filtros aplicados.
 */
function renderizarImoveisFiltrados(filtros = {}) {
  const sections = {
    casas: { section: document.getElementById('casas-section'), list: document.getElementById('casas-list'), types: ['casa', 'casas'] },
    apartamentos: { section: document.getElementById('apartamentos-section'), list: document.getElementById('apartamentos-list'), types: ['apartamento', 'apartamentos'] },
    terrenos: { section: document.getElementById('terrenos-section'), list: document.getElementById('terrenos-list'), types: ['terreno', 'terrenos'] },
    comerciais: { section: document.getElementById('comerciais-section'), list: document.getElementById('comerciais-list'), types: ['sala comercial', 'comercial', 'salas comerciais'] }
  };

  Object.values(sections).forEach(({ section, list }) => {
    list.innerHTML = '';
    section.style.display = 'none';
  });

  const { finalidade, tipo, bairro } = filtros;
  const finalidadeFiltro = finalidade !== undefined ? finalidade : finalidadeAtual;

  const filtrados = imoveis.filter(imovel => {
    const condicaoFinalidade = !finalidadeFiltro || imovel.finalidade === finalidadeFiltro;
    const condicaoTipo = !tipo || imovel.tipo === tipo;
    const condicaoBairro = !bairro || imovel.bairro === bairro;
    return condicaoFinalidade && condicaoTipo && condicaoBairro;
  });

  if (filtrados.length === 0) {
    const containerResultados = document.getElementById('casas-list') || document.body;
    containerResultados.innerHTML = '<p class="no-results">Nenhum imóvel encontrado.</p>';
    if (containerResultados.closest('section')) {
      containerResultados.closest('section').style.display = 'block';
    }
    return;
  }

  const imoveisAgrupados = { casas: [], apartamentos: [], terrenos: [], comerciais: [] };
  filtrados.forEach(imovel => {
    const tipoLower = imovel.tipo ? imovel.tipo.toLowerCase() : '';
    if (sections.casas.types.includes(tipoLower)) imoveisAgrupados.casas.push(imovel);
    else if (sections.apartamentos.types.includes(tipoLower)) imoveisAgrupados.apartamentos.push(imovel);
    else if (sections.terrenos.types.includes(tipoLower)) imoveisAgrupados.terrenos.push(imovel);
    else if (sections.comerciais.types.includes(tipoLower)) imoveisAgrupados.comerciais.push(imovel);
  });

  for (const key in imoveisAgrupados) {
    if (imoveisAgrupados[key].length > 0) {
      const categoria = sections[key];
      imoveisAgrupados[key].forEach(imovel => {
        const div = document.createElement('div');
        div.classList.add('property-card');
        div.innerHTML = `
          <div class="image-container">
              <img src="${imovel.imagens && imovel.imagens.length > 0 ? imovel.imagens[0] : 'img/default.jpg'}" alt="${imovel.titulo}" />
              <div class="price-tag">${formatarPreco(imovel.preco)}</div>
          </div>
          <div class="property-info">
              <h3>${imovel.titulo}</h3>
              <p>${imovel.bairro} - ${imovel.area} m²</p> 
          </div>
        `;
        if (imovel._id) {
          div.addEventListener('click', () => {
            window.location.href = `imovel.html?id=${imovel._id}`;
          });
        }
        categoria.list.appendChild(div);
      });
      categoria.section.style.display = 'block';
    }
  }
}

// --- INICIALIZAÇÃO DA PÁGINA ---
window.addEventListener('DOMContentLoaded', () => {
  carregarImoveisFiltro();
});


// Envio de formulário de contato via WhatsApp
// (Seu código original para esta parte é mantido)
const formContato = document.getElementById('formContato');
if (formContato) {
    formContato.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Mensagem enviada com sucesso!');
        this.reset();
    });
}

const enviarBtn = document.getElementById('enviarBtn');
if (enviarBtn) {
    enviarBtn.addEventListener('click', function () {
        const form = document.getElementById('formContato');
        const nome = form.nome.value.trim();
        const telefone = form.telefone.value.trim();
        const interesse = form.interesse.value.trim();

        if (!nome || !telefone) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const numeroCorretor = '5577988480076';
        const mensagem = `Olá, Gabriel! Me chamo ${nome}. Meu telefone é ${telefone}. Tenho interesse em: ${interesse || 'não especificado'}.`;
        const url = `https://wa.me/${numeroCorretor}?text=${encodeURIComponent(mensagem)}`;

        window.open(url, '_blank');
    });
}