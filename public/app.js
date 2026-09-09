const $ = (id) => document.getElementById(id);

const button = $("analisar");
const statusBox = $("status");
const resultBox = $("resultado");

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
  statusBox.style.background = isError ? "#3a1717" : "#162d20";
}

button.addEventListener("click", async () => {
  const payload = {
    jogo: $("jogo").value.trim(),
    minuto: $("minuto").value.trim(),
    placar: $("placar").value.trim(),
    observacoes: $("observacoes").value.trim()
  };

  if (!payload.jogo || !payload.minuto || !payload.placar) {
    showStatus("Preencha jogo, minuto e placar.", true);
    return;
  }

  button.disabled = true;
  button.textContent = "PESQUISANDO AO VIVO...";
  resultBox.classList.add("hidden");
  showStatus("Consultando fontes atuais e comparando os dados...");

  try {
    const response = await fetch("/api/analisar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao analisar a partida.");
    }

    statusBox.classList.add("hidden");
    resultBox.textContent = data.analysis;
    resultBox.classList.remove("hidden");
    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showStatus(error.message || "Não foi possível concluir a análise.", true);
  } finally {
    button.disabled = false;
    button.textContent = "ANALISAR AGORA";
  }
});
