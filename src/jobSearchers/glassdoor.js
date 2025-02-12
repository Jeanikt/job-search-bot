const puppeteer = require('puppeteer');
const searchTerms = require('../searchTerms');

async function searchJobs() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let allJobs = [];

  try {
    for (const term of searchTerms) {
      console.log(`Searching Glassdoor for: ${term}`);
      const encodedTerm = encodeURIComponent(term);
      await page.goto(`https://www.glassdoor.com.br/Vaga/brasil-${encodedTerm}-vagas-SRCH_IL.0,6_IN36_KO7,${encodedTerm.length + 7}.htm?remoteWorkType=REMOTE`);
      
      await page.waitForSelector('.jobCard');
      const jobListings = await page.$$('.jobCard');

      for (const listing of jobListings) {
        const titleElement = await listing.$('.jobCard-title');
        const companyElement = await listing.$('.jobCard-company');
        const locationElement = await listing.$('.jobCard-location');
        const urlElement = await listing.$('a.jobCard-link');

        if (titleElement && companyElement && locationElement && urlElement) {
          const title = await titleElement.evaluate(el => el.textContent.trim());
          const company = await companyElement.evaluate(el => el.textContent.trim());
          const location = await locationElement.evaluate(el => el.textContent.trim());
          const url = await urlElement.evaluate(el => el.href);
          const id = `glassdoor-${title}-${company}-${location}`.replace(/\s+/g, '-').toLowerCase();

          allJobs.push({ id, title, company, location, url, source: 'Glassdoor' });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Error searching Glassdoor jobs:', error);
  } finally {
    await browser.close();
  }

  return allJobs;
}

module.exports = { searchJobs };