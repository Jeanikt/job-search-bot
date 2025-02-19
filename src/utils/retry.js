const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 5000;

async function retry(fn, options = {}) {
  const retryCount = options.retryCount || DEFAULT_RETRY_COUNT;
  const retryDelay = options.retryDelay || DEFAULT_RETRY_DELAY;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Tentativa ${attempt} falhou. Erro: ${error.message}`);
      if (attempt === retryCount) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

module.exports = { retry };