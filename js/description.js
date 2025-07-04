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

        // =================================================================================
        // 2. Galeria de Imagens e Carrossel Interativo (LÓGICA ATUALIZADA)
        // =================================================================================
        const imagens = dados.imagens || [];
        let currentImageIndex = 0;

        // Pega os elementos do modal do HTML
        const modal = document.getElementById('image-carousel-modal');
        const modalImg = document.getElementById('modal-image');
        const closeBtn = document.querySelector('.modal-close');
        const prevBtn = document.querySelector('.modal-prev');
        const nextBtn = document.querySelector('.modal-next');
        
        // Função para mostrar uma imagem específica no modal
        function showImage(index) {
            if (imagens.length === 0) return; // Não faz nada se não houver imagens
            
            // Garante que o índice seja sempre válido e faça um loop (ex: de 11 volta pra 0)
            currentImageIndex = (index + imagens.length) % imagens.length; 
            modalImg.src = imagens[currentImageIndex];
            modal.style.display = 'flex'; // Usa flex para centralizar
        }
        
        // --- Lógica da Galeria Híbrida ---
        
        // Seleciona todas as imagens da galeria (a principal e as do grid)
        const galleryImages = document.querySelectorAll('#imovel-gallery .gallery-main img, #imovel-gallery .gallery-grid img');

        // Popula a galeria e adiciona os listeners de clique
        galleryImages.forEach((imgElement, index) => {
            if (imagens[index]) {
                imgElement.src = imagens[index];
                imgElement.style.cursor = 'pointer'; // Muda o cursor para indicar que é clicável

                // Adiciona o evento de clique para abrir o carrossel naquela imagem
                imgElement.addEventListener('click', () => {
                    showImage(index);
                });
            } else {
                // Se não houver imagem correspondente, usa um placeholder
                const placeholderUrl = imgElement.parentElement.classList.contains('gallery-main') 
                    ? 'https://placehold.co/800x550?text=Imagem+Indisponível' 
                    : 'https://placehold.co/400x275?text=Imagem+Indisponível';
                imgElement.src = placeholderUrl;
            }
        });
        
        // Atualiza o texto e a ação do botão "Ver mais"
        const morePhotosBtn = document.querySelector('.view-more-photos-btn');
        if (morePhotosBtn) {
        // Altera o texto para ser mais informativo e adiciona a quebra de linha
        morePhotosBtn.innerHTML = `Ver todas <br> as fotos`;
            
            morePhotosBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Abre o carrossel na primeira imagem ao clicar no botão
                showImage(0); 
            });
        }
        
        // --- Listeners Globais do Carrossel ---

        // Fecha o modal ao clicar no 'X'
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Navega para a imagem anterior
        prevBtn.addEventListener('click', () => {
            showImage(currentImageIndex - 1);
        });

        // Navega para a próxima imagem
        nextBtn.addEventListener('click', () => {
            showImage(currentImageIndex + 1);
        });

        // Fecha o modal ao clicar fora da imagem (no overlay escuro)
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Fecha o modal com a tecla 'Esc' do teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                modal.style.display = 'none';
            }
        });
        // =================================================================================
        // FIM DA LÓGICA DA GALERIA
        // =================================================================================
        
        // 3. Descrição
        const descricaoContainer = document.getElementById('descricaoImovel');
        if (descricaoContainer) {
            descricaoContainer.textContent = dados.descricao.replace(/\.\s*/g, '. ').trim();
        }

        // 4. Grid de Características
        document.getElementById('spec-area').textContent = `${dados.area || '--'} m²`;
        document.getElementById('spec-quartos').textContent = `${dados.dormitorios || '0'}`;
        document.getElementById('spec-banheiros').textContent = `${dados.banheiros || '0'}`;
        document.getElementById('spec-garagem').textContent = dados.garagem ? 'Sim' : 'Não';
        document.getElementById('spec-piscina').textContent = dados.piscina ? 'Sim' : 'Não';
        
        // --- LÓGICA DO CONDOMÍNIO CORRIGIDA E SIMPLIFICADA ---
        const condominioSpecItem = document.getElementById('condominio-spec-item');
        const specCondominioSpan = document.getElementById('spec-condominio');

        if (dados.valorCondominio && dados.valorCondominio > 0) {
            condominioSpecItem.style.display = 'flex'; 
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(dados.valorCondominio);
            specCondominioSpan.textContent = valorFormatado;
            condominioSpecItem.querySelector('p').textContent = 'Valor do Condomínio';
        } else {
            condominioSpecItem.style.display = 'none';
        }
        
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