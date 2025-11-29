const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

const OMIE_APP_KEY = '6887695778964'; 
const OMIE_APP_SECRET = '9aa89482d2cc134634cbbd4f45c2cf3a';

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));
const userState = {};

async function consultarDadosFinanceiros() {
    try {
        const body = {
            call: "ListarMovimentos",
            app_key: OMIE_APP_KEY,
            app_secret: OMIE_APP_SECRET,
            param: [{
                nPagina: 1,
                nRegPorPagina: 500 
            }]
        };

        const response = await axios.post('https://app.omie.com.br/api/v1/financas/mf/', body);
        
        if (!response.data || !response.data.movimentos) {
            return null;
        }

        const movimentos = response.data.movimentos;
        
        let resumo = {
            totalRecebido: 0,
            totalPago: 0,
            receitasOperacionais: 0, // 1.0
            custosVariaveis: 0,      // 2.1
            despesasFixas: 0,        // 3.0 + 3.1 + 3.2
            resultadoOperacional: 0
        };

        const hoje = new Date();
        const dataInicio = new Date();
        
        dataInicio.setMonth(hoje.getMonth() - 1);
        
        hoje.setHours(23, 59, 59, 999);
        dataInicio.setHours(0, 0, 0, 0);

        movimentos.forEach(mov => {
            const valor = mov.nValorTitulo;
            const categoria = (mov.detalhes.cCodCateg || "").trim(); 
            const status = mov.detalhes.cStatus;
            
            const dataMovimentoString = mov.detalhes.dDtPagamento || mov.detalhes.dDtPrevisao;
            
            if (!dataMovimentoString) return; 

            const partesData = dataMovimentoString.split('/');
            const dataMovimento = new Date(partesData[2], partesData[1] - 1, partesData[0]); 

            const realizado = status === 'RECEBIDO' || status === 'PAGO';
            const naJanela = dataMovimento >= dataInicio && dataMovimento <= hoje;

            if (realizado && naJanela) {
                
                if (mov.detalhes.cNatureza === 'R') {
                    resumo.totalRecebido += valor;

                    if (categoria.startsWith('1.0')) {
                        resumo.receitasOperacionais += valor;
                    }
                }
                
                if (mov.detalhes.cNatureza === 'P') {
                    resumo.totalPago += valor;

                    if (categoria.startsWith('2.1')) {
                        resumo.custosVariaveis += valor;
                    }

                    if (categoria.startsWith('3.0') || categoria.startsWith('3.1') || categoria.startsWith('3.2')) {
                        resumo.despesasFixas += valor;
                    }
                }
            }
        });

        resumo.resultadoOperacional = resumo.receitasOperacionais - resumo.custosVariaveis - resumo.despesasFixas;

        return resumo;

    } catch (error) {
        console.error("Erro na API Omie:", error?.response?.data || error.message);
        return null;
    }
}

client.on('message', async msg => {
    const chat = await msg.getChat();
    const user = msg.from; 

    if (msg.body.match(/(menu|Menu|oi|Oi|Olá|olá|ajuda|teste)/i) && msg.from.endsWith('@c.us')) {
        delete userState[user]; 
        await delay(1000);
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        await client.sendMessage(user, `Olá, ${name}! 👋 Sou a IZI, assistente virtual da EASY. Como posso te ajudar? Envie o número de acordo com o que você procura no momento: \n\n1️⃣ - Relatório Mensal\n2️⃣ - Detalhamento Financeiro\n3️⃣ - Horário\n4️⃣ - Suporte`);
        return; 
    }

    const currentState = userState[user];

    if (!currentState) {
        if (msg.body === '1') {
            userState[user] = 'menu_financeiro';
            await client.sendMessage(user, 'Calculando relatório mensal... ⏳');
            
            const dados = await consultarDadosFinanceiros();

            if (dados) {
                userState[user + '_dados'] = dados;

                const texto = `📊 *Relatório Financeiro Mensal (Últimos 30 dias)*\n\n` +
                              `💰 *Total Recebido:* R$ ${dados.totalRecebido.toFixed(2)}\n` +
                              `💸 *Total Pago:* R$ ${dados.totalPago.toFixed(2)}\n\n` +
                              `------------------------------\n` +
                              `📈 *Detalhamento Operacional:*\n` +
                              `🔹 Receitas Operacionais: R$ ${dados.receitasOperacionais.toFixed(2)}\n` +
                              `🔸 Custos Variáveis: R$ ${dados.custosVariaveis.toFixed(2)}\n` +
                              `🏢 Despesas Fixas: R$ ${dados.despesasFixas.toFixed(2)}\n` +
                              `------------------------------\n` +
                              `🏁 *Resultado Operacional: R$ ${dados.resultadoOperacional.toFixed(2)}*\n\n` +
                              `*3* - Voltar`;
                
                await client.sendMessage(user, texto);
            } else {
                await client.sendMessage(user, 'Erro ao buscar dados. Tente mais tarde.');
                delete userState[user];
            }

        } else if (msg.body === '2') {
             userState[user] = 'menu_detalhamento';
             
             if (!userState[user + '_dados']) {
                 await client.sendMessage(user, 'Buscando dados para detalhamento... ⏳');
                 const dados = await consultarDadosFinanceiros();
                 if (dados) {
                     userState[user + '_dados'] = dados;
                 } else {
                     await client.sendMessage(user, 'Erro ao buscar dados. Tente mais tarde.');
                     delete userState[user];
                     return;
                 }
             }
             
             await client.sendMessage(user, `🔎 *Detalhamento Financeiro*\n\n*1* - Custos Variáveis\n*2* - Receitas Operacionais\n*3* - Despesas Fixas\n*4* - Voltar ao menu principal`);

        } else if (msg.body === '3') {
             await client.sendMessage(user, 'Atendimento das 08:00 às 22:00.');
        } else if (msg.body === '4') {
             await client.sendMessage(user, 'Fale com o suporte: https://wa.me/5579981310201');
        }

    } else if (currentState === 'menu_financeiro') {
        if (msg.body === '3') {
            delete userState[user];
            const contact = await msg.getContact();
            const name = contact.pushname || 'amigo';
            await client.sendMessage(user, `Olá, ${name}! Como posso te ajudar agora? Envie o número de acordo com o que você procura no momento: \n\n1️⃣ - Relatório Mensal\n2️⃣ - Detalhamento Financeiro\n3️⃣ - Horário\n4️⃣ - Suporte`);
        } else {
            await client.sendMessage(user, 'Opção inválida. Digite *3* para voltar.');
        }

    } else if (currentState === 'menu_detalhamento') {
        const dados = userState[user + '_dados'];

        if (msg.body === '1') {
            await client.sendMessage(user, `📉 *Custos Variáveis*\nValor Total: R$ ${dados.custosVariaveis.toFixed(2)}`);
            await client.sendMessage(user, 'Escolha outra opção de detalhamento ou digite *4* para voltar.');

        } else if (msg.body === '2') {
            await client.sendMessage(user, `📈 *Receitas Operacionais*\nValor Total: R$ ${dados.receitasOperacionais.toFixed(2)}`);
            await client.sendMessage(user, 'Escolha outra opção de detalhamento ou digite *4* para voltar.');

        } else if (msg.body === '3') {
            await client.sendMessage(user, `🏢 *Despesas Fixas*\nValor Total: R$ ${dados.despesasFixas.toFixed(2)}`);
            await client.sendMessage(user, 'Escolha outra opção de detalhamento ou digite *4* para voltar.');

        } else if (msg.body === '4') {
            delete userState[user];
            const contact = await msg.getContact();
            const name = contact.pushname || 'amigo';
            await client.sendMessage(user, `Olá, ${name}! Como posso te ajudar agora? Envie o número de acordo com o que você procura no momento: \n\n1️⃣ - Relatório Mensal\n2️⃣ - Detalhamento Financeiro\n3️⃣ - Horário\n4️⃣ - Suporte`);
        } else {
             await client.sendMessage(user, 'Opção inválida. Escolha de 1 a 3 para detalhes ou 4 para voltar.');
        }
    }
});