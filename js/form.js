function formatarTelefone(numero) {
  const somenteNumeros = numero.replace(/\D/g, "");
  return somenteNumeros.length >= 10 && somenteNumeros.length <= 11;
}

function formatarValor(valor) {
  const num = valor.replace(/\D/g, "");
  const formatado = (Number(num) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return formatado;
}

function aplicarMascaraValor(input) {
  input.addEventListener("input", function () {
    const cursorPos = this.selectionStart;
    const valorFormatado = formatarValor(this.value);
    this.value = valorFormatado;
  });
}

function enviarParaWhatsApp(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const tipo = document.getElementById("tipo").value.trim();
  const finalidade = document.getElementById("finalidade").value.trim();
  const bairro = document.getElementById("bairro").value.trim();
  const valor = document.getElementById("valor").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

    // Remove classes inválidas anteriores
  document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("invalid"));

  // Aplica classe inválida se o campo estiver vazio
  if (!nome) document.getElementById("nome").classList.add("invalid");
  if (!telefone || !formatarTelefone(telefone)) document.getElementById("telefone").classList.add("invalid");
  if (!tipo) document.getElementById("tipo").classList.add("invalid");
  if (!finalidade) document.getElementById("finalidade").classList.add("invalid");
  if (!bairro) document.getElementById("bairro").classList.add("invalid");
  if (!valor) document.getElementById("valor").classList.add("invalid");


  if (!nome || !telefone || !tipo || !finalidade || !bairro || !valor) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (!formatarTelefone(telefone)) {
    alert("Telefone inválido. Insira com DDD e apenas números.");
    return;
  }

  const mensagem = `Olá, Gabriel! Gostaria de anunciar meu imóvel:
👤 Nome: ${nome}
📞 WhatsApp: ${telefone}
🏠 Tipo: ${tipo}
🎯 Finalidade: ${finalidade}
📍 Localização: ${bairro}
💰 Valor: ${valor}
📝 Descrição: ${descricao || 'Sem descrição adicional.'}`;

  const numero = "5577988480076";
  const url = `https://wa.me/${numero}?text=${encodeURI(mensagem)}`;

  console.log("Redirecionando para o WhatsApp...");
  window.open(url, "_blank");
}

// Ativa a máscara no campo de valor ao carregar
document.addEventListener("DOMContentLoaded", function () {
  const campoValor = document.getElementById("valor");
  aplicarMascaraValor(campoValor);
});
