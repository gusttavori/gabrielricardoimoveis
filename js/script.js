const tipoSelect = document.getElementById('tipoSelect');
const bairroSelect = document.getElementById('bairroSelect');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const form = document.getElementById('searchForm');

let finalidadeAtual = 'venda';
let imoveis = [];

// Carrega todos os imóveis do backend e atualiza os filtros
async function carregarImoveisFiltro() {
  try {
    const response = await fetch('https://api-geral-g6bc.onrender.com/imoveis');
    const data = await response.json();
    imoveis = data.imoveis; 

    // console.log('✅ Imóveis carregados:', imoveis);
    atualizarCampos();
    // Chama a renderização inicial após carregar e atualizar os campos
    renderizarImoveisFiltrados();
  } catch (error) {
    console.error('Erro ao carregar imóveis para filtro:', error);
  }
}


// Atualiza os campos de tipo e bairro com base na finalidade selecionada
function atualizarCampos() {
  const filtrados = imoveis.filter(imovel => imovel.finalidade === finalidadeAtual);

  const tipos = [...new Set(filtrados.map(imovel => imovel.tipo))];
  tipoSelect.innerHTML = '<option value="">Tipo do imóvel</option>';
  tipos.forEach(tipo => {
    const opt = document.createElement('option');
    opt.value = tipo;
    opt.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    tipoSelect.appendChild(opt);
  });

  bairroSelect.innerHTML = '<option value="">Selecione o Tipo de imóvel para prosseguir</option>';
}

// Atualiza os bairros com base no tipo selecionado
tipoSelect.addEventListener('change', () => {
  const tipoSelecionado = tipoSelect.value;

  if (!tipoSelecionado) {
    bairroSelect.innerHTML = '<option value="">Selecione um Bairro</option>';
    return;
  }

  const filtrados = imoveis.filter(
    imovel => imovel.finalidade === finalidadeAtual && imovel.tipo === tipoSelecionado
  );

  const bairros = [...new Set(filtrados.map(imovel => imovel.bairro))];
  bairroSelect.innerHTML = '<option value="">Bairro</option>';
  bairros.forEach(bairro => {
    const opt = document.createElement('option');
    opt.value = bairro;
    opt.textContent = bairro;
    bairroSelect.appendChild(opt);
  });
});

// Alterna entre Venda e Locação
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    finalidadeAtual = btn.dataset.type;
    atualizarCampos();
  });
});

// Submete o formulário de filtro
form.addEventListener('submit', e => {
  e.preventDefault();
  const tipo = tipoSelect.value;
  const bairro = bairroSelect.value;

  renderizarImoveisFiltrados({
    finalidade: finalidadeAtual,
    tipo: tipo || null,
    bairro: bairro || null
  });
});

// Função utilitária para formatar preço
function formatarPreco(preco) {
  if (typeof preco === 'string' && preco.trim().toUpperCase() === 'CONSULTAR VALOR') {
    return 'CONSULTAR VALOR';
  }

  const numero = Number(preco);
  if (isNaN(numero)) return preco;

  return `R$ ${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Renderiza imóveis com base nos filtros
function renderizarImoveisFiltrados(filtros = {}) {
  const casasSection = document.getElementById('casas-section');
  const aptosSection = document.getElementById('apartamentos-section');
  const terrenosSection = document.getElementById('terrenos-section');
  const comerciaisSection = document.getElementById('comerciais-section');

  const casasList = document.getElementById('casas-list');
  const aptosList = document.getElementById('apartamentos-list');
  const terrenosList = document.getElementById('terrenos-list');
  const comerciaisList = document.getElementById('comerciais-list');

  // Limpa todas as listas
  casasList.innerHTML = '';
  aptosList.innerHTML = '';
  terrenosList.innerHTML = '';
  comerciaisList.innerHTML = '';

  // Esconde todas as seções inicialmente
  casasSection.style.display = 'none';
  aptosSection.style.display = 'none';
  terrenosSection.style.display = 'none';
  comerciaisSection.style.display = 'none';

  const { finalidade, tipo, bairro } = filtros;

  const filtrados = imoveis.filter(imovel => {
    // Se nenhum filtro for passado, finalidade será undefined, então usamos a finalidadeAtual como padrão
    const finalidadeFiltro = finalidade !== undefined ? finalidade : finalidadeAtual;
    return (!finalidadeFiltro || imovel.finalidade === finalidadeFiltro) &&
           (!tipo || imovel.tipo === tipo) &&
           (!bairro || imovel.bairro === bairro);
  });

  if (filtrados.length === 0) {
    const containerResultados = document.getElementById('casas-list') || document.body;
    containerResultados.innerHTML = '<p class="no-results">Nenhum imóvel encontrado com os filtros selecionados.</p>';
    const secaoResultados = containerResultados.closest('section');
    if (secaoResultados) {
        secaoResultados.style.display = 'block';
    }
    return;
  }

  filtrados.forEach(imovel => {
    const tipoLower = imovel.tipo ? imovel.tipo.toLowerCase() : '';
    const precoFormatado = formatarPreco(imovel.preco);
    const div = document.createElement('div');
    div.classList.add('property-card');
    div.innerHTML = `
      <div class="image-container">
        <img src="${imovel.imagens && imovel.imagens.length > 0 ? imovel.imagens[0] : 'img/default.jpg'}" alt="${imovel.titulo}" />
        <div class="price-tag">${precoFormatado}</div>
      </div>
      <div class="property-info">
        <h3>${imovel.titulo}</h3>
        <p>${imovel.bairro}</p>
        <p>Dormitórios: ${imovel.dormitorios} | Banheiros: ${imovel.banheiros}</p>
      </div>
    `;

    // --- DIAGNÓSTICO AVANÇADO ---
    // console.log('---------------------------------');
    // console.log(`Verificando imóvel: "${imovel.titulo}"`);
    // console.log('Objeto completo:', imovel);
    // console.log('O imóvel tem a propriedade "_id"?', imovel.hasOwnProperty('_id'));
    // console.log('Valor de imovel.id:', imovel._id); 
    
    // Adiciona o evento de clique para redirecionar, usando o campo "_id"
    if (imovel._id) {
      // console.log('✅ SUCESSO: _id encontrado. Adicionando clique.');
      div.dataset.imovelId = imovel._id;
      div.addEventListener('click', () => {
        window.location.href = `imovel.html?id=${imovel._id}`;
      });
    } else {
      // Este aviso aparece se o imóvel não tiver um campo "_id"
      console.error('❌ FALHA: Imóvel sem _id. Não será clicável.', imovel.titulo);
    }
    // console.log('---------------------------------');
    // --- FIM DO DIAGNÓSTICO ---

    if (tipoLower === 'casa' || tipoLower === 'casas') {
      casasList.appendChild(div);
      casasSection.style.display = 'block';
    } else if (tipoLower === 'apartamento' || tipoLower === 'apartamentos') {
      aptosList.appendChild(div);
      aptosSection.style.display = 'block';
    } else if (tipoLower === 'terreno' || tipoLower === 'terrenos') {
      terrenosList.appendChild(div);
      terrenosSection.style.display = 'block';
    } else if (tipoLower === 'sala comercial' || tipoLower === 'comercial' || tipoLower === 'salas comerciais') {
      comerciaisList.appendChild(div);
      comerciaisSection.style.display = 'block';
    }
  });
}

// Envio de formulário de contato via WhatsApp
// Verifica se o elemento existe antes de adicionar o listener
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


// Inicializa a página
window.addEventListener('DOMContentLoaded', () => {
  carregarImoveisFiltro(); // Carrega dados e depois renderiza
});
