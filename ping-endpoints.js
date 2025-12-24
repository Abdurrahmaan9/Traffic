const axios = require('axios');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'docs', 'config.json');
const logsPath = path.join(__dirname, 'docs', 'logs.json');

async function pingEndpoints() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const endpoints = config.endpoints || [];

    const timestamp = new Date().toISOString();
    const results = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const response = await axios.get(endpoint.url, { timeout: 10000 });
        const responseTime = Date.now() - startTime;
        
        results.push({
          url: endpoint.url,
          name: endpoint.name || endpoint.url,
          status: response.status,
          responseTime,
          timestamp,
          success: true,
          message: 'OK'
        });

        console.log(`✓ ${endpoint.url} - ${response.status} (${responseTime}ms)`);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        results.push({
          url: endpoint.url,
          name: endpoint.name || endpoint.url,
          status: error.response?.status || 0,
          responseTime,
          timestamp,
          success: false,
          message: error.message
        });

        console.log(`✗ ${endpoint.url} - ${error.message}`);
      }
    }

    let logs = [];
    if (fs.existsSync(logsPath)) {
      logs = JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
    }

    logs.push(...results);

    logs = logs.slice(-1000);

    fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
    console.log(`\nLogged ${results.length} results. Total logs: ${logs.length}`);
  } catch (error) {
    console.error('Error pinging endpoints:', error.message);
    process.exit(1);
  }
}

pingEndpoints();
