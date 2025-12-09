// ============================================
// CONFIGURAZIONE
// ============================================
const API_BASE_URL = '/api';

// ============================================
// INIZIALIZZAZIONE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚁 Admin Dashboard inizializzata');
    
    // Event listeners per navigazione
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
    
    // Form add drone
    const addDroneForm = document.getElementById('add-drone-form');
    if (addDroneForm) {
        addDroneForm.addEventListener('submit', handleAddDrone);
    }
    
    // Form add pilota
    const addPilotaForm = document.getElementById('add-pilota-form');
    if (addPilotaForm) {
        addPilotaForm.addEventListener('submit', handleAddPilota);
    }
    
    // Carica dashboard
    loadDashboard();
});

// ============================================
// NAVIGAZIONE TRA VISTE
// ============================================
function switchView(viewName) {
    // Nascondi tutte le viste
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => view.style.display = 'none');
    
    // Mostra vista selezionata
    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
        selectedView.style.display = 'block';
    }
    
    // Aggiorna nav attivo
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    navLinks.forEach(link => {
        if (link.dataset.view === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Carica dati per la vista
    switch(viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'droni':
            loadDroni();
            break;
        case 'piloti':
            loadPiloti();
            break;
        case 'missioni':
            loadMissioni();
            break;
        case 'ordini':
            loadOrdini();
            break;
        case 'report':
            loadReport();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        showLoading(true);
        
        // Carica statistiche
        const [droniRes, missioniRes, statsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/droni`),
            fetch(`${API_BASE_URL}/missioni`),
            fetch(`${API_BASE_URL}/statistiche/missioni`)
        ]);
        
        const droni = await droniRes.json();
        const missioni = await missioniRes.json();
        const stats = await statsRes.json();
        
        // Aggiorna contatori
        document.getElementById('stat-droni').textContent = droni.length;
        
        const missioniInCorso = missioni.filter(m => m.Stato === 'in corso').length;
        document.getElementById('stat-missioni-corso').textContent = missioniInCorso;
        
        const missioniCompletate = stats.find(s => s.Stato === 'completata');
        document.getElementById('stat-missioni-completate').textContent = 
            missioniCompletate ? missioniCompletate.Totale : 0;
        
        const avgValutazione = missioniCompletate ? missioniCompletate.MediaValutazione : 0;
        document.getElementById('stat-valutazione').textContent = 
            avgValutazione ? avgValutazione.toFixed(1) : '0.0';
        
        // Mostra missioni recenti
        displayRecentMissions(missioni.slice(0, 10));
        
    } catch (error) {
        console.error('Errore caricamento dashboard:', error);
    } finally {
        showLoading(false);
    }
}

function displayRecentMissions(missioni) {
    const container = document.getElementById('recent-missions');
    
    if (!missioni || missioni.length === 0) {
        container.innerHTML = '<p class="text-muted">Nessuna missione recente</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Drone</th>
                    <th>Pilota</th>
                    <th>Stato</th>
                    <th>Valutazione</th>
                </tr>
            </thead>
            <tbody>
                ${missioni.map(m => `
                    <tr>
                        <td>#${m.ID}</td>
                        <td>${m.DataMissione}</td>
                        <td>${m.DroneModello}</td>
                        <td>${m.PilotaNome} ${m.PilotaCognome}</td>
                        <td>${getStatoBadge(m.Stato)}</td>
                        <td>${m.Valutazione ? m.Valutazione + '/10' : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============================================
// GESTIONE DRONI
// ============================================
async function loadDroni() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/droni`);
        const droni = await response.json();
        
        displayDroni(droni);
    } catch (error) {
        console.error('Errore caricamento droni:', error);
    } finally {
        showLoading(false);
    }
}

function displayDroni(droni) {
    const tbody = document.getElementById('droni-tbody');
    
    if (!droni || droni.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nessun drone</td></tr>';
        return;
    }
    
    tbody.innerHTML = droni.map(d => `
        <tr>
            <td>#${d.ID}</td>
            <td>${d.Modello}</td>
            <td>${d.Capacita}</td>
            <td>
                <span class="badge ${getBatteryBadge(d.Batteria)}">${d.Batteria}%</span>
            </td>
            <td>${getBatteryStatus(d.Batteria)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editDrone(${d.ID})">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteDrone(${d.ID})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getBatteryBadge(batteria) {
    if (batteria >= 70) return 'badge-success';
    if (batteria >= 40) return 'badge-warning';
    return 'badge-danger';
}

function getBatteryStatus(batteria) {
    if (batteria >= 70) return '✅ Operativo';
    if (batteria >= 40) return '⚠️ Carica consigliata';
    return '❌ Ricarica necessaria';
}

function showAddDroneForm() {
    document.getElementById('add-drone-modal').style.display = 'flex';
}

function closeAddDroneForm() {
    document.getElementById('add-drone-modal').style.display = 'none';
    document.getElementById('add-drone-form').reset();
}

async function handleAddDrone(e) {
    e.preventDefault();
    
    const modello = document.getElementById('drone-modello').value;
    const capacita = document.getElementById('drone-capacita').value;
    const batteria = document.getElementById('drone-batteria').value;
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/droni`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Modello: modello,
                Capacita: parseFloat(capacita),
                Batteria: parseInt(batteria)
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Drone aggiunto con successo!');
            closeAddDroneForm();
            loadDroni();
        } else {
            alert('Errore nell\'aggiunta del drone');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore di connessione');
    } finally {
        showLoading(false);
    }
}

async function deleteDrone(id) {
    if (!confirm('Sei sicuro di voler eliminare questo drone?')) return;
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/droni/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Drone eliminato con successo');
            loadDroni();
        } else {
            alert('Errore nell\'eliminazione del drone');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore di connessione');
    } finally {
        showLoading(false);
    }
}

function editDrone(id) {
    alert('Funzionalità di modifica in sviluppo');
}

// ============================================
// GESTIONE MISSIONI
// ============================================
async function loadMissioni() {
    try {
        showLoading(true);
        const stato = document.getElementById('filter-stato').value;
        
        let url = `${API_BASE_URL}/missioni`;
        if (stato) {
            url = `${API_BASE_URL}/missioni/stato/${stato}`;
        }
        
        const response = await fetch(url);
        const missioni = await response.json();
        
        displayMissioni(missioni);
    } catch (error) {
        console.error('Errore caricamento missioni:', error);
    } finally {
        showLoading(false);
    }
}

function displayMissioni(missioni) {
    const tbody = document.getElementById('missioni-tbody');
    
    if (!missioni || missioni.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nessuna missione</td></tr>';
        return;
    }
    
    tbody.innerHTML = missioni.map(m => `
        <tr>
            <td>#${m.ID}</td>
            <td>${m.DataMissione} ${m.Ora}</td>
            <td>${m.DroneModello}</td>
            <td>${m.PilotaNome} ${m.PilotaCognome}</td>
            <td>${getStatoBadge(m.Stato)}</td>
            <td>${m.Valutazione ? m.Valutazione + '/10 ⭐' : '-'}</td>
        </tr>
    `).join('');
}

// ============================================
// GESTIONE ORDINI
// ============================================
async function loadOrdini() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/ordini`);
        const ordini = await response.json();
        
        displayOrdini(ordini);
    } catch (error) {
        console.error('Errore caricamento ordini:', error);
    } finally {
        showLoading(false);
    }
}

function displayOrdini(ordini) {
    const tbody = document.getElementById('ordini-tbody');
    
    if (!ordini || ordini.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nessun ordine</td></tr>';
        return;
    }
    
    tbody.innerHTML = ordini.map(o => `
        <tr>
            <td>#${o.ID}</td>
            <td>${o.ClienteNome}</td>
            <td>${o.Tipo}</td>
            <td>${o.PesoTotale} kg</td>
            <td>${o.IndirizzoDestinazione}</td>
            <td>${getStatoBadge(o.StatoMissione)}</td>
        </tr>
    `).join('');
}

// ============================================
// GESTIONE PILOTI
// ============================================
async function loadPiloti() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/piloti`);
        const piloti = await response.json();
        
        displayPiloti(piloti);
    } catch (error) {
        console.error('Errore caricamento piloti:', error);
    } finally {
        showLoading(false);
    }
}

function displayPiloti(piloti) {
    const tbody = document.getElementById('piloti-tbody');
    
    if (!piloti || piloti.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nessun pilota</td></tr>';
        return;
    }
    
    tbody.innerHTML = piloti.map(p => `
        <tr>
            <td>#${p.ID}</td>
            <td>${p.Nome}</td>
            <td>${p.Cognome}</td>
            <td>${p.Email}</td>
            <td>${p.NumeroLicenza}</td>
            <td>${p.NumMissioni || 0}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deletePilota(${p.ID})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function showAddPilotaForm() {
    document.getElementById('add-pilota-modal').style.display = 'flex';
}

function closeAddPilotaForm() {
    document.getElementById('add-pilota-modal').style.display = 'none';
    document.getElementById('add-pilota-form').reset();
}

async function handleAddPilota(e) {
    e.preventDefault();
    
    const data = {
        Nome: document.getElementById('pilota-nome').value,
        Cognome: document.getElementById('pilota-cognome').value,
        Email: document.getElementById('pilota-email').value,
        NumeroLicenza: document.getElementById('pilota-licenza').value
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/piloti`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Pilota aggiunto con successo!');
            closeAddPilotaForm();
            loadPiloti();
        } else {
            alert('Errore nell\'aggiunta del pilota');
        }
    } catch (error) {
        console.error('Errore:', error);
    } finally {
        showLoading(false);
    }
}

async function deletePilota(id) {
    if (!confirm('Sei sicuro di voler eliminare questo pilota?')) return;
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/piloti/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (response.ok) {
            alert('Pilota eliminato');
            loadPiloti();
        } else {
            alert(result.error || 'Errore nell\'eliminazione');
        }
    } catch (error) {
        console.error('Errore:', error);
    } finally {
        showLoading(false);
    }
}

// ============================================
// REPORT E STATISTICHE
// ============================================
async function loadReport() {
    try {
        showLoading(true);
        
        const [missioniRes, droniRes, pilotiRes, consegneRes] = await Promise.all([
            fetch(`${API_BASE_URL}/statistiche/missioni`),
            fetch(`${API_BASE_URL}/statistiche/droni`),
            fetch(`${API_BASE_URL}/statistiche/piloti`),
            fetch(`${API_BASE_URL}/report/consegne`)
        ]);
        
        const missioni = await missioniRes.json();
        const droni = await droniRes.json();
        const piloti = await pilotiRes.json();
        const consegne = await consegneRes.json();
        
        displayMissioniStats(missioni);
        displayDroniStats(droni);
        displayTopPiloti(piloti);
        displayConsegneStats(consegne);
        
    } catch (error) {
        console.error('Errore caricamento report:', error);
    } finally {
        showLoading(false);
    }
}

function displayMissioniStats(stats) {
    const container = document.getElementById('report-missioni-stats');
    container.innerHTML = `
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr><th>Stato</th><th>Totale</th><th>Val. Media</th></tr>
                </thead>
                <tbody>
                    ${stats.map(s => `
                        <tr>
                            <td>${getStatoBadge(s.Stato)}</td>
                            <td><strong>${s.Totale}</strong></td>
                            <td>${s.MediaValutazione ? s.MediaValutazione.toFixed(1) + '⭐' : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function displayDroniStats(stats) {
    const container = document.getElementById('report-droni-stats');
    container.innerHTML = `
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr><th>Drone</th><th>Missioni</th><th>Batteria</th></tr>
                </thead>
                <tbody>
                    ${stats.slice(0, 5).map(d => `
                        <tr>
                            <td>${d.Modello}</td>
                            <td><strong>${d.NumeroMissioni}</strong></td>
                            <td><span class="badge ${d.Batteria > 50 ? 'badge-green' : 'badge-yellow'}">${d.Batteria}%</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function displayTopPiloti(stats) {
    const container = document.getElementById('report-top-piloti');
    const sorted = stats.filter(p => p.MediaValutazione).sort((a, b) => b.MediaValutazione - a.MediaValutazione);
    
    container.innerHTML = `
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr><th>Pilota</th><th>Missioni</th><th>Valutazione</th></tr>
                </thead>
                <tbody>
                    ${sorted.slice(0, 5).map((p, i) => `
                        <tr>
                            <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''} ${p.Nome} ${p.Cognome}</td>
                            <td>${p.NumeroMissioni}</td>
                            <td><strong>${p.MediaValutazione.toFixed(1)}</strong>⭐</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function displayConsegneStats(stats) {
    const container = document.getElementById('report-consegne');
    container.innerHTML = `
        <div class="table-wrapper">
            <table class="table">
                <thead>
                    <tr><th>Tipo</th><th>Totale</th><th>Peso Medio</th></tr>
                </thead>
                <tbody>
                    ${stats.map(c => `
                        <tr>
                            <td>${c.Tipo}</td>
                            <td><strong>${c.Totale}</strong></td>
                            <td>${c.PesoMedio ? c.PesoMedio.toFixed(2) : 0} kg</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function exportReport() {
    alert('Funzionalità export CSV in sviluppo');
}

// ============================================
// ANALYTICS / ML
// ============================================
async function loadAnalytics() {
    // Carica dati iniziali
    runMaintenancePrediction();
}

async function runDemandPrediction() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/analytics/demand-prediction`);
        const data = await response.json();
        
        document.getElementById('ml-next-week').textContent = data.previsione_settimanale;
    } catch (error) {
        console.error('Errore:', error);
    } finally {
        showLoading(false);
    }
}

async function runRouteAnalysis() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/analytics/route-analysis`);
        const data = await response.json();
        
        document.getElementById('ml-avg-time').textContent = data.tempo_medio_consegna;
    } catch (error) {
        console.error('Errore:', error);
    } finally {
        showLoading(false);
    }
}

async function runMaintenancePrediction() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/analytics/maintenance-prediction`);
        const data = await response.json();
        
        const tbody = document.getElementById('ml-maintenance-tbody');
        tbody.innerHTML = data.map(d => `
            <tr>
                <td>${d.modello}</td>
                <td>${d.batteria}%</td>
                <td>${d.missioni}</td>
                <td>
                    <span class="badge ${d.stato === 'ok' ? 'badge-green' : d.stato === 'attenzione' ? 'badge-yellow' : 'badge-red'}">
                        ${d.stato === 'ok' ? '✅ OK' : d.stato === 'attenzione' ? '⚠️ Attenzione' : '🔧 Critico'}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Errore:', error);
    } finally {
        showLoading(false);
    }
}

async function runSentimentAnalysis() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/analytics/sentiment`);
        const data = await response.json();
        
        document.getElementById('ml-positive').textContent = data.positivi;
        document.getElementById('ml-neutral').textContent = data.neutri;
        document.getElementById('ml-negative').textContent = data.negativi;
    } catch (error) {
        console.error('Errore:', error);
    } finally {
        showLoading(false);
    }
}

// ============================================
// UTILITY
// ============================================
function getStatoBadge(stato) {
    const badges = {
        'programmata': 'badge-blue',
        'in corso': 'badge-yellow',
        'completata': 'badge-green',
        'annullata': 'badge-red'
    };
    
    const badgeClass = badges[stato] || 'badge-gray';
    return `<span class="badge ${badgeClass}">${stato || 'N/A'}</span>`;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}
