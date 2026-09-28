// Logs requests that run too long or are dropped before a response is sent,
// to spot handlers that hold connections open on the host.
const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS || 10000);

let inFlight = 0;

const requestMonitor = (req, res, next) => {
  const start = Date.now();
  const label = () => `${req.method} ${req.originalUrl} pid=${process.pid} inFlight=${inFlight}`;
  inFlight++;

  const slowTimer = setTimeout(() => {
    console.warn(`[SLOW] ${label()} still running after ${Date.now() - start}ms`);
  }, SLOW_REQUEST_MS);

  let done = false;
  const finish = (event) => {
    if (done) return;
    done = true;
    inFlight--;
    clearTimeout(slowTimer);
    const duration = Date.now() - start;
    if (event === 'close') {
      console.warn(`[ABORTED] ${label()} closed without response after ${duration}ms`);
    } else if (duration >= SLOW_REQUEST_MS) {
      console.warn(`[SLOW] ${label()} finished ${res.statusCode} in ${duration}ms`);
    }
  };

  res.on('finish', () => finish('finish'));
  res.on('close', () => finish('close'));
  next();
};

module.exports = { requestMonitor };
