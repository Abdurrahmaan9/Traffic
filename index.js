const CONFIG_URL = './docs/config.json';
const LOGS_URL = './docs/logs.json';
let allLogs = [];
let currentFilter = 'all';
let currentPage = 1;
let logsPerPage = 20;
let totalPages = 1;

async function loadConfig() {
   try {
         const response = await fetch(CONFIG_URL + '?t=' + Date.now());
         return await response.json();
   } catch (error) {
         console.error('Error loading config:', error);
         return { endpoints: [] };
   }
}

async function loadLogs() {
   try {
         const response = await fetch(LOGS_URL + '?t=' + Date.now());
         allLogs = await response.json();
         displayLogs();
         updateLastUpdated();
         displayEndpoints();
   } catch (error) {
         console.error('Error loading logs:', error);
         document.getElementById('logs-container').innerHTML = '<div class="no-logs">Error loading logs</div>';
   }
}

function filterLogs(filterType) {
   currentFilter = filterType;
   currentPage = 1;

   document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
   event.target.classList.add('active');

   displayLogs();
}

function getFilteredLogs() {
   let filtered = [...allLogs];

   if (currentFilter === 'success') {
         filtered = filtered.filter(log => log.success);
   } else if (currentFilter === 'error') {
         filtered = filtered.filter(log => !log.success);
   }

   return filtered.reverse();
}

function displayLogs() {
   const filteredLogs = getFilteredLogs();
   const container = document.getElementById('logs-container');

   if (!filteredLogs || filteredLogs.length === 0) {
         container.innerHTML = '<div class="no-logs">No logs available</div>';
         updatePaginationControls(0);
         return;
   }

   totalPages = Math.ceil(filteredLogs.length / logsPerPage);
   const startIndex = (currentPage - 1) * logsPerPage;
   const endIndex = startIndex + logsPerPage;
   const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

   let html = '<table class="logs-table"><thead><tr>';
   html += '<th style="width: 180px;">Timestamp</th>';
   html += '<th style="width: 200px;">Endpoint</th>';
   html += '<th style="width: 100px;">Status</th>';
   html += '<th style="width: 120px;">Response Time</th>';
   html += '<th>Message</th>';
   html += '</tr></thead><tbody>';

   for (const log of paginatedLogs) {
         const time = new Date(log.timestamp).toLocaleString();
         const statusClass = log.success ? 'status-success' : 'status-error';
         const statusText = log.success ? 'OK' : 'ERROR';
         const responseTime = log.responseTime ? `${log.responseTime}ms` : 'N/A';

         html += `<tr>
            <td>${time}</td>
            <td><strong>${log.name || log.url}</strong></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${responseTime}</td>
            <td>${log.message}</td>
         </tr>`;
   }

   html += '</tbody></table>';
   container.innerHTML = html;
   updatePaginationControls(filteredLogs.length);
}

function updatePaginationControls(totalLogs) {
   const pageInfo = document.getElementById('pageInfo');
   const firstBtn = document.getElementById('firstPage');
   const prevBtn = document.getElementById('prevPage');
   const nextBtn = document.getElementById('nextPage');
   const lastBtn = document.getElementById('lastPage');

   if (totalLogs === 0) {
         pageInfo.textContent = 'No logs';
         firstBtn.disabled = true;
         prevBtn.disabled = true;
         nextBtn.disabled = true;
         lastBtn.disabled = true;
         return;
   }

   pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
   
   firstBtn.disabled = currentPage === 1;
   prevBtn.disabled = currentPage === 1;
   nextBtn.disabled = currentPage === totalPages;
   lastBtn.disabled = currentPage === totalPages;
}

function nextPage() {
   if (currentPage < totalPages) {
         currentPage++;
         displayLogs();
   }
}

function previousPage() {
   if (currentPage > 1) {
         currentPage--;
         displayLogs();
   }
}

function goToPage(page) {
   if (page >= 1 && page <= totalPages) {
         currentPage = page;
         displayLogs();
   }
}

async function displayEndpoints() {
   const config = await loadConfig();
   const container = document.getElementById('endpoints-grid');

   if (!config.endpoints || config.endpoints.length === 0) {
         container.innerHTML = '<div class="no-logs">No endpoints configured</div>';
         return;
   }

   let html = '';
   for (const endpoint of config.endpoints) {
         const endpointLogs = allLogs.filter(log => log.url === endpoint.url);
         const totalPings = endpointLogs.length;
         const successPings = endpointLogs.filter(log => log.success).length;
         const errorPings = endpointLogs.filter(log => !log.success).length;
         const successRate = totalPings > 0 ? Math.round((successPings / totalPings) * 100) : 0;
         const lastLog = endpointLogs[endpointLogs.length - 1];
         const lastStatus = lastLog ? (lastLog.success ? 'Healthy' : 'Error') : 'No Data';

         html += `
            <a href="${endpoint.url}" target="_blank" class="endpoint-link">
               <div class="endpoint-card">
                  <div class="endpoint-name">${endpoint.name}</div>
                  <div class="endpoint-url">${endpoint.url}</div>
                  <div style="font-size: 0.9em; margin-top: 12px; color: #aaa;">
                        Status: <strong style="color: #fff;">${lastStatus}</strong>
                  </div>
                  <div class="endpoint-stats">
                        <div class="stat">
                           <span class="stat-number">${totalPings}</span>
                           <span class="stat-label">Total Pings</span>
                        </div>
                        <div class="stat">
                           <span class="stat-number">${successPings}</span>
                           <span class="stat-label">Success</span>
                        </div>
                        <div class="stat">
                           <span class="stat-number">${errorPings}</span>
                           <span class="stat-label">Errors</span>
                        </div>
                        <div class="stat">
                           <span class="stat-number">${successRate}%</span>
                           <span class="stat-label">Success Rate</span>
                        </div>
                  </div>
               </div>
            </a>
         `;
   }

   container.innerHTML = html;
}

function downloadLogs() {
   const dataStr = JSON.stringify(allLogs, null, 2);
   const blob = new Blob([dataStr], { type: 'application/json' });
   const url = window.URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `ping-logs-${new Date().toISOString().split('T')[0]}.json`;
   document.body.appendChild(a);
   a.click();
   window.URL.revokeObjectURL(url);
   document.body.removeChild(a);
}

function updateLastUpdated() {
   const now = new Date().toLocaleString();
   document.getElementById('last-updated').textContent = `Last refreshed: ${now}`;
}

async function init() {
   loadLogs();
   setInterval(() => {
         loadLogs();
   }, 60000);
}

init();
