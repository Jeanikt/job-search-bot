const puppeteer = require('puppeteer');
const searchTerms = require('../searchTerms');
const { getRandomUserAgent } = require('../utils/userAgents');

async function searchJobs() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());
  let allJobs = [];

  try {
    for (const term of searchTerms) {
      console.log(`Buscando no LinkedIn por: ${term}`);
      const encodedTerm = encodeURIComponent(term);
      await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${encodedTerm}&location=Brasil&f_WT=2`, { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      await page.waitForSelector('.jobs-search__results-list', { timeout: 60000 });
      
      // Scroll para carregar mais resultados
      await autoScroll(page);

      const jobListings = await page.$$('.jobs-search__results-list > li');

      for (const listing of jobListings) {
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

          allJobs.push({ id, title, company, location, url, source: 'LinkedIn' });
        }
      }

      await randomDelay();
    }
  } catch (error) {
    console.error('Erro ao buscar vagas no LinkedIn:', error);
  } finally {
    await browser.close();
  }

  return allJobs;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

function randomDelay(min = 3000, max = 7000) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));
}

module.exports = { searchJobs };