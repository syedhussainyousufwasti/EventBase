
const fs   = require('fs');
const path = require('path');

const logDir  = path.join(__dirname, '../reports');
const logFile = path.join(logDir, 'test-run.log');

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function write(level, message) {
  const line = `[${timestamp()}] [${level}] ${message}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

const logger = {
  info:    (msg) => write('INFO ', msg),
  warn:    (msg) => write('WARN ', msg),
  error:   (msg) => write('ERROR', msg),
  success: (msg) => write('PASS ', msg),
  step:    (msg) => write('STEP ', msg),
};

module.exports = logger;
