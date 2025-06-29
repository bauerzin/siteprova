document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("tabelaProvas");
  const mensagemErro = document.getElementById("mensagem-erro");

  document.getElementById("novaProvaBtn").addEventListener("click", () => {
    window.location.href = "prova.html";
  });

  fetch("http://localhost:5000/api/provas")
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar provas.");
      return res.json();
    })
    .then(provas => {
      if (provas.length === 0) {
        tabela.innerHTML = `<tr><td colspan="3">Nenhuma prova encontrada.</td></tr>`;
        return;
      }

      provas.forEach(prova => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${prova.titulo}</td>
          <td>${prova.disciplina}</td>
          <td><button onclick="editarProva(${prova.idProva})" class="botao">Editar</button></td>
        `;
        tabela.appendChild(tr);
      });
    })
    .catch(() => {
      mensagemErro.hidden = false;
      mensagemErro.textContent = "Não foi possível carregar as provas.";
    });
});

function editarProva(id) {
  window.location.href = `prova.html?id=${id}`;
}
