const puppeteer = require('puppeteer');
const searchTerms = require('../searchTerms');

async function searchJobs() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  let allJobs = [];

  try {
    for (const term of searchTerms) {
      console.log(`Buscando no Nerdin por: ${term}`);
      const encodedTerm = encodeURIComponent(term);
      await page.goto(`https://nerdin.com.br/vagas?q=${encodedTerm}&remote=true`, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForSelector('.job-list', { timeout: 30000 });
      const jobListings = await page.$$('.job-list .job-item');

      for (const listing of jobListings) {
        const titleElement = await listing.$('.job-title');
        const companyElement = await listing.$('.company-name');
        const locationElement = await listing.$('.job-location');
        const urlElement = await listing.$('a.job-link');

        if (titleElement && companyElement && locationElement && urlElement) {
          const title = await titleElement.evaluate(el => el.textContent.trim());
          const company = await companyElement.evaluate(el => el.textContent.trim());
          const location = await locationElement.evaluate(el => el.textContent.trim());
          const url = await urlElement.evaluate(el => el.href);
          const id = `nerdin-${title}-${company}-${location}`.replace(/\s+/g, '-').toLowerCase();

          allJobs.push({ id, title, company, location, url, source: 'Nerdin' });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Erro ao buscar vagas no Nerdin:', error);
  } finally {
    await browser.close();
  }

  return allJobs;
}

module.exports = { searchJobs };