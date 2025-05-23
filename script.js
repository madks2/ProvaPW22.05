const WEATHER_API_KEY = 'afc4fd73ddcbe3a695f61185fe9e483b';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const SESSION_TIMEOUT = 5 * 60 * 1000;
let inactivityTimer;

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");

  if (page === "index") {
    document.getElementById("loginForm").addEventListener("submit", login);
  } else if (page === "cadastro") {
    document.getElementById("cep").addEventListener("blur", preencherEndereco);
    document.getElementById("cadastroForm").addEventListener("submit", cadastrar);
  } else if (page === "dashboard") {
    carregarDashboard();
    document.getElementById("logoutBtn").addEventListener("click", logout);
    
    startInactivityTimer();
    
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keypress", resetInactivityTimer);
    document.addEventListener("click", resetInactivityTimer);
  }
});

function startInactivityTimer() {
  clearTimeout(inactivityTimer);
  
  inactivityTimer = setTimeout(() => {
    alert("Sua sessão expirou por inatividade.");
    logout();
  }, SESSION_TIMEOUT);
}

function resetInactivityTimer() {
  startInactivityTimer();
}

function login(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario && usuario.email === email && usuario.senha === senha) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    localStorage.setItem("lastActivity", new Date().getTime());
    window.location.href = "dashboard.html";
  } else {
    alert("Email ou senha inválidos.");
  }
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("lastActivity");
  window.location.href = "index.html";
}

function cadastrar(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;
  const cep = document.getElementById("cep").value.replace(/\D/g, "");
  const cidade = document.getElementById("cidade").value.trim();
  const estado = document.getElementById("estado").value.trim();

  if (emailJaCadastrado(email)) {
    alert("Este email já está cadastrado. Por favor, use outro email.");
    return;
  }

  if (!nome || !email || !senha || !cep || !cidade || !estado) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (cep.length !== 8) {
    alert("CEP inválido. Deve conter 8 dígitos.");
    return;
  }

  const usuario = { 
    nome, 
    email, 
    senha, 
    cep, 
    cidade, 
    estado,
    dataCadastro: new Date().toISOString()
  };

  let voluntarios = JSON.parse(localStorage.getItem("voluntarios")) || [];
  voluntarios.push(usuario);
  localStorage.setItem("voluntarios", JSON.stringify(voluntarios));
  
  localStorage.setItem("usuario", JSON.stringify(usuario));
  
  alert("Cadastro realizado com sucesso!");
  window.location.href = "index.html";
}

function emailJaCadastrado(email) {
  const voluntarios = JSON.parse(localStorage.getItem("voluntarios")) || [];
  return voluntarios.some(voluntario => 
    voluntario.email.toLowerCase() === email.toLowerCase()
  );
}

async function preencherEndereco() {
  const cep = document.getElementById("cep").value.replace(/\D/g, "");
  if (cep.length === 8) {
    try {
      document.getElementById("cep").disabled = true;
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        document.getElementById("rua").value = data.logradouro || '';
        document.getElementById("bairro").value = data.bairro    || '';
        document.getElementById("cidade").value = data.localidade || '';
        document.getElementById("estado").value = data.uf        || '';
      } else {
        alert("CEP não encontrado.");
        limparCamposEndereco();
      }
    } catch (error) {
      alert("Erro ao buscar o CEP.");
      limparCamposEndereco();
    } finally {
      document.getElementById("cep").disabled = false;
    }
  }
}

function limparCamposEndereco() {
  document.getElementById("cidade").value = "";
  document.getElementById("estado").value = "";
}

function carregarDashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    alert("Você precisa estar logado.");
    window.location.href = "index.html";
    return;
  }

  localStorage.setItem("lastActivity", new Date().getTime());
  
  document.getElementById("nomeUsuario").innerText = usuario.nome;
  buscarClima(usuario.cep);
  
  carregarVoluntarios();
}

function carregarVoluntarios() {
  const voluntarios = JSON.parse(localStorage.getItem("voluntarios")) || [];
  const listaVoluntarios = document.getElementById("listaVoluntarios");
  
  listaVoluntarios.innerHTML = voluntarios.map(voluntario => `
    <div class="voluntario-card">
      <h3>${voluntario.nome}</h3>
      <p>Email: ${voluntario.email}</p>
      <p>Localização: ${voluntario.cidade}/${voluntario.estado}</p>
      <p>CEP: ${voluntario.cep}</p>
      <button class="btn-excluir" data-email="${voluntario.email}">Excluir</button>
    </div>
  `).join('');

  document.querySelectorAll(".btn-excluir").forEach(btn => {
    btn.addEventListener("click", function() {
      const email = this.getAttribute("data-email");
      excluirVoluntario(email);
    });
  });
}

function excluirVoluntario(email) {
  if (confirm("Tem certeza que deseja excluir este voluntário?")) {
    let voluntarios = JSON.parse(localStorage.getItem("voluntarios")) || [];
    voluntarios = voluntarios.filter(v => v.email !== email);
    localStorage.setItem("voluntarios", JSON.stringify(voluntarios));
    carregarVoluntarios();
  }
}

async function buscarClima(cep) {
  try {
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const viaCepData = await viaCepResponse.json();

    if (!viaCepData.erro) {
      const cidade = viaCepData.localidade;

      const weatherResponse = await fetch(
        `${WEATHER_API_URL}?q=${cidade}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`
      );
      const weatherData = await weatherResponse.json();

      document.getElementById("clima").innerText =
        `Clima em ${cidade}: ${weatherData.weather[0].description}, ${Math.round(weatherData.main.temp)}°C`;
    } else {
      document.getElementById("clima").innerText = "CEP inválido.";
    }
  } catch (error) {
    document.getElementById("clima").innerText = "Erro ao buscar clima.";
  }
}
document.querySelectorAll('.menu a[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
  

      document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  
      const sectionId = link.getAttribute('data-section');
      link.parentElement.classList.add('active');
      document.getElementById(sectionId).classList.add('active');
    });
  });