const puppeteer = require('puppeteer');
const searchTerms = require('../searchTerms');

async function searchJobs() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let allJobs = [];

  try {
    for (const term of searchTerms) {
      console.log(`Searching Indeed for: ${term}`);
      const encodedTerm = encodeURIComponent(term);
      await page.goto(`https://www.indeed.com/jobs?q=${encodedTerm}&l=`);
      
      const jobListings = await page.$$('.jobsearch-ResultsList > li');

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

      // Aguarde um pouco entre as pesquisas para evitar sobrecarga no servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Error searching Indeed jobs:', error);
  } finally {
    await browser.close();
  }

  return allJobs;
}

module.exports = { searchJobs };