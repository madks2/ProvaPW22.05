# ProvaPW22.05 – Sistema de Cadastro de Voluntários

## Descrição
Aplicação web front-end para gerenciar voluntários com:

- **Login/Cadastro** de usuário;
- **Preenchimento automático** de endereço via CEP (ViaCEP);
- **Dashboard protegido** com menu lateral;
- **Cadastro** e **listagem de voluntários** (localStorage);
- **Filtragem**, **exclusão individual** e **limpeza em massa** da lista;
- **Exibição do clima atual** (OpenWeatherMap);
- **Timeout de sessão** por inatividade (5 minutos).

## Estrutura de Pastas
/projeto-voluntarios/
├── index.html # Página de login
├── cadastro.html # Formulário de cadastro
├── dashboard.html # Painel do usuário logado
├── style.css # CSS unificado
└── script.js # JS unificado

## Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)  
- Conexão com Internet (APIs ViaCEP e OpenWeatherMap)

## Instalação / Execução
1. Clone ou faça download deste repositório.  
2. No diretório raiz, verifique os arquivos listados acima.  
3. Abra **index.html** no navegador para iniciar.

## Configuração da API de Clima
1. Cadastre-se em [OpenWeatherMap](https://home.openweathermap.org/users/sign_up) para obter sua **API Key**.  
2. No arquivo `script.js`, substitua:
   ```js
   const WEATHER_API_KEY = 'afc4fd73ddcbe3a695f61185fe9e483b';