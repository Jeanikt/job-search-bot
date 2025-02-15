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
      console.log(`Buscando no Indeed por: ${term}`);
      const encodedTerm = encodeURIComponent(term);
      await page.goto(`https://br.indeed.com/jobs?q=${encodedTerm}&l=Brasil&sc=0kf%3Attr(DSQF7)%3B`, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.waitForSelector('.jobsearch-ResultsList, #mosaic-provider-jobcards', { timeout: 30000 });
      const jobListings = await page.$$('.jobsearch-ResultsList > li, #mosaic-provider-jobcards .job_seen_beacon');

      for (const listing of jobListings) {
        const titleElement = await listing.$('.jobTitle');
        const companyElement = await listing.$('.companyName');
        const locationElement = await listing.$('.companyLocation');
        const urlElement = await listing.$('a.jcs-JobTitle');

        if (titleElement && companyElement && locationElement && urlElement) {
          const title = await titleElement.evaluate(el => el.textContent);
          const company = await companyElement.evaluate(el => el.textContent);
          const location = await locationElement.evaluate(el => el.textContent);
          const url = await urlElement.evaluate(el => el.href);
          const id = `indeed-${title}-${company}-${location}`.replace(/\s+/g, '-').toLowerCase();

          allJobs.push({ id, title, company, location, url, source: 'Indeed' });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Erro ao buscar vagas no Indeed:', error);
  } finally {
    await browser.close();
  }

  return allJobs;
}

module.exports = { searchJobs };