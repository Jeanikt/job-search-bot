const puppeteer = require('puppeteer');
const searchTerms = require('../searchTerms');
const { getRandomUserAgent } = require('../utils/userAgents');

const jobCache = new Map(); // Cache para evitar buscas repetidas

async function searchJobs() {
  const cacheKey = searchTerms.join(',');
  if (jobCache.has(cacheKey)) {
    console.log('Usando cache para os termos de busca.');
    return jobCache.get(cacheKey);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  try {
    const jobResults = await Promise.allSettled(
      searchTerms.map(term => fetchLinkedInJobs(browser, term))
    );

    const allJobs = jobResults.flatMap(result => (result.status === 'fulfilled' ? result.value : []));

    jobCache.set(cacheKey, allJobs);
    setTimeout(() => jobCache.delete(cacheKey), 30 * 60 * 1000); // Cache de 30 minutos

    return allJobs;
  } catch (error) {
    console.error('Erro ao buscar vagas no LinkedIn:', error);
    return [];
  } finally {
    await browser.close();
  }
}

async function fetchLinkedInJobs(browser, term) {
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());

  const encodedTerm = encodeURIComponent(term);
  await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${encodedTerm}&location=Brasil&f_WT=2`, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  await autoScroll(page);

  const jobListings = await page.$$('.jobs-search__results-list > li');
  const maxResults = 20;

  const jobs = [];

  for (const listing of jobListings.slice(0, maxResults)) {
    const titleElement = await listing.$('.base-search-card__title');
    const companyElement = await listing.$('.base-search-card__subtitle');
    const locationElement = await listing.$('.job-search-card__location');
    const urlElement = await listing.$('a.base-card__full-link');

    if (titleElement && companyElement && locationElement && urlElement) {
      const title = await titleElement.evaluate(el => el.textContent.trim());
      const company = await companyElement.evaluate(el => el.textContent.trim());
      const location = await locationElement.evaluate(el => el.textContent.trim());
      const url = await urlElement.evaluate(el => el.href);
      const id = `linkedin-${title}-${company}-${location}`.replace(/\s+/g, '-').toLowerCase();

      jobs.push({ id, title, company, location, url, source: 'LinkedIn' });
    }
  }

  await page.close();
  return jobs;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let lastHeight = document.body.scrollHeight;
      const timer = setInterval(() => {
        window.scrollBy(0, document.body.scrollHeight);
        if (document.body.scrollHeight > lastHeight) {
          lastHeight = document.body.scrollHeight;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
}

module.exports = { searchJobs };
