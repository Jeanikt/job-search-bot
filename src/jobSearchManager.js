const glassdoor = require('./jobSearchers/glassdoor');
const indeed = require('./jobSearchers/indeed');
const linkedin = require('./jobSearchers/linkedin');
const nerdin = require('./jobSearchers/nerdin');

const jobSearchers = {
  glassdoor,
  indeed,
  linkedin,
  nerdin
};

const emailSender = require('./emailSender');
const jobCache = require('./jobCache');
const { filterJobs } = require('./jobFilter');
const { retry } = require('./utils/retry');

async function runJobSearch(filters = {}, maxJobs = Infinity) {
  console.log('Iniciando busca de vagas...');
  console.log('Filtros aplicados:', filters);

  filters.location = filters.location || 'Brasil';

  try {
    const allJobs = await searchAllJobs(filters);
    console.log(`Total de vagas encontradas: ${allJobs.length}`);

    const filteredJobs = filterJobs(allJobs, filters);
    console.log(`Vagas após aplicação de filtros: ${filteredJobs.length}`);

    const newJobs = await processNewJobs(filteredJobs, maxJobs);
    console.log(`Novas vagas encontradas: ${newJobs.length}`);

    await handleEmailSending(newJobs);
    await jobCache.cleanOldJobs(30);

    return filteredJobs.slice(0, maxJobs);
  } catch (error) {
    console.error('Erro durante a busca de vagas:', error);
    throw error;
  }
}

async function searchAllJobs(filters) {
  const jobResults = await Promise.allSettled(
    Object.entries(jobSearchers).map(([name, searcher]) =>
      retry(() => searcher.searchJobs(filters), { retryCount: 2, retryDelay: 30000 })
        .then(jobs => {
          console.log(`Encontradas ${jobs.length} vagas no ${name}`);
          return jobs;
        })
        .catch(error => {
          console.error(`Erro ao buscar vagas no ${name}:`, error);
          return [];
        })
    )
  );

  return jobResults.flatMap(result => result.status === 'fulfilled' ? result.value : []);
}

async function processNewJobs(jobs, maxJobs) {
  const newJobs = [];
  for (const job of jobs) {
    if (await jobCache.isJobNew(job.id)) {
      newJobs.push(job);
      await jobCache.markJobAsSeen(job.id);
      if (newJobs.length >= maxJobs) break;
    }
  }
  return newJobs;
}

async function handleEmailSending(newJobs) {
  if (newJobs.length > 0) {
    await emailSender.sendJobsEmail(newJobs);
    console.log(`E-mail enviado com ${newJobs.length} novas vagas.`);
  } else {
    console.log('Nenhuma nova vaga encontrada. E-mail não enviado.');
  }
}

module.exports = { runJobSearch };