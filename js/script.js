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
    
    // Atualiza os campos de filtro (dropdowns)
    atualizarCampos(); 
    
    // E agora, renderiza os imóveis com a nova finalidade selecionada
    renderizarImoveisFiltrados(); 
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
// Renderiza imóveis com base nos filtros (VERSÃO CORRIGIDA E OTIMIZADA)
function renderizarImoveisFiltrados(filtros = {}) {
    const sections = {
        casas: {
            section: document.getElementById('casas-section'),
            list: document.getElementById('casas-list'),
            types: ['casa', 'casas']
        },
        apartamentos: {
            section: document.getElementById('apartamentos-section'),
            list: document.getElementById('apartamentos-list'),
            types: ['apartamento', 'apartamentos']
        },
        terrenos: {
            section: document.getElementById('terrenos-section'),
            list: document.getElementById('terrenos-list'),
            types: ['terreno', 'terrenos']
        },
        comerciais: {
            section: document.getElementById('comerciais-section'),
            list: document.getElementById('comerciais-list'),
            types: ['sala comercial', 'comercial', 'salas comerciais']
        }
    };

    // Limpa todas as listas e esconde todas as seções primeiro
    for (const key in sections) {
        if (sections.hasOwnProperty(key)) {
            sections[key].list.innerHTML = '';
            sections[key].section.style.display = 'none';
        }
    }

    const { finalidade, tipo, bairro } = filtros;

    // 1. FILTRAR A LISTA PRINCIPAL
    const filtrados = imoveis.filter(imovel => {
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

    // 2. AGRUPAR IMÓVEIS FILTRADOS POR CATEGORIA
    const imoveisAgrupados = {
        casas: [],
        apartamentos: [],
        terrenos: [],
        comerciais: []
    };

    filtrados.forEach(imovel => {
        const tipoLower = imovel.tipo ? imovel.tipo.toLowerCase() : '';
        if (sections.casas.types.includes(tipoLower)) {
            imoveisAgrupados.casas.push(imovel);
        } else if (sections.apartamentos.types.includes(tipoLower)) {
            imoveisAgrupados.apartamentos.push(imovel);
        } else if (sections.terrenos.types.includes(tipoLower)) {
            imoveisAgrupados.terrenos.push(imovel);
        } else if (sections.comerciais.types.includes(tipoLower)) {
            imoveisAgrupados.comerciais.push(imovel);
        }
    });

    // 3. RENDERIZAR CADA CATEGORIA QUE TIVER IMÓVEIS
    for (const key in imoveisAgrupados) {
        if (imoveisAgrupados[key].length > 0) {
            const categoria = sections[key];
            
            // Para cada imóvel no grupo, crie o card e adicione à lista
            imoveisAgrupados[key].forEach(imovel => {
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
                    </div>
                `;

                if (imovel._id) {
                    div.dataset.imovelId = imovel._id;
                    div.addEventListener('click', () => {
                        window.location.href = `imovel.html?id=${imovel._id}`;
                    });
                } else {
                    console.error('FALHA: Imóvel sem _id. Não será clicável.', imovel.titulo);
                }
                
                categoria.list.appendChild(div);
            });
            
            // Agora que todos os cards foram adicionados, mostre a seção inteira
            categoria.section.style.display = 'block';
        }
    }
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
