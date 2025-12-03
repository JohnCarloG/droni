# 🚁 Sistema di Gestione Consegne con Droni

Sistema completo per la gestione di consegne tramite droni con monitoraggio live, sviluppato con Flask (backend), MySQL (database su Aiven) e SPA (Single Page Application) vanilla JavaScript.

## 📋 Descrizione

Il sistema permette di:
- **Clienti**: Monitorare ordini in tempo reale, visualizzare posizione drone su mappa interattiva, consultare storico tracciamento
- **Amministratori**: Gestire droni, piloti e missioni, analizzare statistiche operative, visualizzare dashboard con metriche in tempo reale
- Tracciare in tempo reale le posizioni dei droni durante le consegne
- Autenticazione utenti (clienti e amministratori)

## 🛠️ Tecnologie Utilizzate

- **Backend**: Flask 3.0 (Python)
- **Database**: MySQL su Aiven Cloud (remoto)
- **Frontend**: HTML5, CSS3 (Design System minimalista), JavaScript ES6+
- **Mappe**: Leaflet.js per visualizzazione tracciamento GPS
- **API**: REST API con JSON
- **Autenticazione**: Session-based

## 📁 Struttura del Progetto

```
droni/
├── backend/                # 📁 Package backend Python
│   ├── __init__.py        # Inizializzazione package
│   ├── app.py             # Server Flask con API REST e route web
│   └── db.py              # Gestione connessione database MySQL
├── static/                 # 📁 File statici frontend
│   ├── css/
│   │   └── design-system.css  # Design system minimalista
│   └── js/
│       ├── app.js         # SPA cliente (monitoraggio ordini)
│       └── admin.js       # Dashboard amministrativa
├── templates/              # 📁 Template HTML
│   ├── index.html         # Pagina cliente (tracciamento ordini)
│   └── admin.html         # Dashboard amministrativa
├── memory-bank/            # 📁 Documentazione e SQL
│   ├── consegna.md        # Specifica completa del progetto
│   ├── structure.sql      # Schema database (CREATE TABLE)
│   └── data.sql           # Dati di test (INSERT)
├── .env                    # ⚙️ Variabili d'ambiente (NON committare!)
├── .env.example            # Esempio configurazione
├── .gitignore              # File da ignorare in git
├── requirements.txt        # 📦 Dipendenze Python
├── run.py                  # 🚀 Script per avviare il server
└── README.md               # 📖 Questo file
```

## 🚀 Installazione e Configurazione

### 1. Prerequisiti

- **Python 3.8+** installato sul sistema
- **Account Aiven** con database MySQL configurato e attivo
- **pip** (gestore pacchetti Python)
- **Git** (opzionale, per clonare il repository)

### 2. Clona o Scarica il Progetto

```bash
git clone <url-repository>
cd droni
```

Oppure scarica lo ZIP ed estrailo.

### 3. Installa le Dipendenze Python

**Windows (PowerShell):**
```bash
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
pip3 install -r requirements.txt
```

**Dipendenze installate:**
- Flask 3.0.0 - Web framework
- Flask-CORS 4.0.0 - Gestione CORS per API
- mysql-connector-python 8.2.0 - Connettore MySQL
- python-dotenv 1.0.0 - Gestione variabili d'ambiente

### 4. Configura il Database

#### A) Crea il database su Aiven

1. Accedi al tuo account Aiven
2. Crea un servizio MySQL
3. Annota le credenziali di connessione

#### B) Configura le variabili d'ambiente

Modifica il file `.env` con le tue credenziali Aiven:

```env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=12345
DB_NAME=Droni
DB_USER=avnadmin
DB_PASSWORD=your-password

SECRET_KEY=your-secret-key-here

HOST=0.0.0.0
PORT=5000
```

#### C) Popola il database

Esegui gli script SQL su Aiven usando uno di questi metodi:

**Metodo 1 - Console Aiven:**
1. Accedi alla dashboard Aiven
2. Apri la console SQL del tuo database
3. Copia e incolla il contenuto di `memory-bank/structure.sql`
4. Esegui lo script
5. Ripeti con `memory-bank/data.sql`

**Metodo 2 - MySQL Client:**
```bash
mysql -h your-host.aivencloud.com -P port -u avnadmin -p Droni < memory-bank/structure.sql
mysql -h your-host.aivencloud.com -P port -u avnadmin -p Droni < memory-bank/data.sql
```

**Dati creati:**
- 5 Piloti
- 10 Droni
- 5 Utenti clienti
- 100 Prodotti
- 10 Missioni completate
- 10 Ordini
- 50 Tracce GPS

### 5. Avvia il Server

**Windows (PowerShell):**
```bash
python run.py
```

**Linux/Mac:**
```bash
python3 run.py
```

Il server sarà disponibile su: `http://localhost:5000`

## 🌐 Accesso alle Applicazioni

### 👤 Cliente SPA
- **URL**: http://localhost:5000/
- **Credenziali di test**:
  - Email: `mario.rossi@mail.com`
  - Password: `pass123`
- **Funzionalità**:
  - ✅ Login sicuro con sessione
  - ✅ Lista ordini con card colorate
  - ✅ Dettaglio ordine completo
  - ✅ Mappa interattiva con posizione drone (Leaflet.js)
  - ✅ Timeline tracciamento GPS
  - ✅ **Aggiornamenti automatici ogni 5 secondi** (live tracking)
  - ✅ **Sistema valutazione con stelle** (1-10) + commento
  - ✅ Visualizzazione prodotti nel pacco
  - ✅ Stati ordine colorati

### 👨‍💼 Dashboard Amministrativa
- **URL**: http://localhost:5000/admin
- **Funzionalità**:
  - ✅ Dashboard con 4 KPI in tempo reale
  - ✅ Gestione droni (CRUD completo)
  - ✅ Gestione missioni con filtri
  - ✅ Gestione ordini
  - ✅ Statistiche operative
  - ✅ Tabelle responsive
  - ✅ Modal professionali per form

## 🎨 Design System

Il progetto include un **design system professionale minimalista** con palette senza gradienti:

### Caratteristiche
- ✅ Palette colori professionale (blu, grigio, accent)
- ✅ Typography moderna con Google Fonts (Inter)
- ✅ Spacing scale consistente (8px base)
- ✅ Componenti completi (buttons, cards, forms, modal, timeline, rating)
- ✅ Shadows professionali (6 livelli)
- ✅ Transitions smooth
- ✅ Responsive mobile-first
- ✅ Utility classes complete
- ✅ Bootstrap 5.3.2 integrato

### Palette Colori
```
Primary:   #1E3A8A (Blu professionale)
Secondary: #0EA5E9 (Cyan accent)
Success:   #10B981 (Verde)
Warning:   #F59E0B (Arancione)
Danger:    #EF4444 (Rosso)
Gray:      10 tonalità per consistenza
```

## 📡 API Endpoints

### Pagine Web
- `GET /` - Pagina cliente (SPA tracciamento ordini)
- `GET /admin` - Dashboard amministrativa

### Test e Informazioni

- `GET /` - Info API
- `GET /api/test-db` - Test connessione database

### Droni

- `GET /api/droni` - Lista tutti i droni
- `GET /api/droni/<id>` - Dettagli drone specifico
- `POST /api/droni` - Crea nuovo drone
- `PUT /api/droni/<id>` - Aggiorna drone
- `DELETE /api/droni/<id>` - Elimina drone

### Piloti

- `GET /api/piloti` - Lista tutti i piloti
- `GET /api/piloti/<id>` - Dettagli pilota specifico

### Missioni

- `GET /api/missioni` - Lista tutte le missioni
- `GET /api/missioni/<id>` - Dettagli missione specifica
- `GET /api/missioni/stato/<stato>` - Filtra missioni per stato
  - Stati disponibili: `programmata`, `in corso`, `completata`, `annullata`

### Tracce GPS

- `GET /api/tracce/missione/<id_missione>` - Tutte le tracce di una missione
- `GET /api/tracce/ultima/<id_missione>` - Ultima posizione del drone

### Ordini

- `GET /api/ordini` - Lista tutti gli ordini
- `GET /api/ordini/<id>` - Dettagli ordine con prodotti
- `GET /api/ordini/utente/<id_utente>` - Ordini di un utente specifico

### Prodotti

- `GET /api/prodotti` - Lista tutti i prodotti
- `GET /api/prodotti/categoria/<categoria>` - Prodotti per categoria

### Autenticazione

- `POST /api/login` - Login utente
  ```json
  {
    "Mail": "mario.rossi@mail.com",
    "Password": "pass123"
  }
  ```
- `POST /api/logout` - Logout utente

### Statistiche

- `GET /api/statistiche/missioni` - Statistiche missioni per stato
- `GET /api/statistiche/droni` - Performance droni

## 📝 Esempi di Utilizzo

### Test Connessione Database

**Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/test-db" | Select-Object -Expand Content
```

**Linux/Mac/Git Bash:**
```bash
curl http://localhost:5000/api/test-db
```

**Browser:**
Apri semplicemente: `http://localhost:5000/api/test-db`

### Ottenere Lista Droni

```bash
curl http://localhost:5000/api/droni
```

**Oppure usa il browser:** `http://localhost:5000/api/droni`

### Creare un Nuovo Drone (POST)

**Con curl:**
```bash
curl -X POST http://localhost:5000/api/droni \
  -H "Content-Type: application/json" \
  -d '{
    "Modello": "DJI Mini 3 Pro",
    "Capacita": 2.5,
    "Batteria": 100
  }'
```

**Con JavaScript (fetch API):**
```javascript
fetch('http://localhost:5000/api/droni', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    Modello: "DJI Mini 3 Pro",
    Capacita: 2.5,
    Batteria: 100
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Login Utente

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "Mail": "mario.rossi@mail.com",
    "Password": "pass123"
  }'
```

**Utenti di test disponibili:**
- mario.rossi@mail.com / pass123
- sara.bianchi@mail.com / pass123
- giovanni.verdi@mail.com / pass123

### Tracciare una Missione in Corso

```bash
curl http://localhost:5000/api/tracce/missione/1
```

**Visualizza ultima posizione:**
```bash
curl http://localhost:5000/api/tracce/ultima/1
```

## 🗄️ Schema Database

Il database MySQL su Aiven include le seguenti tabelle:

| Tabella | Descrizione | Campi Principali |
|---------|-------------|------------------|
| **Pilota** | Informazioni piloti certificati | ID, Nome, Cognome, Turno, Brevetto |
| **Drone** | Flotta droni disponibili | ID, Modello, Capacita, Batteria |
| **Missioni** | Dettagli missioni di consegna | ID, DataMissione, Stato, Valutazione, IdDrone, IdPilota |
| **Utente** | Clienti e amministratori | ID, Nome, Mail, Password, Ruolo |
| **Ordine** | Ordini dei clienti | ID, Tipo, PesoTotale, IndirizzoDestinazione, ID_Missione |
| **Prodotto** | Catalogo prodotti (100 item) | ID, nome, peso, categoria |
| **Contiene** | Relazione prodotti-ordini | ID_Prodotto, ID_Ordine, Quantita |
| **Traccia** | Tracciamento GPS in tempo reale | ID_Drone, ID_Missione, Latitudine, Longitudine, TIMESTAMP |

**Relazioni:**
- Un **Drone** può avere molte **Missioni**
- Un **Pilota** può controllare molte **Missioni**
- Un **Ordine** contiene molti **Prodotti** (tramite **Contiene**)
- Una **Missione** genera molte **Tracce** GPS

## 🔐 Sicurezza

- Le password nel database sono in chiaro (solo per sviluppo/test)
- **IMPORTANTE**: In produzione implementare hashing (bcrypt/argon2)
- Utilizzare HTTPS per le connessioni
- Proteggere il file `.env` (aggiunto a `.gitignore`)
- Implementare rate limiting sulle API

## 🐛 Troubleshooting

### ❌ Errore di connessione al database

**Sintomo:** `Errore durante la connessione a MySQL`

**Soluzioni:**
1. Verifica le credenziali nel file `.env` (host, port, user, password)
2. Controlla che il servizio Aiven sia **attivo** e online
3. Verifica che il tuo IP sia **whitelisted** su Aiven (Security > Allowed IP addresses)
4. Controlla il firewall Windows/antivirus

### ❌ ModuleNotFoundError

**Sintomo:** `ModuleNotFoundError: No module named 'flask'`

**Soluzione:**
```bash
pip install -r requirements.txt
```

Se usi ambienti virtuali:
```bash
python -m venv venv
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### ❌ Porta 5000 già in uso

**Sintomo:** `Address already in use`

**Soluzione:** Modifica la porta nel file `.env`:
```env
PORT=5001
```

### ❌ ImportError: cannot import name 'app' from 'backend'

**Sintomo:** Errore durante l'import in `run.py`

**Soluzione:** Assicurati che i file siano nella struttura corretta:
```
droni/
├── backend/
│   ├── __init__.py   ← Deve esistere
│   ├── app.py
│   └── db.py
└── run.py
```

### ❌ CORS errors nel browser

**Sintomo:** `Access-Control-Allow-Origin` error

**Soluzione:** Flask-CORS è già configurato in `app.py`. Se persiste, verifica che sia installato:
```bash
pip install Flask-CORS
```

## 🌐 Collegare Frontend (HTML/JS) alle API

### Struttura Frontend Consigliata

Crea le cartelle `static/` e `templates/` nella root del progetto:

```
droni/
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js       ← JavaScript per chiamate API
│   └── img/
└── templates/
    └── index.html        ← HTML principale
```

### Esempio di chiamata API con JavaScript

**File: `static/js/app.js`**
```javascript
// Carica tutti i droni
async function caricaDroni() {
  try {
    const response = await fetch('http://localhost:5000/api/droni');
    const droni = await response.json();
    console.log(droni);
    // Usa i dati per popolare la pagina
  } catch (error) {
    console.error('Errore:', error);
  }
}

// Traccia missione in tempo reale
async function tracciaMissione(idMissione) {
  const response = await fetch(`http://localhost:5000/api/tracce/ultima/${idMissione}`);
  const posizione = await response.json();
  // Aggiorna la mappa con lat/long
}

// Chiama al caricamento della pagina
caricaDroni();
```

### Servire file HTML con Flask

Flask servirà automaticamente:
- File HTML da `templates/`
- File statici (CSS, JS, img) da `static/`

Aggiungi route in `backend/app.py` per servire le pagine HTML.

## 📚 Sviluppi Futuri

- [ ] **Frontend SPA** con JavaScript vanilla o React
- [ ] **Mappa interattiva** (Google Maps / Leaflet.js) per tracking droni
- [ ] **WebSocket** per aggiornamenti posizione in tempo reale
- [ ] **Dashboard amministratore** per gestione completa
- [ ] **Machine Learning** per analisi predittive (carico ottimale, tempi consegna)
- [ ] **Sistema di notifiche** push/email
- [ ] **Mobile App** nativa (React Native / Flutter)
- [ ] **Autenticazione JWT** invece di session-based
- [ ] **Password hashing** con bcrypt
- [ ] **Rate limiting** sulle API
- [ ] **Docker** containerization per deployment

## 🎓 Informazioni sul Progetto

Questo è un progetto completo per il corso di **Gestione Database e Sviluppo Web** che implementa:

✅ Modello ER completo  
✅ Schema relazionale normalizzato  
✅ Database MySQL su cloud (Aiven)  
✅ Backend REST API con Flask  
✅ Gestione CRUD completa  
✅ Sistema di tracking GPS  
✅ Autenticazione utenti  
✅ Statistiche e report  

## 👥 Autori

Progetto sviluppato per il corso di gestione database e sviluppo web - Anno Accademico 2025.

## 📄 Licenza

Progetto didattico - Tutti i diritti riservati.

## 🆘 Supporto

Per domande o problemi:
- Consulta la sezione **Troubleshooting** sopra
- Verifica che tutte le dipendenze siano installate
- Controlla i log del server Flask
- Apri una issue su GitHub

## ⚠️ Note Importanti

- **Sicurezza**: Le password nel database sono in **chiaro** (solo per sviluppo/test)
- **Produzione**: Implementare hashing password, HTTPS, rate limiting, JWT
- **`.env`**: NON committare mai il file `.env` su GitHub (aggiungilo a `.gitignore`)
- **Aiven**: Ricorda di whitelistare il tuo IP per accedere al database
- **CORS**: Già configurato per permettere richieste cross-origin dal frontend

---

**🚀 Pronto per partire! Avvia il server con `python run.py` e buon coding!**
