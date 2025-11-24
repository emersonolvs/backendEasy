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
                nRegPorPagina: 500,
                apenas_titulos_em_aberto: "N"
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
            custosVariaveis: 0,
            receitasOperacionais: 0,
            contasPagar: 0,
            contasVencidas: 0
        };

        const hoje = new Date();

        movimentos.forEach(mov => {
            const valor = mov.nValorTitulo;
            const categoria = mov.detalhes.cCodCateg || "";
            const status = mov.detalhes.cStatus;

            if (status === 'RECEBIDO' || status === 'PAGO') {
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
                }
            }

            if (mov.detalhes.cNatureza === 'P' && status !== 'PAGO' && status !== 'CANCELADO') {
                resumo.contasPagar += valor;
                const dataVencimento = new Date(mov.detalhes.dDtVenc.split('/').reverse().join('-'));
                if (dataVencimento < hoje) {
                    resumo.contasVencidas += valor;
                }
            }
        });

        return resumo;

    } catch (error) {
        console.error("Erro na API Omie:", error);
        return null;
    }
}

client.on('message', async msg => {
    const chat = await msg.getChat();
    const user = msg.from; 

    if (msg.body.match(/(teste)/i) && msg.from.endsWith('@c.us')) {
        delete userState[user]; 
        await delay(1000);
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo';
        await client.sendMessage(user, `Olá, ${name}! 👋 Sou a IZI assistente virtual da EASY. Como posso te ajudar hoje? Envie o número de acordo com a opção desejada.\n\n1️⃣ - Relatórios Financeiros\n2️⃣ - Dúvidas\n3️⃣ - Horário de Funcionamento\n4️⃣ - Suporte`);
        return; 
    }

    const currentState = userState[user];

    if (!currentState) {
        if (msg.body === '1') {
            userState[user] = 'menu_financeiro';
            await client.sendMessage(user, 'Consultando suas informações... ⏳');
            
            const dados = await consultarDadosFinanceiros();

            if (dados) {
                userState[user + '_dados'] = dados;

                const texto = `📊 *Relatório Financeiro Atualizado*\n\n` +
                              `💰 *Total Recebido:* R$ ${dados.totalRecebido.toFixed(2)}\n` +
                              `VX *Total Pago:* R$ ${dados.totalPago.toFixed(2)}\n` +
                              `⚠️ *A Pagar (Aberto):* R$ ${dados.contasPagar.toFixed(2)}\n` +
                              `rf *Vencidas:* R$ ${dados.contasVencidas.toFixed(2)}\n\n` +
                              `*1* - Relatório Completo (Ver acima)\n*2* - Detalhamento (Custos/Receitas)\n*3* - Voltar`;
                
                await client.sendMessage(user, texto);
            } else {
                await client.sendMessage(user, 'Erro ao conectar com o sistema financeiro. Tente mais tarde ou entre em contato diretamente com EASY.');
                delete userState[user];
            }

        } else if (msg.body === '2') {
             await client.sendMessage(user, 'Lista de dúvidas...');
        } else if (msg.body === '3') {
             await client.sendMessage(user, 'Atendimento das 08:00 às 22:00.');
        } else if (msg.body === '4') {
             await client.sendMessage(user, 'Link suporte...');
        }

    } else if (currentState === 'menu_financeiro') {
        const dados = userState[user + '_dados']; 

        if (msg.body === '1') {
            await client.sendMessage(user, 'Os dados completos já estão na mensagem anterior! 👆');
        
        } else if (msg.body === '2') {
            userState[user] = 'menu_detalhamento';
            await client.sendMessage(user, `🔎 *Detalhamento por Categoria*\n\n*1* - Custos Variáveis (Cód 2.1)\n*2* - Receitas Operacionais (Cód 1.0)\n*3* - Voltar`);
        
        } else if (msg.body === '3') {
            delete userState[user];
            await client.sendMessage(user, 'Voltando ao início...');
        }

    } else if (currentState === 'menu_detalhamento') {
        const dados = userState[user + '_dados'];

        if (msg.body === '1') {
            await client.sendMessage(user, `📉 *Custos Variáveis (2.1)*\nValor Total: R$ ${dados.custosVariaveis.toFixed(2)}`);
            delete userState[user];
            await client.sendMessage(user, 'Consulta finalizada. Digite *Menu* para voltar.');

        } else if (msg.body === '2') {
            await client.sendMessage(user, `📈 *Receitas Operacionais (1.0)*\nValor Total: R$ ${dados.receitasOperacionais.toFixed(2)}`);
            delete userState[user];
            await client.sendMessage(user, 'Consulta finalizada. Digite *Menu* para voltar.');

        } else if (msg.body === '3') {
            userState[user] = 'menu_financeiro';
            await client.sendMessage(user, 'Voltando para menu financeiro...');
        }
    }
});