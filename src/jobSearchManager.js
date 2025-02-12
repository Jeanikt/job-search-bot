const indeed = require('./jobSearchers/indeed');
const linkedin = require('./jobSearchers/linkedin');
const nerdin = require('./jobSearchers/nerdin');
const emailSender = require('./emailSender');
const jobCache = require('./jobCache');

async function runJobSearch() {
  try {
    console.log('Iniciando busca de vagas...');
    
    const indeedJobs = await indeed.searchJobs();
    console.log(`Encontradas ${indeedJobs.length} vagas no Indeed`);
    
    const linkedinJobs = await linkedin.searchJobs();
    console.log(`Encontradas ${linkedinJobs.length} vagas no LinkedIn`);
    
    const nerdinJobs = await nerdin.searchJobs();
    console.log(`Encontradas ${nerdinJobs.length} vagas no Nerdin`);

    const allJobs = [...indeedJobs, ...linkedinJobs, ...nerdinJobs];
    console.log(`Total de vagas encontradas: ${allJobs.length}`);

    const newJobs = [];

    for (const job of allJobs) {
      if (await jobCache.isJobNew(job.id)) {
        newJobs.push(job);
        await jobCache.markJobAsSeen(job.id);
      }
    }

    console.log(`Novas vagas encontradas: ${newJobs.length}`);

    if (newJobs.length > 0) {
      await emailSender.sendJobsEmail(newJobs);
      console.log(`E-mail enviado com ${newJobs.length} novas vagas.`);
    } else {
      console.log('Nenhuma nova vaga encontrada.');
    }

    // Limpa vagas antigas do cache (mantém últimos 30 dias)
    await jobCache.cleanOldJobs(30);
  } catch (error) {
    console.error('Erro durante a busca de vagas:', error);
  }
}

module.exports = { runJobSearch };