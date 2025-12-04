Chatbot Easy - Assistente Virtual financeiro
Este projeto consiste em um chatbot para WhatsApp que se integra à API do ERP Omie para fornecer relatórios financeiros rápidos (contas a pagar e receber). O sistema é dividido em duas partes: uma API intermediária em Python (Flask) e o bot em Node.js (whatsapp-web.js).

📋 Pré-requisitos
Certifique-se de ter instalado em sua máquina:

Node.js (versão 18 ou superior recomendada)
Python (versão 3.8 ou superior)
NPM (Gerenciador de pacotes do Node)
PIP (Gerenciador de pacotes do Python)

🚀 Instalação e Configuração
1. Configurar o Backend (Python)
A API em Python serve para filtrar e processar os dados vindos do Omie.
Acesse a pasta onde está o arquivo omie_api.py.
Instale as dependências necessárias (Flask e Requests), para isso, abra o Windows Powwershell e execute o seguinte código:

'pip install flask requests'

2. Execute o servidor Python utliziando o seguinte código:

'python omie_api.py'

⚠️ É necessário que mantenha este terminal aberto.
⚠️A partir de agora vamos para outro terminal(Recomendamos o VS Code)

3. Configurar o Chatbot

Na pasta raiz do projeto (onde estão package.json e chatbot.js), instale as dependências usando esse comando:

'npm install'

4. Inicie o bot com algum desses comandos:

'node chatbot.js'
ou
'npm start'

Após isso, caso tenha sucesso, o terminal irá gerar um Qr Code.

📱 Como Usar
1. Abra o WhatsApp no seu celular, vá em Dispositivos Conectados > Conectar um aparelho e escaneie o código Qr do terminal do VS Code.

Após isso, o terminal deve informar que o WhatsApp está conectado!
A partir daqui o bot estará pronto para receber e enviar mensagens.

🤖 Comandos que o Bot pode receber para inciar: Oi, Olá, Menu, Ajuda ou Teste

Funcionalidades disponíveis:

📊 Relatório Mensal: Resumo de recebimentos e pagamentos (30, 60, 90 dias ou personalizado).

📈Detalhamento por Categoria: Filtra por Receitas, Custos ou Despesas em um período específico.


DETALHES

🛠️ Estrutura do Projeto
omie_api.py: API Flask que autentica com a Omie (App Key/Secret), busca os movimentos financeiros e aplica filtros de data/categoria.

chatbot.js: Lógica do bot. Gerencia o estado do usuário (menus), gera o QR Code e consulta o omie_api.py via HTTP.

package.json: Lista de dependências do Node.js (incluindo whatsapp-web.js, axios, qrcode-terminal).
