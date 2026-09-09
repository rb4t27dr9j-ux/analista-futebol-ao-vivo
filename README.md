# Analista Futebol AO VIVO

Site para celular que recebe **jogo + minuto + placar da sua transmissão** e usa a OpenAI com pesquisa na web para produzir uma resposta curta:

- 🥇 melhor jogador para gol ou assistência
- 🥈 segundo melhor jogador
- 🛡️ uma única aposta mais conservadora
- ou 🛑 **Não apostar agora**

O minuto e o placar digitados pelo usuário têm prioridade quando fontes públicas estiverem atrasadas.

## Importante

O app **não inventa probabilidades** e foi instruído a não recomendar jogador sem confirmação atual de que ele segue em campo. Dados públicos de partidas ao vivo podem ser incompletos ou atrasados.

## Rodar no computador

1. Instale Node.js 20+.
2. Copie `.env.example` para `.env`.
3. Coloque sua chave da OpenAI em `OPENAI_API_KEY`.
4. Rode:

```bash
npm install
npm start
```

Abra `http://localhost:3000`.

## Publicar no Render

1. Envie estes arquivos ao seu repositório GitHub.
2. No Render, crie um **Web Service** a partir do repositório.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Em **Environment**, crie:
   - `OPENAI_API_KEY` = sua chave da OpenAI
   - `OPENAI_MODEL` = `gpt-5.6-luna`
6. Faça o deploy.

**Nunca coloque a chave da OpenAI em `public/app.js` ou em qualquer arquivo público.**

## Estrutura

```text
public/
  index.html
  styles.css
  app.js
server.js
package.json
render.yaml
.env.example
.gitignore
README.md
```
