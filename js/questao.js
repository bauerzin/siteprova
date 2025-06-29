document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id"); // se existe, estamos editando

  const tituloPagina = document.getElementById("tituloPagina");
  const form = document.getElementById("formQuestao");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnExcluir = document.getElementById("btnExcluir");
  const mensagemErro = document.getElementById("mensagemErro");

  const campoTitulo = document.getElementById("titulo");
  const campoDisciplina = document.getElementById("disciplina");
  const campoAssuntos = document.getElementById("assuntos");
  const divAlternativas = document.getElementById("alternativas");

  // Inicializa alternativas vazias com a primeira correta por padrão
  let alternativas = Array(5).fill(null).map((_, i) => ({
    Descricao: "",
    Correta: i === 0
  }));

  // Função para renderizar inputs das alternativas no DOM
  function renderizarAlternativas() {
    divAlternativas.innerHTML = "";
    alternativas.forEach((alt, i) => {
      const div = document.createElement("div");
      div.className = "alternativa";
      div.innerHTML = `
        <input type="radio" name="correta" value="${i}" ${alt.correta ? "checked" : ""} required />
        <input type="text" class="campo-alternativa" placeholder="Descrição da alternativa ${i + 1}" value="${alt.descricao}" required />
      `;
      divAlternativas.appendChild(div);
    });
  }

  renderizarAlternativas();

  // Se estiver editando, buscar dados via API e preencher os campos
  if (id) {
    tituloPagina.textContent = "Editar Questão";
    btnSalvar.textContent = "Atualizar";
    btnExcluir.hidden = false;

    fetch(`http://localhost:5000/api/questoes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar questão.");
        return res.json();
      })
      .then(dados => {
        campoTitulo.value = dados.titulo;
        campoDisciplina.value = dados.disciplina;
        campoAssuntos.value = dados.assuntos.join(", ");
        alternativas = dados.Alternativas || dados.alternativas || [];
        renderizarAlternativas();
      })
      .catch(() => {
        mensagemErro.hidden = false;
        mensagemErro.textContent = "Não foi possível carregar a questão.";
      });
  }

  // Tratamento do submit (inserir ou atualizar)
  form.addEventListener("submit", event => {
    event.preventDefault();

    const novaQuestao = {
      Titulo: campoTitulo.value.trim(),
      Disciplina: campoDisciplina.value.trim(),
      Assuntos: campoAssuntos.value.split(",").map(a => a.trim()),
      Alternativas: []
    };

    const camposTexto = document.querySelectorAll(".campo-alternativa");
    const radios = document.querySelectorAll("input[name='correta']");

    camposTexto.forEach((input, i) => {
      novaQuestao.Alternativas.push({
        Descricao: input.value.trim(),
        Correta: radios[i].checked
      });
    });

    // Validação: somente 1 correta
    const qtdCorretas = novaQuestao.Alternativas.filter(a => a.Correta).length;
    if (qtdCorretas !== 1) {
      mensagemErro.hidden = false;
      mensagemErro.textContent = "Apenas uma alternativa deve ser marcada como correta.";
      return;
    }

    mensagemErro.hidden = true;

    // Define verbo e URL conforme modo
    const metodo = id ? "PUT" : "POST";
    console.log("metodo");
    const url = id ? `http://localhost:5000/api/questoes/${id}` : "http://localhost:5000/api/questoes";
    fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaQuestao)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar questão.");
        console.log("salvei");
        // Voltar para lista após salvar
        window.location.href = "questoes.html";
      })
      .catch((e) => {
        console.log("henrique" + e);
        mensagemErro.hidden = false;
        mensagemErro.textContent = "Erro ao salvar a questão.";
      });
  });

  // Remover questão
  btnExcluir.addEventListener("click", () => {
    if (!confirm("Deseja realmente excluir esta questão?")) return;

    fetch(`http://localhost:5000/api/questoes/${id}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao excluir questão.");
        window.location.href = "questoes.html";
      })
      .catch(() => {
        mensagemErro.hidden = false;
        mensagemErro.textContent = "Erro ao excluir a questão.";
      });
  });
});
