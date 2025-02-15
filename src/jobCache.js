const fs = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'jobCache.json');

async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Se o arquivo não existir, retorna um objeto vazio
      return {};
    }
    throw error;
  }
}

async function saveCache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function isJobNew(jobId) {
  const cache = await loadCache();
  return !cache[jobId];
}

async function markJobAsSeen(jobId) {
  const cache = await loadCache();
  cache[jobId] = Date.now();
  await saveCache(cache);
}

async function cleanOldJobs(daysToKeep = 30) {
  const cache = await loadCache();
  const now = Date.now();
  const msToKeep = daysToKeep * 24 * 60 * 60 * 1000;

  for (const [jobId, timestamp] of Object.entries(cache)) {
    if (now - timestamp > msToKeep) {
      delete cache[jobId];
    }
  }

  await saveCache(cache);
}

module.exports = { isJobNew, markJobAsSeen, cleanOldJobs };

async function cleanOldJobs(daysToKeep = 30) {
  const cache = await loadCache();
  const now = Date.now();
  const msToKeep = daysToKeep * 24 * 60 * 60 * 1000;

  for (const [jobId, timestamp] of Object.entries(cache)) {
    if (now - timestamp > msToKeep) {
      delete cache[jobId];
    }
  }

  await saveCache(cache);
}

module.exports = { isJobNew, markJobAsSeen, cleanOldJobs };