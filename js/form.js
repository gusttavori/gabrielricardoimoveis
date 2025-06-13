function enviarParaWhatsApp(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const interesse = document.getElementById("interesse").value;

  if (!nome || !telefone || !email || !interesse) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

const mensagem = `Olá, Gabriel! Meus dados são:%0A👤 Nome: ${nome}%0A📞 Telefone: ${telefone}%0A📧 E-mail: ${email}%0A🏘️ Interesse: ${interesse}`;
  const numero = "5577988480076"; 

  const url = `https://wa.me/${numero}?text=${mensagem}`;
  window.open(url, "_blank");
}
