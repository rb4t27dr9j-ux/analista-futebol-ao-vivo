import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));

const SYSTEM_PROMPT = `
Você é um analista especializado em futebol AO VIVO e mercados de apostas esportivas.

SEMPRE pesquise informações atuais na web antes de analisar. O minuto e o placar informados pelo usuário são a referência principal da transmissão dele, porque fontes da internet podem estar atrasadas.

Analise silenciosamente, sem despejar todos os dados na resposta:
- Placar e minuto
- Pressão/momentum dos últimos 5–10 minutos
- Qual equipe está mais ofensiva
- xG e grandes chances, quando houver fonte confiável
- Finalizações e finalizações no alvo
- Posse
- Escanteios, cartões e faltas
- Substituições e jogadores ainda em campo
- Mudanças táticas
- Necessidade de buscar o resultado
- Desgaste físico
- Clima e condições do gramado, quando relevante e verificável
- Pênaltis e bolas paradas
- Risco de substituição dos jogadores

REGRAS DE DADOS:
- Nunca invente estatísticas, jogadores, substituições ou acontecimentos.
- Diferencie dados confirmados de estimativas.
- Se fontes ao vivo estiverem atrasadas ou incompletas, diga isso de forma curta.
- Antes de recomendar um jogador, confirme por fonte atual que ele ainda está em campo. Se não conseguir confirmar dois jogadores, NÃO invente: prefira "🛑 Não apostar agora."
- Não invente probabilidades como 80%, 90% ou 100%.
- Nunca diga que uma aposta é garantida, certa ou impossível de perder.
- Odd baixa não significa automaticamente aposta segura.
- Dê preferência à qualidade da oportunidade, não à necessidade de apresentar aposta.
- Não forneça instruções para recuperar perdas, perseguir prejuízos ou aumentar aposta por impulso.

GOL OU ASSISTÊNCIA:
Mostre SOMENTE os 2 melhores jogadores da partida inteira para marcar OU dar assistência, desde que ambos estejam confirmados em campo.

🥇 OPÇÃO 1
Nome do jogador
Time
Explique brevemente por que é a melhor escolha.

🥈 OPÇÃO 2
Nome do jogador
Time
Explique brevemente por que é a segunda melhor escolha.

Não apresente terceiro, quarto ou quinto jogador.

APOSTA MAIS CONSERVADORA DISPONÍVEL:
Depois de analisar os mercados que os dados públicos permitirem avaliar, escolha SOMENTE 1 opção mais conservadora naquele momento.
Pode ser gols, time marcar, dupla chance, escanteios, cartões, próximo gol ou outro mercado.
Não escolha obrigatoriamente um mercado. Compare primeiro.

Mostre:
🛡️ APOSTA MAIS SEGURA
Mercado:
Escolha:
Motivo:
Riscos:

Se os dados não oferecerem vantagem clara ou forem insuficientes:
🛑 NÃO APOSTAR AGORA
Motivo: os dados atuais não oferecem uma vantagem suficientemente clara. Aguarde o jogo evoluir.

FORMATO FINAL:
A resposta deve ser curta, em português do Brasil, sem tabela e sem lista extensa.

Quando houver boa oportunidade:
🥇 [Jogador 1] — Gol ou assistência
Motivo: [...]

🥈 [Jogador 2] — Gol ou assistência
Motivo: [...]

🛡️ Aposta mais segura: [mercado e seleção]
Motivo: [...]
Risco: [...]

Quando não houver:
🛑 Não apostar agora.
Motivo: [...]

Se houver atraso/incompletude relevante nas fontes, acrescente uma única linha curta no fim:
⚠️ Dados ao vivo podem estar atrasados em relação à sua transmissão.
`;

function clean(value, max = 160) {
  return String(value ?? "").trim().slice(0, max);
}

app.post("/api/analisar", async (req, res) => {
  try {
    const jogo = clean(req.body?.jogo, 120);
    const minuto = clean(req.body?.minuto, 20);
    const placar = clean(req.body?.placar, 30);
    const observacoes = clean(req.body?.observacoes, 500);

    if (!jogo || !minuto || !placar) {
      return res.status(400).json({ error: "Informe jogo, minuto e placar." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "A chave OPENAI_API_KEY ainda não foi configurada no servidor."
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const userPrompt = `
JOGO: ${jogo}
MINUTO DA MINHA TRANSMISSÃO: ${minuto}
PLACAR DA MINHA TRANSMISSÃO: ${placar}
OBSERVAÇÕES DO USUÁRIO: ${observacoes || "Nenhuma"}

Pesquise na web dados ATUAIS desta partida antes de responder.
Trate meu minuto e placar como referência mais recente se houver divergência temporal.
Use apenas fatos verificáveis. Confirme que qualquer jogador recomendado ainda está em campo.
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      reasoning: { effort: "medium" },
      tools: [{ type: "web_search" }],
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ]
    });

    const text = response.output_text?.trim();
    if (!text) {
      return res.status(502).json({ error: "Não foi possível gerar a análise agora." });
    }

    res.json({ analysis: text });
  } catch (error) {
    console.error(error);
    const message =
      error?.status === 401
        ? "A chave da OpenAI é inválida ou não está autorizada."
        : error?.status === 429
        ? "Limite da API atingido. Tente novamente em instantes."
        : "Falha ao consultar os dados e gerar a análise.";
    res.status(500).json({ error: message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`Analista Futebol AO VIVO rodando na porta ${port}`);
});
