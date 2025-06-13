document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Busca realizada! (Funcionalidade futura)');
});

const toggleButtons = document.querySelectorAll('.toggle-btn');
let tipoSelecionado = 'venda'; // padrão

toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tipoSelecionado = btn.dataset.type;
    console.log('Selecionado:', tipoSelecionado);
  });
});

document.getElementById('searchForm').addEventListener('submit', e => {
  e.preventDefault();
  alert(`Buscar imóveis para: ${tipoSelecionado}`);
});

document.getElementById('formContato').addEventListener('submit', function (e) {
  e.preventDefault();
  alert('Mensagem enviada com sucesso!');
  this.reset();
});