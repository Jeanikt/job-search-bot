const puppeteer = require('puppeteer');
const searchTerms = require('../searchTerms');

async function searchJobs() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let allJobs = [];

  try {
    for (const term of searchTerms) {
      console.log(`Searching LinkedIn for: ${term}`);
      const encodedTerm = encodeURIComponent(term);
      await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${encodedTerm}`);
      await page.waitForSelector('.jobs-search__results-list');
      
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

      // Aguarde um pouco entre as pesquisas para evitar sobrecarga no servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Error searching LinkedIn jobs:', error);
  } finally {
    await browser.close();
  }

  return allJobs;
}

module.exports = { searchJobs };