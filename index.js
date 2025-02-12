require('dotenv').config();
const jobSearchManager = require('./src/jobSearchManager');

const SEARCH_INTERVAL = 3600000; // 1 hora em milissegundos

async function runContinuousJobSearch() {
  while (true) {
    try {
      console.log('Iniciando busca de vagas...');
      await jobSearchManager.runJobSearch();
      console.log(`Busca concluída. Aguardando ${SEARCH_INTERVAL / 60000} minutos para a próxima busca.`);
    } catch (error) {
      console.error('Erro durante a busca de vagas:', error);
    }
    await new Promise(resolve => setTimeout(resolve, SEARCH_INTERVAL));
  }
}

runContinuousJobSearch().catch(error => {
  console.error('Erro fatal no loop principal:', error);
  process.exit(1);
});

console.log('Bot de busca de vagas está rodando continuamente. Pressione Ctrl+C para sair.');