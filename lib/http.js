// fetch with retries - the store answers 429/"local_rate_limited" when polled too fast.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

async function fetchRetry(fetchFn, url, opts = {}, tries = 6) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetchFn(url, { ...opts, headers: { 'user-agent': UA, ...(opts.headers || {}) } });
      if (res.status !== 429 && res.status < 500) return res;
      last = new Error(`HTTP ${res.status} ${url}`);
    } catch (e) {
      last = e;
    }
    await sleep(2500 * (i + 1));
  }
  throw last;
}

module.exports = { fetchRetry, sleep };
