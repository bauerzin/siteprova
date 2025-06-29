const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Dados em memória (exemplo simples)
let questoes = [
  {
    IdQuestao: 1,
    Titulo: 'Questão 1',
    Disciplina: 'Matemática',
    Assuntos: ['Álgebra'],
    Alternativas: [
      {Descricao: 'Alternativa A', Correta: false},
      {Descricao: 'Alternativa B', Correta: true},
      {Descricao: 'Alternativa C', Correta: false},
      {Descricao: 'Alternativa D', Correta: false},
      {Descricao: 'Alternativa E', Correta: false}
    ]
  }
];

let provas = [
  {
    IdProva: 1,
    Titulo: 'Prova 1',
    Disciplina: 'Matemática',
    Questoes: [questoes[0]]
  }
];

// === Rotas ===

// Listar todas as questões
app.get('/api/questoes', (req, res) => {
  res.json(questoes);
});

// Buscar questão por id
app.get('/api/questoes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const questao = questoes.find(q => q.IdQuestao === id);
  if (questao) {
    res.json(questao);
  } else {
    res.status(404).json({ error: 'Questão não encontrada' });
  }
});

// Inserir nova questão
app.post('/api/questoes', (req, res) => {
  const nova = req.body;
  nova.IdQuestao = questoes.length > 0 ? questoes[questoes.length -1].IdQuestao + 1 : 1;
  questoes.push(nova);
  res.status(201).json(nova);
});

// Atualizar questão
app.put('/api/questoes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = questoes.findIndex(q => q.IdQuestao === id);
  if (index >= 0) {
    questoes[index] = { IdQuestao: id, ...req.body };
    res.json(questoes[index]);
  } else {
    res.status(404).json({ error: 'Questão não encontrada' });
  }
});

// Remover questão
app.delete('/api/questoes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = questoes.findIndex(q => q.IdQuestao === id);
  if (index >= 0) {
    questoes.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Questão não encontrada' });
  }
});

// Listar provas
app.get('/api/provas', (req, res) => {
  res.json(provas.map(p => ({
    IdProva: p.IdProva,
    Titulo: p.Titulo,
    Disciplina: p.Disciplina,
    QuantidadeQuestoes: p.Questoes.length
  })));
});

// Buscar prova por id
app.get('/api/provas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const prova = provas.find(p => p.IdProva === id);
  if (prova) {
    res.json(prova);
  } else {
    res.status(404).json({ error: 'Prova não encontrada' });
  }
});

// Inserir prova
app.post('/api/provas', (req, res) => {
  const nova = req.body;
  nova.IdProva = provas.length > 0 ? provas[provas.length -1].IdProva + 1 : 1;
  // pegar as questões pelos IDs enviados
  nova.Questoes = questoes.filter(q => nova.IdsQuestoes.includes(q.IdQuestao));
  provas.push(nova);
  res.status(201).json(nova);
});

// Atualizar prova
app.put('/api/provas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = provas.findIndex(p => p.IdProva === id);
  if (index >= 0) {
    const atualizada = { IdProva: id, ...req.body };
    atualizada.Questoes = questoes.filter(q => atualizada.IdsQuestoes.includes(q.IdQuestao));
    provas[index] = atualizada;
    res.json(atualizada);
  } else {
    res.status(404).json({ error: 'Prova não encontrada' });
  }
});

// Remover prova
app.delete('/api/provas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = provas.findIndex(p => p.IdProva === id);
  if (index >= 0) {
    provas.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Prova não encontrada' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});

fetch('http://localhost:5000/api/questoes')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // aqui você processa os dados da API
  })
  .catch(error => console.error('Erro:', error));
