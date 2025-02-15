const indeed = require('./jobSearchers/indeed');
const linkedin = require('./jobSearchers/linkedin');
const nerdin = require('./jobSearchers/nerdin');
const glassdoor = require('./jobSearchers/glassdoor');
const emailSender = require('./emailSender');
const jobCache = require('./jobCache');
const { filterJobs } = require('./jobFilter');
const { retry } = require('./utils/retry');

async function runJobSearch(filters = {}) {
  try {
    console.log('Iniciando busca de vagas...');
    console.log('Filtros aplicados:', filters);

    const [indeedJobs, linkedinJobs, nerdinJobs, glassdoorJobs] = await Promise.all([
      retry(() => indeed.searchJobs()),
      retry(() => linkedin.searchJobs()),
      retry(() => nerdin.searchJobs()),
      retry(() => glassdoor.searchJobs())
    ]);

    console.log(`Encontradas ${indeedJobs.length} vagas no Indeed`);
    console.log(`Encontradas ${linkedinJobs.length} vagas no LinkedIn`);
    console.log(`Encontradas ${nerdinJobs.length} vagas no Nerdin`);
    console.log(`Encontradas ${glassdoorJobs.length} vagas no Glassdoor`);

    const allJobs = [...indeedJobs, ...linkedinJobs, ...nerdinJobs, ...glassdoorJobs];
    console.log(`Total de vagas encontradas: ${allJobs.length}`);

    let filteredJobs = filterJobs(allJobs, filters);
    console.log(`Vagas após aplicação de filtros: ${filteredJobs.length}`);

    const newJobs = [];

    for (const job of filteredJobs) {
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
      console.log('Nenhuma nova vaga encontrada. E-mail não enviado.');
    }

    // Limpa vagas antigas do cache (mantém últimos 30 dias)
    await jobCache.cleanOldJobs(30);

    return filteredJobs;
  } catch (error) {
    console.error('Erro durante a busca de vagas:', error);
    throw error;
  }
}

module.exports = { runJobSearch };