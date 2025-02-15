async function retry(fn, maxRetries = 5, delay = 10000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Tentativa ${i + 1} falhou. Tentando novamente em ${delay / 1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { retry };