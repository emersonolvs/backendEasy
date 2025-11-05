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



client.on('message', async msg => {
    const now = new Date();
    const hour = now.getHours();

    const startHour = 8;
    const endHour = 22;

    if (hour < startHour || hour >= endHour) { 
        await client.sendMessage(msg.from, 'Olá! 👋 Nosso atendimento funciona das 08:00 às 22:00. No momento, estamos offline, mas retornaremos o contato assim que possível dentro desse horário. Obrigado pela compreensão!');
        await delay(3000);
        const chat = await msg.getChat(); 
        await chat.sendStateTyping();
        await delay(3000);
        return;
    }

    
    if (msg.body.match(/(menu|Menu|oi|Oi|Olá|olá|OI|OLÁ|Oii|Opa|O|Bom dia|Boa Tarde|Boa Noite|Preciso|dúvida|suporte|ajuda)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        await client.sendMessage(msg.from, 'Olá, ' + name.split(" ")[0] + '! 👋 Eu sou o assistente virtual do Kauhãn. Como posso te ajudar hoje? \n\nPor favor, digite o número da opção desejada:\n\n*1* - Consultar Saldo\n*2* - Verificar Status de Pedido\n*3* - Horário de Funcionamento\n*4* - Políticas da Empresa\n*5* - Outras Dúvidas');
    }

    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|ajuda|gostaria|hello)/i) && msg.from.endsWith('@c.us')) {

        const chat = await msg.getChat();

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        await client.sendMessage(msg.from, 'Olá, ' + name.split(" ")[0] + '! 👋 Eu sou o assistente virtual do Kauhãn. Como posso te ajudar hoje? \n\nPor favor, digite o número da opção desejada:\n\n*1* - Consultar Saldo\n*2* - Verificar Status de Pedido\n*3* - Horário de Funcionamento\n*4* - Políticas da Empresa\n*5* - Outras Dúvidas');
        await delay(3000);
        await chat.sendStateTyping();
        await delay(5000);


    }


    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Você selecionou: *1 - Consultar Saldo*.');

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Aqui estão os dados da sua consulta:');

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Link para os flamenguista chorarem: https://youtu.be/bVsRK1AbDaw?si=U3zpOuTsC1c2Oo5c');


    }

    if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Você selecionou: *2 - Verificar Status de Pedido*.');

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Aqui está o status mais recente do seu pedido: [Insira o status aqui]');
    }

    if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Você selecionou: *3 - Horário de Funcionamento*.');

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Nosso horário de atendimento é todos os dias, das *08:00* às *22:00*.');

    }

    if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Você selecionou: *4 - Políticas da Empresa*.');


        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, 'Aqui estão as políticas da empresa Easy: [Complete com o texto das políticas]');


    }

    if (msg.body !== null && msg.body === '5' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);


    }

});