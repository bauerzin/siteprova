document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idProva = urlParams.get("id");

  const tituloPagina = document.getElementById("tituloPagina");
  const form = document.getElementById("formProva");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnExcluir = document.getElementById("btnExcluir");
  const mensagemErro = document.getElementById("mensagemErro");

  const inputTitulo = document.getElementById("titulo");
  const inputDisciplina = document.getElementById("disciplina");
  const questoesFiltradasDiv = document.getElementById("questoesFiltradas");
  const questoesSelecionadasDiv = document.getElementById("questoesSelecionadas");

  // Guarda as questões selecionadas (array de objetos)
  let questoesSelecionadas = [];

  // Guarda as questões filtradas exibidas
  let questoesFiltradas = [];

  // Atualiza o botão salvar (Inserir ou Atualizar) e remove botão de remover
  if (idProva) {
    tituloPagina.textContent = "Editar Prova";
    btnSalvar.textContent = "Atualizar Prova";
    btnExcluir.hidden = false;
  } else {
    btnExcluir.hidden = true;
  }

  // Função para mostrar mensagem de erro
  function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.hidden = false;
  }

  function esconderErro() {
    mensagemErro.hidden = true;
  }

  // Função para buscar e carregar prova quando for editar
  function carregarProva(id) {
    fetch(`http://localhost:5000/api/provas/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar prova.");
        return res.json();
      })
      .then(prova => {
        inputTitulo.value = prova.titulo;
        inputDisciplina.value = prova.disciplina;
        questoesSelecionadas = prova.questoes || [];
        renderizarSelecionadas();
      })
      .catch(() => {
        mostrarErro("Não foi possível carregar a prova.");
      });
  }

  // Função para renderizar lista de questões selecionadas
  function renderizarSelecionadas() {
    questoesSelecionadasDiv.innerHTML = "";

    if (questoesSelecionadas.length === 0) {
      questoesSelecionadasDiv.innerHTML = "<p>Nenhuma questão selecionada.</p>";
      return;
    }

    questoesSelecionadas.forEach(q => {
      const div = document.createElement("div");
      div.className = "questao-item";

      // Renderiza alternativas, se existirem e forem válidas
      let alternativasHtml = "";
      if (Array.isArray(q.Alternativas) && q.Alternativas.length > 0) {
        const alternativasValidas = q.Alternativas.filter(alt => alt && alt.descricao);
        if (alternativasValidas.length > 0) {
          alternativasHtml = '<div class="questao-alternativas"><strong>Alternativas:</strong><ul>' +
            alternativasValidas.map((alt, i) => `<li>${String.fromCharCode(65 + i)}. ${alt.descricao}${alt.correta ? ' (Correta)' : ''}</li>`).join('') +
            '</ul></div>';
        } else {
          alternativasHtml = '<div class="questao-alternativas"><em>Sem alternativas válidas.</em></div>';
        }
      }

      div.innerHTML = `
        <div class="questao-info">
          <div class="questao-titulo">${q.titulo}</div>
          <div class="questao-assuntos">${q.assuntos.join(", ")}</div>
          ${alternativasHtml}
        </div>
        <button class="btn-pequeno btn-remover" title="Remover da prova">Remover</button>
      `;

      // Clique para remover questão da seleção
      div.querySelector(".btn-remover").addEventListener("click", () => {
        questoesSelecionadas = questoesSelecionadas.filter(item => item.idQuestao !== q.idQuestao);
        renderizarSelecionadas();
      });

      questoesSelecionadasDiv.appendChild(div);
    });
  }

  // Função para renderizar questões filtradas
  function renderizarFiltradas() {
    questoesFiltradasDiv.innerHTML = "";

    if (questoesFiltradas.length === 0) {
      questoesFiltradasDiv.innerHTML = "<p>Nenhuma questão encontrada para o filtro.</p>";
      return;
    }

    questoesFiltradas.forEach(q => {
      // Não mostrar questões que já estão selecionadas
      if (questoesSelecionadas.some(sel => sel.idQuestao === q.idQuestao)) return;

      const div = document.createElement("div");
      div.className = "questao-item";

      div.innerHTML = `
        <div class="questao-info">
          <div class="questao-titulo">${q.titulo}</div>
          <div class="questao-assuntos">${q.assuntos.join(", ")}</div>
        </div>
        <button class="btn-pequeno btn-adicionar" title="Adicionar à prova">Adicionar</button>
      `;

      // Adicionar questão à seleção
      div.querySelector(".btn-adicionar").addEventListener("click", () => {
        questoesSelecionadas.push(q);
        renderizarSelecionadas();
        renderizarFiltradas();
      });

      questoesFiltradasDiv.appendChild(div);
    });
  }

  // Função para buscar questões (agora busca todas, sem filtro)
  function buscarQuestoes() {
    let url = "http://localhost:5000/api/questoes";
    questoesFiltradasDiv.innerHTML = "<p>Carregando questões...</p>";
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar questões.");
        return res.json();
      })
      .then(dados => {
        // Depuração: verifique como as alternativas chegam do backend
        console.log('Questões recebidas do backend:', dados);
        // Padronizar nome da propriedade Alternativas
        questoesFiltradas = dados.map(q => {
          if (q.alternativas && !q.Alternativas) {
            q.Alternativas = q.alternativas;
          }
          return q;
        });
        renderizarFiltradas();
        esconderErro();
      })
      .catch(() => {
        questoesFiltradasDiv.innerHTML = "<p>Não foi possível carregar as questões.</p>";
        mostrarErro("Erro ao buscar questões.");
      });
  }

  // Inicializa: se editar, carrega prova e depois busca questões; se nova, só busca questões
  if (idProva) {
    carregarProva(idProva);
  }
  buscarQuestoes();

  // Submeter formulário: inserir ou atualizar prova
  form.addEventListener("submit", e => {
    e.preventDefault();
    esconderErro();

    if (questoesSelecionadas.length === 0) {
      mostrarErro("Adicione pelo menos uma questão à prova.");
      return;
    }

    const dadosProva = {
      Titulo: inputTitulo.value.trim(),
      Disciplina: inputDisciplina.value.trim(),
      QuestoesIds: questoesSelecionadas.map(q => q.idQuestao)
    };
    console.log('Enviando para o backend:', dadosProva);

    const metodo = idProva ? "PUT" : "POST";
    const url = idProva ? `http://localhost:5000/api/provas/${idProva}` : "http://localhost:5000/api/provas";

    fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosProva)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar prova.");
        window.location.href = "provas.html";
      })
      .catch(() => {
        mostrarErro("Erro ao salvar a prova.");
      });
  });

  // Remover prova
  btnExcluir.addEventListener("click", () => {
    if (!confirm("Deseja realmente excluir esta prova?")) return;

    fetch(`http://localhost:5000/api/provas/${idProva}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao excluir prova.");
        window.location.href = "provas.html";
      })
      .catch(() => {
        mostrarErro("Erro ao excluir a prova.");
      });
  });
});
