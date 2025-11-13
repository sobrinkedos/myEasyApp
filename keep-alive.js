/**
 * Keep Alive Script
 * 
 * Este script faz ping no servidor a cada 14 minutos para evitar que
 * o serviço gratuito do Render entre em modo sleep após 15 minutos de inatividade.
 * 
 * Para usar:
 * 1. Configure este script em um serviço de cron job gratuito como:
 *    - Cron-job.org (https://cron-job.org)
 *    - EasyCron (https://www.easycron.com)
 *    - UptimeRobot (https://uptimerobot.com)
 * 
 * 2. Configure para executar a cada 14 minutos
 * 
 * 3. URL para ping: https://seu-app.onrender.com/api/v1/health
 */

const https = require('https');

const RENDER_URL = process.env.RENDER_URL || 'https://myeasyapp-api.onrender.com';
const PING_ENDPOINT = '/api/v1/health';

function ping() {
  const url = `${RENDER_URL}${PING_ENDPOINT}`;
  
  console.log(`[${new Date().toISOString()}] Pinging: ${url}`);
  
  https.get(url, (res) => {
    console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`[${new Date().toISOString()}] Response:`, data);
    });
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  });
}

// Executar ping imediatamente
ping();

// Executar ping a cada 14 minutos (840000 ms)
setInterval(ping, 14 * 60 * 1000);

console.log('Keep-alive script started. Pinging every 14 minutes...');
