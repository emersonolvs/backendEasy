const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

const userState = {};

client.on('message', async msg => {
    const now = new Date();
    const hour = now.getHours();

    const startHour = 8;
    const endHour = 22;

    if (hour < startHour || hour >= endHour) {
        await client.sendMessage(msg.from, '👋 Nosso atendimento funciona das 08:00 às 22:00. No momento, estamos offline, mas retornaremos o contato assim que possível dentro desse horário. Obrigado pela compreensão!');
        await delay(3000);
        const chat = await msg.getChat();
        await chat.sendStateTyping();
        await delay(3000);
        return;
    }

    const chat = await msg.getChat();
    const user = msg.from; 

    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|ajuda|gostaria|hello)/i) && msg.from.endsWith('@c.us')) {
        
        delete userState[user]; 

        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        
        await client.sendMessage(user, 'Olá, ' + name.split(" ")[0] + '! 👋 Eu sou a IZI, assistente virtual da Empresa EASY. Como posso te ajudar hoje? \n\nPor favor, digite o número da opção do serviço desejado:\n\n*1* - Consultar relatórios, contas e informações financeiras\n*2* - Dúvidas frequentes\n*3* - Horário de atendimento\n*4* - Falar com suporte');
        
        await delay(3000);
        await chat.sendStateTyping();
        await delay(5000);
        return; 
    }

    const currentState = userState[user];

    if (!currentState) {

        if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
            userState[user] = 'menu_financeiro';

            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            
            await client.sendMessage(user, 'Certo! Você está na área *Financeira*.\n\nEscolha uma das opções abaixo:\n\n*1* - Relatório Completo\n*2* - Detalhamento Financeiro');

        } else if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Você selecionou: *2 - Dúvidas Frequentes*.');

            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Aqui está a nossa lista de dúvidas: [Insira as dúvidas aqui]');
            
        } else if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Você selecionou: *3 - Horário de atendimento*.');

            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Nosso horário de atendimento é todos os dias, das *08:00* às *22:00*.');

        } else if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Você selecionou: *4 - Falar com suporte*.\n\nPor favor, envie sua mensagem ou clique no link para falar com um atendente: https://api.whatsapp.com/send?phone=5579981310201&text=OI!Gostaria%20de%20Mais%20Informa%C3%A7%C3%B5es%20Sobre%20o%20M%C3%A9todo%20EASY!');
        
        } else {
            await delay(1000);
            await client.sendMessage(user, 'Desculpe, não entendi. Por favor, digite *Menu* para ver as opções novamente.');
        }

    } else if (currentState === 'menu_financeiro') {

        if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
            
            delete userState[user]; 
            
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Ok, gerando seu *Relatório Completo*...');

            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Aqui estão seus dados:\n\n- *Contas a Pagar:* [Valor]\n- *Contas Vencidas:* [Valor]\n  - (Vencidas nos últimos 7 dias: [Valor])\n- *Total Recebido:* [Valor]\n- *Total Pago:* [Valor]');
            
            await delay(2000);
            await client.sendMessage(user, 'Para uma nova consulta, digite *Menu*.');

        } else if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
            userState[user] = 'menu_detalhamento';
            
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Qual detalhamento financeiro você gostaria de ver?\n\n*1* - Custos Variáveis\n*2* - Receitas Operacionais\n*3* - Resultado Operacional\n*4* - Despesas Fixas');
        
        } else {
            await delay(1000);
            await client.sendMessage(user, 'Opção inválida. Por favor, escolha *1* ou *2*.\n\nPara sair, digite *Menu*.');
        }

    } else if (currentState === 'menu_detalhamento') {

        delete userState[user];

        if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Detalhes de *Custos Variáveis*: [Informação aqui]');
            
        } else if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Detalhes de *Receitas Operacionais*: [Informação aqui]');

        } else if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Detalhes de *Resultado Operacional*: [Informação aqui]');

        } else if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
            await delay(3000);
            await chat.sendStateTyping();
            await delay(3000);
            await client.sendMessage(user, 'Detalhes de *Despesas Fixas*: [Informação aqui]');
            
        } else {
            await delay(1000);
            await client.sendMessage(user, 'Opção inválida.');
        }

        await delay(2000);
        await client.sendMessage(user, 'Consulta finalizada. Para ver outras opções, digite *Menu*.');
    }
});