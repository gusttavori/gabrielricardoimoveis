// Função utilitária para formatar preço (mantida)
function formatarPreco(preco) {
    if (typeof preco === 'string' && preco.trim().toUpperCase() === 'CONSULTAR VALOR') {
        return 'CONSULTAR VALOR';
    }

    const numero = Number(preco);
    if (isNaN(numero)) return 'Preço a definir';

    return `R$ ${numero.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Função auxiliar para atualizar ou ocultar um item de característica.
 * @param {string} spanId - O ID do elemento <span> que exibe o valor (ex: 'spec-quartos').
 * @param {*} valor - O valor vindo da API para a característica.
 * @param {function} formatarCallback - Uma função que formata o texto a ser exibido.
 */
function exibirOuOcultarCaracteristica(spanId, valor, formatarCallback) {
    const spanElement = document.getElementById(spanId);
    if (!spanElement) {
        console.warn(`Elemento span com ID '${spanId}' não encontrado.`);
        return;
    }
    
    // Encontra o contêiner pai mais próximo com a classe '.spec-item'
    const container = spanElement.closest('.spec-item');
    if (!container) {
        console.warn(`Contêiner '.spec-item' pai para o span '${spanId}' não encontrado.`);
        return;
    }

    // Condição para exibir: valor não pode ser nulo, undefined, 0, ou false.
    const deveExibir = valor !== null && valor !== undefined && valor !== 0 && valor !== false && valor !== '';

    if (deveExibir) {
        container.style.display = ''; // Reseta para o display padrão do CSS (flex, block, etc.)
        spanElement.innerHTML = formatarCallback(valor);
    } else {
        container.style.display = 'none'; // Oculta o contêiner inteiro
    }
}


async function carregarImovel() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.body.innerHTML = '<p style="padding: 2rem; font-size: 1.2rem;">Imóvel não encontrado ou ID ausente na URL.</p>';
        return;
    }

    try {
        const response = await fetch(`https://api-geral-g6bc.onrender.com/imoveis/${id}`);
        if (!response.ok) {
            throw new Error(`Imóvel não encontrado (Status: ${response.status})`);
        }
        const dados = await response.json();

        // --- PREENCHENDO O LAYOUT ---

        // 1. Título e Preço
        document.title = dados.titulo;
        document.getElementById('tituloImovel').textContent = dados.titulo;
        document.getElementById('precoImovel').textContent = formatarPreco(dados.preco);

        // 2. Galeria de Imagens (lógica mantida)
        const imagens = dados.imagens || [];
        let currentImageIndex = 0;
        const modal = document.getElementById('image-carousel-modal');
        const modalImg = document.getElementById('modal-image');
        const closeBtn = document.querySelector('.modal-close');
        const prevBtn = document.querySelector('.modal-prev');
        const nextBtn = document.querySelector('.modal-next');
        
        function showImage(index) {
            if (imagens.length === 0) return;
            currentImageIndex = (index + imagens.length) % imagens.length; 
            modalImg.src = imagens[currentImageIndex];
            modal.style.display = 'flex';
        }
        
        const galleryImages = document.querySelectorAll('#imovel-gallery .gallery-main img, #imovel-gallery .gallery-grid img');
        galleryImages.forEach((imgElement, index) => {
            if (imagens[index]) {
                imgElement.src = imagens[index];
                imgElement.style.cursor = 'pointer';
                imgElement.addEventListener('click', () => showImage(index));
            } else {
                const placeholderUrl = imgElement.parentElement.classList.contains('gallery-main') 
                    ? 'https://placehold.co/800x550?text=Imagem+Indisponível' 
                    : 'https://placehold.co/400x275?text=Imagem+Indisponível';
                imgElement.src = placeholderUrl;
            }
        });
        
        const morePhotosBtns = document.querySelectorAll('.view-more-photos-btn');
        morePhotosBtns.forEach(btn => {
            if (!btn.id || btn.id !== 'mobile-view-photos') {
                btn.innerHTML = `Ver todas <br> as fotos`;
            }
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showImage(0); 
            });
        });
        
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        prevBtn.addEventListener('click', () => showImage(currentImageIndex - 1));
        nextBtn.addEventListener('click', () => showImage(currentImageIndex + 1));
        window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') modal.style.display = 'none'; });

        // 3. Descrição
        const descricaoContainer = document.getElementById('descricaoImovel');
        if (descricaoContainer) {
            // Apenas atribua o texto. O CSS cuidará das quebras de linha.
            descricaoContainer.textContent = dados.descricao;
        }

        // --- MODIFICAÇÃO PRINCIPAL: Grid de Características Condicional ---
        // As chamadas agora usam os IDs dos <span>s do seu HTML (ex: 'spec-area').
        // A função foi ajustada para encontrar o contêiner '.spec-item' e escondê-lo se necessário.

        exibirOuOcultarCaracteristica('spec-area', dados.area, valor => `${valor} m²`);
        exibirOuOcultarCaracteristica('spec-quartos', dados.dormitorios, valor => `${valor}`);
        exibirOuOcultarCaracteristica('spec-banheiros', dados.banheiros, valor => `${valor}`);
        exibirOuOcultarCaracteristica('spec-garagem', dados.garagem, valor => (valor ? 'Sim' : 'Não'));
        exibirOuOcultarCaracteristica('spec-piscina', dados.piscina, valor => (valor ? 'Sim' : 'Não'));
        exibirOuOcultarCaracteristica('spec-condominio', dados.valorCondominio, valor => 
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
        );

        // 5. Lógica do Botão de Contato (WhatsApp)
        const btnContato = document.getElementById('btn-contato');
        if(btnContato) {
            btnContato.addEventListener('click', () => {
                const numeroCorretor = '5577988480076'; // Seu número
                const mensagem = `Olá, Gabriel! Tenho interesse no imóvel "${dados.titulo}". Poderia me passar mais informações?`;
                const url = `https://wa.me/${numeroCorretor}?text=${encodeURIComponent(mensagem)}`;
                window.open(url, '_blank');
            });
        }

    } catch (error) {
        console.error('Erro ao carregar imóvel:', error);
        document.body.innerHTML = `<p style="padding: 2rem; font-size: 1.2rem;">Erro ao carregar os detalhes do imóvel. Ele pode não estar mais disponível. Tente novamente mais tarde.</p>`;
    }
}

// Executa a função quando a página carrega
window.onload = carregarImovel;
