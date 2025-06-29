// Espera o carregamento completo do HTML antes de executar o script
document.addEventListener("DOMContentLoaded", () => {

  // Seleciona o corpo da tabela onde as questões serão exibidas
  const tabela = document.querySelector("#tabelaQuestoes tbody");

  // Seleciona a div de mensagem de erro (fica escondida por padrão)
  const mensagemErro = document.getElementById("mensagem-erro");

  // Quando o botão "Nova Questão" for clicado, redireciona para a página de cadastro
  document.getElementById("novaQuestaoBtn").addEventListener("click", () => {
    window.location.href = "questao.html";
  });

  // Faz uma requisição GET para a API para buscar as questões cadastradas
  fetch("http://localhost:5000/api/questoes")
    .then(res => {
      // Se a resposta da API não for OK (status 200), lança erro
      if (!res.ok) throw new Error("Erro ao buscar questões");
      
      // Converte a resposta para JSON
      return res.json();
    })
    .then(questoes => {
      // Se a API retornou uma lista vazia, mostra mensagem na tabela
      console.log(questoes);
      if (questoes.length === 0) {
        const linha = document.createElement("tr");
        linha.innerHTML = `<td colspan="4">Nenhuma questão encontrada.</td>`;
        tabela.appendChild(linha);
        return;
      }

      // Para cada questão recebida, cria uma linha na tabela
      questoes.forEach(questao => {
        const linha = document.createElement("tr");

        // Concatena os assuntos separados por vírgula (se existirem)
        const assuntosFormatados = questao.assuntos?.join(", ") || "";

        // Preenche a linha com os dados da questão
        linha.innerHTML = `
          <td>${questao.titulo}</td>
          <td>${questao.disciplina}</td>
          <td>${assuntosFormatados}</td>
          <td>
            <button onclick="editarQuestao(${questao.idQuestao})" class="botao botao-secundario">Editar</button>
          </td>
        `;

        // Adiciona a linha na tabela
        tabela.appendChild(linha);
      });
    })
    .catch(err => {
      // Se houve erro na requisição, mostra mensagem amigável
      console.error(err);
      mensagemErro.hidden = false;
      mensagemErro.textContent = "Não foi possível carregar as questões. Verifique sua conexão com o servidor.";
    });
});

// Função chamada ao clicar em "Editar", redireciona com o ID na URL
function editarQuestao(id) {
  window.location.href = `questao.html?id=${id}`;
}
