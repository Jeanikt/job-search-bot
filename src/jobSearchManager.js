const indeed = require('./jobSearchers/indeed');
const linkedin = require('./jobSearchers/linkedin');
const nerdin = require('./jobSearchers/nerdin');
const glassdoor = require('./jobSearchers/glassdoor');
const emailSender = require('./emailSender');
const jobCache = require('./jobCache');
const { filterJobs } = require('./jobFilter');
const { retry } = require('./utils/retry');

async function runJobSearch(filters = {}, maxJobs = Infinity) {
  try {
    console.log('Iniciando busca de vagas...');
    console.log('Filtros aplicados:', filters);

    if (!filters.location) {
      filters.location = 'Brasil';
    }

    const jobSearchers = [
      { name: 'Indeed', searcher: indeed },
      { name: 'LinkedIn', searcher: linkedin },
      { name: 'Nerdin', searcher: nerdin },
      { name: 'Glassdoor', searcher: glassdoor }
    ];

    // Busca paralela para otimizar o tempo de resposta
    const jobResults = await Promise.allSettled(
      jobSearchers.map(({ name, searcher }) =>
        retry(() => searcher.searchJobs(filters)).catch(error => {
          console.error(`Erro ao buscar vagas no ${name}:`, error);
          return [];
        })
      )
    );

    const allJobs = jobResults.flatMap((result, index) => {
      const jobs = result.status === 'fulfilled' ? result.value : [];
      console.log(`Encontradas ${jobs.length} vagas no ${jobSearchers[index].name}`);
      return jobs;
    });

    console.log(`Total de vagas encontradas: ${allJobs.length}`);

    let filteredJobs = filterJobs(allJobs, filters);
    console.log(`Vagas após aplicação de filtros: ${filteredJobs.length}`);

    const newJobs = [];

    for (const job of filteredJobs) {
      if (await jobCache.isJobNew(job.id)) {
        newJobs.push(job);
        await jobCache.markJobAsSeen(job.id);
        if (newJobs.length >= maxJobs) break;
      }
    }

    console.log(`Novas vagas encontradas: ${newJobs.length}`);

    if (newJobs.length > 0) {
      await emailSender.sendJobsEmail(newJobs);
      console.log(`E-mail enviado com ${newJobs.length} novas vagas.`);
    } else {
      console.log('Nenhuma nova vaga encontrada. E-mail não enviado.');
    }

    await jobCache.cleanOldJobs(30);

    return filteredJobs.slice(0, maxJobs);
  } catch (error) {
    console.error('Erro durante a busca de vagas:', error);
    throw error;
  }
}

module.exports = { runJobSearch };
