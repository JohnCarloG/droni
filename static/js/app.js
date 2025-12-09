// ============================================
// CONFIGURAZIONE & VARIABILI GLOBALI
// ============================================
const API_BASE_URL = '/api';
let currentUser = null;
let map = null;
let droneMarker = null;
let routeLine = null;
let updateInterval = null;

// ============================================
// INIZIALIZZAZIONE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚁 Droni Delivery App inizializzata');
    
    // Event Listeners
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const navLogout = document.getElementById('nav-logout');
    if (navLogout) {
        navLogout.addEventListener('click', handleLogout);
    }
    
    const navOrdini = document.getElementById('nav-ordini');
    if (navOrdini) {
        navOrdini.addEventListener('click', (e) => {
            e.preventDefault();
            backToOrders();
        });
    }
    
    // Controlla se già loggato
    checkSession();
});

// ============================================
// NAVIGAZIONE RUOLI
// ============================================
function showRoleSelection() {
    const roleSection = document.getElementById('role-section');
    const loginSection = document.getElementById('login-section');
    const mainNavbar = document.getElementById('main-navbar');
    const mainContainer = document.getElementById('main-container');
    
    if (roleSection) roleSection.style.display = 'flex';
    if (loginSection) loginSection.style.display = 'none';
    if (mainNavbar) mainNavbar.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'none';
}

function showLogin(role) {
    const roleSection = document.getElementById('role-section');
    const loginSection = document.getElementById('login-section');
    
    if (roleSection) roleSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'flex';
}

function goToAdmin() {
    window.location.href = '/admin';
}

// ============================================
// AUTENTICAZIONE
// ============================================
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Mail: email,
                Password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            showDashboard();
            loadOrders();
        } else {
            errorDiv.textContent = data.message || 'Credenziali non valide';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Errore login:', error);
        errorDiv.textContent = 'Errore di connessione al server';
        errorDiv.style.display = 'block';
    } finally {
        showLoading(false);
    }
}

function checkSession() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        showDashboard();
        loadOrders();
    } else {
        // Nessuna sessione: mostra selezione ruolo
        showRoleSelection();
    }
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('user');
    currentUser = null;
    
    // Ferma aggiornamenti automatici
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Mostra selezione ruolo
    document.getElementById('role-section').style.display = 'flex';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-navbar').style.display = 'none';
    document.getElementById('main-container').style.display = 'none';
    
    // Reset form
    document.getElementById('login-form').reset();
}

function showDashboard() {
    document.getElementById('role-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-navbar').style.display = 'block';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.Nome;
}

// ============================================
// CARICAMENTO ORDINI
// ============================================
async function loadOrders() {
    if (!currentUser) return;
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/ordini/utente/${currentUser.ID}`);
        const orders = await response.json();
        
        displayOrders(orders);
    } catch (error) {
        console.error('Errore caricamento ordini:', error);
        showAlert('Errore nel caricamento degli ordini', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('orders-container');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    📦 Nessun ordine trovato
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="card shadow-sm h-100" style="cursor: pointer; transition: all 0.3s;" onclick="loadOrderDetail(${order.ID})"
                 onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-lg)'"
                 onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <span class="card-title mb-0" style="font-size: 1.1rem;">📦 Ordine #${order.ID}</span>
                    ${getStatoBadge(order.StatoMissione)}
                </div>
                <div class="card-body">
                    <div class="mb-2">
                        <small class="text-muted">Tipo</small>
                        <p class="mb-0"><strong>${order.Tipo}</strong></p>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">Peso</small>
                        <p class="mb-0"><strong>${order.PesoTotale} kg</strong></p>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">Destinazione</small>
                        <p class="mb-0 text-truncate">${order.IndirizzoDestinazione}</p>
                    </div>
                    <div>
                        <small class="text-muted">Data</small>
                        <p class="mb-0">${formatDateTime(order.Orario)}</p>
                    </div>
                </div>
                <div class="card-footer text-center bg-light">
                    <small class="text-primary fw-bold">Clicca per dettagli →</small>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatoBadge(stato) {
    const badges = {
        'programmata': 'badge-info',
        'in corso': 'badge-warning',
        'completata': 'badge-success',
        'annullata': 'badge-danger'
    };
    
    const badgeClass = badges[stato] || 'badge-gray';
    return `<span class="badge ${badgeClass}">${stato}</span>`;
}

// ============================================
// DETTAGLIO ORDINE
// ============================================
async function loadOrderDetail(orderId) {
    try {
        showLoading(true);
        
        // Carica dettagli ordine
        const orderResponse = await fetch(`${API_BASE_URL}/ordini/${orderId}`);
        const order = await orderResponse.json();
        
        // Mostra vista dettaglio
        document.getElementById('orders-view').style.display = 'none';
        document.getElementById('order-detail-view').style.display = 'block';
        
        // Popola informazioni ordine
        displayOrderInfo(order);
        
        // Carica tracce della missione
        if (order.StatoMissione === 'in corso' || order.StatoMissione === 'completata') {
            await loadMissionTracking(order.MissioneID, order.StatoMissione);
            
            // Se in corso, avvia aggiornamenti automatici
            if (order.StatoMissione === 'in corso') {
                startLiveTracking(order.MissioneID);
            }
        } else {
            // Mappa non disponibile
            document.getElementById('map').innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: var(--gray-200);">
                    <p class="text-muted">Tracciamento non ancora disponibile</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Errore caricamento dettaglio:', error);
        showAlert('Errore nel caricamento dei dettagli', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayOrderInfo(order) {
    const infoDiv = document.getElementById('order-info');
    infoDiv.innerHTML = `
        <div class="mb-3">
            <strong class="d-block mb-2">Ordine #${order.ID}</strong>
            ${getStatoBadge(order.StatoMissione)}
        </div>
        <hr>
        <p><strong>🎯 Tipo:</strong> ${order.Tipo}</p>
        <p><strong>⚖️ Peso totale:</strong> ${order.PesoTotale} kg</p>
        <p><strong>📅 Data ordine:</strong> ${formatDateTime(order.Orario)}</p>
        <p><strong>👤 Cliente:</strong> ${order.ClienteNome}</p>
        <p><strong>✉️ Email:</strong> ${order.ClienteMail}</p>
        <hr>
        <p><strong>📍 Destinazione:</strong></p>
        <p class="text-muted">${order.IndirizzoDestinazione}</p>
    `;
    
    // Mostra prodotti
    const productsDiv = document.getElementById('order-products');
    if (order.Prodotti && order.Prodotti.length > 0) {
        productsDiv.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Prodotto</th>
                            <th>Qtà</th>
                            <th>Peso</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.Prodotti.map(p => `
                            <tr>
                                <td><small>${p.nome}</small></td>
                                <td><small>${p.Quantita}</small></td>
                                <td><small>${p.peso} kg</small></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        productsDiv.innerHTML = '<p class="text-muted">Nessun prodotto</p>';
    }
    
    // Gestione valutazione
    handleRatingSection(order);
}

// ============================================
// MAPPA & TRACCIAMENTO
// ============================================
async function loadMissionTracking(missionId, stato) {
    try {
        const response = await fetch(`${API_BASE_URL}/tracce/missione/${missionId}`);
        const tracce = await response.json();
        
        if (tracce && tracce.length > 0) {
            initMap(tracce);
            displayTimeline(tracce);
        } else {
            document.getElementById('map').innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: var(--gray-200);">
                    <p class="text-muted">Nessuna traccia disponibile</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Errore caricamento tracce:', error);
    }
}

function initMap(tracce) {
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = ''; // Pulisci contenuto precedente
    
    // Inizializza mappa Leaflet
    const firstTrace = tracce[0];
    map = L.map('map').setView([firstTrace.Latitudine, firstTrace.Longitudine], 13);
    
    // Aggiungi tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Aggiungi marker di partenza
    L.marker([firstTrace.Latitudine, firstTrace.Longitudine], {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '🏠',
            iconSize: [30, 30]
        })
    }).addTo(map).bindPopup('Punto di partenza');
    
    // Aggiungi marker di arrivo
    const lastTrace = tracce[tracce.length - 1];
    L.marker([lastTrace.Latitudine, lastTrace.Longitudine], {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '📍',
            iconSize: [30, 30]
        })
    }).addTo(map).bindPopup('Destinazione');
    
    // Disegna percorso
    const coordinates = tracce.map(t => [t.Latitudine, t.Longitudine]);
    routeLine = L.polyline(coordinates, {
        color: '#3498DB',
        weight: 3,
        opacity: 0.7
    }).addTo(map);
    
    // Aggiungi marker drone (ultima posizione)
    droneMarker = L.marker([lastTrace.Latitudine, lastTrace.Longitudine], {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '🚁',
            iconSize: [40, 40]
        })
    }).addTo(map).bindPopup('Posizione attuale drone');
    
    // Fit bounds
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
}

function displayTimeline(tracce) {
    const timeline = document.getElementById('tracking-timeline');
    
    timeline.innerHTML = `
        <div style="max-height: 400px; overflow-y: auto;">
            ${tracce.map((t, index) => `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <strong>Punto ${index + 1}</strong>
                            <span class="timeline-time">${formatDateTime(t.TIMESTAMP)}</span>
                        </div>
                        <div class="text-muted">
                            <small>📍 Lat: ${t.Latitudine.toFixed(6)}, Lon: ${t.Longitudine.toFixed(6)}</small>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// AGGIORNAMENTO LIVE
// ============================================
function startLiveTracking(missionId) {
    // Ferma eventuali aggiornamenti precedenti
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Mostra indicatore live
    const indicator = document.getElementById('live-indicator');
    indicator.classList.add('badge-success');
    indicator.textContent = '🟢 LIVE';
    
    // Aggiorna ogni 5 secondi
    updateInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tracce/ultima/${missionId}`);
            const lastTrace = await response.json();
            
            if (lastTrace && droneMarker) {
                // Aggiorna posizione marker
                const newLatLng = [lastTrace.Latitudine, lastTrace.Longitudine];
                droneMarker.setLatLng(newLatLng);
                
                // Aggiorna percorso
                await loadMissionTracking(missionId, 'in corso');
            }
        } catch (error) {
            console.error('Errore aggiornamento live:', error);
        }
    }, 5000);
}

function stopLiveTracking() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    
    const indicator = document.getElementById('live-indicator');
    indicator.classList.remove('badge-success');
    indicator.classList.add('badge-gray');
    indicator.textContent = '⚫ OFFLINE';
}

// ============================================
// NAVIGAZIONE
// ============================================
function backToOrders() {
    // Ferma aggiornamenti
    stopLiveTracking();
    
    // Distruggi mappa
    if (map) {
        map.remove();
        map = null;
    }
    
    // Mostra lista ordini
    document.getElementById('order-detail-view').style.display = 'none';
    document.getElementById('orders-view').style.display = 'block';
}

// ============================================
// UTILITY
// ============================================
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// GESTIONE VALUTAZIONI
// ============================================
let currentMissionId = null;
let selectedRating = 0;

async function handleRatingSection(order) {
    const ratingCard = document.getElementById('rating-card');
    
    // Mostra solo se completata
    if (order.StatoMissione !== 'completata') {
        ratingCard.style.display = 'none';
        return;
    }
    
    ratingCard.style.display = 'block';
    currentMissionId = order.MissioneID;
    
    // Carica valutazione esistente
    try {
        const response = await fetch(`${API_BASE_URL}/missioni/${order.MissioneID}/valutazione`);
        const valutazione = await response.json();
        
        if (valutazione.Valutazione) {
            // Mostra valutazione esistente
            document.getElementById('existing-rating').style.display = 'block';
            document.getElementById('rating-form').style.display = 'none';
            document.getElementById('display-rating').textContent = valutazione.Valutazione;
            document.getElementById('display-comment').textContent = valutazione.Commento || 'Nessun commento';
        } else {
            // Mostra form per nuova valutazione
            document.getElementById('existing-rating').style.display = 'none';
            document.getElementById('rating-form').style.display = 'block';
            initRatingStars();
        }
    } catch (error) {
        console.error('Errore caricamento valutazione:', error);
    }
}

function initRatingStars() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating-value');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            ratingInput.value = selectedRating;
            updateStars(selectedRating);
        });
        
        star.addEventListener('mouseenter', () => {
            updateStars(index + 1);
        });
    });
    
    const ratingForm = document.getElementById('rating-form');
    ratingForm.addEventListener('mouseleave', () => {
        updateStars(selectedRating);
    });
    
    ratingForm.addEventListener('submit', handleRatingSubmit);
}

function updateStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

async function handleRatingSubmit(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('rating-value').value);
    const comment = document.getElementById('rating-comment').value;
    
    if (!rating || rating < 1 || rating > 10) {
        alert('Seleziona un punteggio da 1 a 10');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/missioni/${currentMissionId}/valutazione`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Valutazione: rating,
                Commento: comment
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Grazie per la tua valutazione!', 'success');
            
            // Aggiorna visualizzazione
            document.getElementById('rating-form').style.display = 'none';
            document.getElementById('existing-rating').style.display = 'block';
            document.getElementById('display-rating').textContent = rating;
            document.getElementById('display-comment').textContent = comment || 'Nessun commento';
        } else {
            showAlert('Errore nell\'invio della valutazione', 'danger');
        }
    } catch (error) {
        console.error('Errore invio valutazione:', error);
        showAlert('Errore di connessione', 'danger');
    } finally {
        showLoading(false);
    }
}
