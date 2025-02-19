const puppeteer = require('puppeteer');
const searchTerms = require('../searchTerms');
const { retry } = require('../utils/retry');

async function searchJobs() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  let allJobs = [];

  try {
    for (const term of searchTerms) {
      console.log(`Buscando no Indeed por: ${term}`);
      const encodedTerm = encodeURIComponent(term);
      await retry(async () => {
        await page.goto(`https://br.indeed.com/jobs?q=${encodedTerm}&l=Brasil&sc=0kf%3Attr(DSQF7)%3B`, { 
          waitUntil: 'networkidle2',
          timeout: 90000
        });
        
        await page.waitForSelector('.jobsearch-ResultsList, #mosaic-provider-jobcards', { timeout: 90000 });
      }, { retryCount: 3, retryDelay: 10000 });

      const jobListings = await page.$$('.jobsearch-ResultsList > li, #mosaic-provider-jobcards .job_seen_beacon');

      for (const listing of jobListings) {
        const job = await extractJobInfo(listing);
        if (job) allJobs.push(job);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('Erro ao buscar vagas no Indeed:', error);
  } finally {
    await browser.close();
  }

  return allJobs;
}

async function extractJobInfo(listing) {
  try {
    const titleElement = await listing.$('.jobTitle');
    const companyElement = await listing.$('.companyName');
    const locationElement = await listing.$('.companyLocation');
    const urlElement = await listing.$('a.jcs-JobTitle');

    if (titleElement && companyElement && locationElement && urlElement) {
      const title = await titleElement.evaluate(el => el.textContent.trim());
      const company = await companyElement.evaluate(el => el.textContent.trim());
      const location = await locationElement.evaluate(el => el.textContent.trim());
      const url = await urlElement.evaluate(el => el.href);
      const id = `indeed-${title}-${company}-${location}`.replace(/\s+/g, '-').toLowerCase();

      return { id, title, company, location, url, source: 'Indeed' };
    }
  } catch (error) {
    console.error('Erro ao extrair informações da vaga:', error);
  }
  return null;
}

module.exports = { searchJobs };