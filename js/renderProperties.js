const propriedades = {
  casas: [
    {
      titulo: "Condomínio Alfa Park",
      localizacao: "Estrada da Barra",
      preco: "R$ 390.000",
      imagem: "img/primavera.png",
      quartos: undefined,
      banheiros: undefined,
    },
    {
      titulo: "Conde Residencial III",
      localizacao: "Bairro Primavera",
      preco: "R$ 350.000",
      imagem: "img/conde.jpg",
      quartos: undefined,
      banheiros: undefined,
    },
    {
      titulo: "Conde Residencial III",
      localizacao: "Bairro Primavera",
      preco: "R$ 350.000",
      imagem: "img/conde.jpg",
      quartos: undefined,
      banheiros: undefined,
    },
  ],
  apartamentos: [
    {
      titulo: "Condomínio Alfa Park",
      localizacao: "Estrada da Barra",
      preco: "R$ 390.000",
      imagem: "img/primavera.png",
      quartos: undefined,
      banheiros: undefined,
    },
    {
      titulo: "Conde Residencial III",
      localizacao: "Bairro Primavera",
      preco: "R$ 350.000",
      imagem: "img/conde.jpg",
      quartos: undefined,
      banheiros: undefined,
    },
  ],
};

function criarCard(prop) {
  return `
    <div class="property-card">
      <div class="image-container">
        <img src="${prop.imagem}" alt="Imagem imóvel" />
        <div class="price-tag">${prop.preco}</div>
      </div>
      <div class="property-info">
        <h3>${prop.titulo}</h3>
        <p>${prop.localizacao}</p>
        <div class="details">
          <span>🛏 <strong>${prop.quartos} quartos</strong></span>
          <span>🛁 <strong>${prop.banheiros} banheiros</strong></span>
        </div>
      </div>
    </div>
  `;
}

function renderizarPropriedades(lista, elementoId) {
  const container = document.getElementById(elementoId);
  container.innerHTML = lista.map(criarCard).join("");
}

renderizarPropriedades(propriedades.casas, "casas-list");
renderizarPropriedades(propriedades.apartamentos, "apartamentos-list");