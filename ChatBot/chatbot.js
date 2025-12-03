const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('WhatsApp conectado!'));
client.initialize();

const userState = {};

async function consultarAPI(filtros) {
    try {
        const response = await axios.post(
            'http://127.0.0.1:5001/omie/filtrar',
            filtros,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function calcularResumo(movs, categoriaFiltro = null) {
    const resumo = {
        totalRecebido: 0,
        totalPago: 0
    };

    movs.forEach(m => {
        const d = m.detalhes;
        const valor = Number(d.nValorTitulo || 0);
        const cat = d.cCodCateg;
        const nat = d.cNatureza;

        if (categoriaFiltro && !cat.startsWith(categoriaFiltro)) return;

        if (nat === "R") resumo.totalRecebido += valor;
        if (nat === "P") resumo.totalPago += valor;
    });

    return resumo;
}

function formatarResumo(r) {
    return `📊 *Resumo Financeiro*\n\n` +
        `💰 Total Recebido: R$ ${r.totalRecebido.toFixed(2)}\n` +
        `💸 Total Pago: R$ ${r.totalPago.toFixed(2)}`;
}


client.on('message', async msg => {
    const user = msg.from;
    const body = msg.body.trim();

    // Inicialização
    if (!userState[user]) {
        if (/menu|oi|olá|ajuda|teste/i.test(body)) {
            userState[user] = { stage: 'menu' };
            return msg.reply(
                "Olá! 👋\nEscolha:\n1️⃣ - Relatório Mensal\n2️⃣ - Detalhamento por Categoria"
            );
        }
        return;
    }

    const S = userState[user];


    if (body === "0") {
        if (S.stage === "periodo" || S.stage === "categoria") {
            S.stage = "menu";
            return msg.reply("Voltando...\n\n1️⃣ Relatório Mensal\n2️⃣ Detalhamento por Categoria");
        }

        if (S.stage === "datas") {
            if (S.categoria) {
                S.stage = "categoria";
                return msg.reply("Voltando...\nEscolha a categoria:\n1️⃣ Receitas\n2️⃣ Custos\n3️⃣ Despesas");
            } else {
                S.stage = "periodo";
                return msg.reply(
                    "Voltando...\nEscolha o período:\n1️⃣ 30 dias\n2️⃣ 60 dias\n3️⃣ 90 dias\n4️⃣ Período personalizado"
                );
            }
        }
    }


    switch (S.stage) {

        case "menu":
            if (body === "1") {
                S.stage = "periodo";
                return msg.reply(
                    "Escolha:\n1️⃣ 30 dias\n2️⃣ 60 dias\n3️⃣ 90 dias\n4️⃣ Período personalizado\n\n0️⃣ Voltar"
                );
            }

            if (body === "2") {
                S.stage = "categoria";
                return msg.reply(
                    "Escolha a categoria:\n1️⃣ Receitas\n2️⃣ Custos\n3️⃣ Despesas\n\n0️⃣ Voltar"
                );
            }

            return msg.reply("Opção inválida. Digite 1 ou 2.");


        case "periodo":
            let inicio, fim = "2026-12-31";

            if (body === "1") inicio = "2025-11-01";
            else if (body === "2") inicio = "2025-10-01";
            else if (body === "3") inicio = "2025-09-01";
            else if (body === "4") {
                S.stage = "datas";
                return msg.reply("Digite no formato:\n\nYYYY-MM-DD até YYYY-MM-DD\n\n0️⃣ Voltar");
            } else {
                return msg.reply("Opção inválida.");
            }

            const dados = await consultarAPI({ data_inicio: inicio, data_fim: fim });

            if (!dados || !dados.movimentos.length)
                return msg.reply("Nenhum movimento encontrado.");

            msg.reply(formatarResumo(calcularResumo(dados.movimentos)));

            S.stage = "menu";
            break;


        case "categoria":
            const cats = { "1": "1.", "2": "2.", "3": "3" };

            if (!cats[body])
                return msg.reply("Escolha:\n1️⃣ Receitas\n2️⃣ Custos\n3️⃣ Despesas\n\n0️⃣ Voltar");

            S.categoria = cats[body];
            S.stage = "datas";
            return msg.reply("Digite o período:\n\nYYYY-MM-DD até YYYY-MM-DD\n\n0️⃣ Voltar");


        case "datas":
            const reg = /(\d{4}-\d{2}-\d{2})\s+até\s+(\d{4}-\d{2}-\d{2})/;
            const match = body.match(reg);

            if (!match)
                return msg.reply("Formato inválido.\nUse: YYYY-MM-DD até YYYY-MM-DD\n\n0️⃣ Voltar");

            const [_, di, df] = match;

            const filtrados = await consultarAPI({
                categoria: S.categoria || null,
                data_inicio: di,
                data_fim: df
            });

            if (!filtrados || !filtrados.movimentos.length)
                return msg.reply("Nenhum movimento encontrado.");

            msg.reply(formatarResumo(calcularResumo(filtrados.movimentos, S.categoria)));

            S.stage = "menu";
            break;
    }
});
