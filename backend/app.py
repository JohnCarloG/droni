from flask import Flask, jsonify, request, session, render_template, g
from flask_cors import CORS
from backend.db import Database
import os
from dotenv import load_dotenv
from datetime import datetime

# Carica variabili d'ambiente
load_dotenv()

# Configura Flask con le cartelle template e static
app = Flask(__name__, 
            template_folder='../templates',
            static_folder='../static')
app.secret_key = os.getenv('SECRET_KEY', 'default-secret-key-change-in-production')

# Abilita CORS per permettere richieste dal frontend
CORS(app)

# ============================================
# GESTIONE DATABASE EFFICIENTE
# ============================================

def get_db():
    """
    Apre una nuova connessione al database se non ce n'è una per la richiesta corrente.
    """
    if 'db' not in g:
        g.db = Database()
        g.db.connect()
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    """Chiude la connessione al database alla fine della richiesta."""
    db = g.pop('db', None)
    if db is not None:
        db.disconnect()

# ============================================
# ROUTE PAGINE WEB (SPA)
# ============================================

@app.route('/')
def index():
    """Pagina principale - Cliente"""
    return render_template('index.html')

@app.route('/admin')
def admin():
    """Dashboard amministrativa"""
    return render_template('admin.html')

# ============================================
# ROUTE DI TEST API
# ============================================

@app.route('/api')
def api_home():
    return jsonify({
        'message': 'API Sistema Gestione Droni',
        'status': 'online',
        'version': '1.0'
    })

@app.route('/api/test-db')
def test_db():
    """Endpoint di test per verificare la connessione al database"""
    db = get_db()
    if db.connection:
        result = db.fetch_one("SELECT COUNT(*) as count FROM Drone")
        return jsonify({
            'status': 'success',
            'message': 'Connessione al database riuscita',
            'droni_count': result['count'] if result else 0
        })
    return jsonify({
        'status': 'error',
        'message': 'Connessione al database fallita'
    }), 500

# ============================================
# ENDPOINTS DRONI
# ============================================

@app.route('/api/droni', methods=['GET'])
def get_droni():
    """Restituisce tutti i droni"""
    db = get_db()
    query = "SELECT * FROM Drone"
    droni = db.fetch_query(query)
    return jsonify(droni)

@app.route('/api/droni/<int:id>', methods=['GET'])
def get_drone(id):
    """Restituisce un drone specifico"""
    db = get_db()
    query = "SELECT * FROM Drone WHERE ID = %s"
    drone = db.fetch_one(query, (id,))
    
    if drone:
        return jsonify(drone)
    return jsonify({'error': 'Drone non trovato'}), 404

@app.route('/api/droni', methods=['POST'])
def create_drone():
    """Crea un nuovo drone"""
    data = request.get_json()
    
    db = get_db()
    query = """
        INSERT INTO Drone (Modello, Capacita, Batteria) 
        VALUES (%s, %s, %s)
    """
    drone_id = db.execute_query(query, (
        data['Modello'],
        data['Capacita'],
        data['Batteria']
    ))
    
    return jsonify({
        'message': 'Drone creato con successo',
        'id': drone_id
    }), 201

@app.route('/api/droni/<int:id>', methods=['PUT'])
def update_drone(id):
    """Aggiorna un drone esistente"""
    data = request.get_json()
    
    db = get_db()
    query = """
        UPDATE Drone 
        SET Modello = %s, Capacita = %s, Batteria = %s 
        WHERE ID = %s
    """
    db.execute_query(query, (
        data['Modello'],
        data['Capacita'],
        data['Batteria'],
        id
    ))
    
    return jsonify({'message': 'Drone aggiornato con successo'})

@app.route('/api/droni/<int:id>', methods=['DELETE'])
def delete_drone(id):
    """Elimina un drone"""
    db = get_db()
    query = "DELETE FROM Drone WHERE ID = %s"
    db.execute_query(query, (id,))
    
    return jsonify({'message': 'Drone eliminato con successo'})

# ============================================
# ENDPOINTS PILOTI
# ============================================

@app.route('/api/piloti', methods=['GET'])
def get_piloti():
    """Restituisce tutti i piloti con conteggio missioni"""
    db = get_db()
    query = """
        SELECT p.*, 
               COUNT(m.ID) as NumMissioni,
               AVG(m.Valutazione) as MediaValutazione
        FROM Pilota p
        LEFT JOIN Missioni m ON p.ID = m.IdPilota
        GROUP BY p.ID
    """
    piloti = db.fetch_query(query)
    return jsonify(piloti)

@app.route('/api/piloti/<int:id>', methods=['GET'])
def get_pilota(id):
    """Restituisce un pilota specifico"""
    db = get_db()
    query = "SELECT * FROM Pilota WHERE ID = %s"
    pilota = db.fetch_one(query, (id,))
    
    if pilota:
        return jsonify(pilota)
    return jsonify({'error': 'Pilota non trovato'}), 404

@app.route('/api/piloti', methods=['POST'])
def create_pilota():
    """Crea un nuovo pilota"""
    data = request.get_json()
    
    db = get_db()
    query = """
        INSERT INTO Pilota (Nome, Cognome, Email, NumeroLicenza) 
        VALUES (%s, %s, %s, %s)
    """
    pilota_id = db.execute_query(query, (
        data['Nome'],
        data['Cognome'],
        data['Email'],
        data['NumeroLicenza']
    ))
    
    return jsonify({
        'success': True,
        'id': pilota_id,
        'message': 'Pilota creato con successo'
    }), 201

@app.route('/api/piloti/<int:id>', methods=['DELETE'])
def delete_pilota(id):
    """Elimina un pilota"""
    db = get_db()
    
    # Verifica se il pilota ha missioni
    check_query = "SELECT COUNT(*) as count FROM Missioni WHERE IdPilota = %s"
    result = db.fetch_one(check_query, (id,))
    
    if result and result['count'] > 0:
        return jsonify({'error': 'Impossibile eliminare: pilota con missioni assegnate'}), 400
    
    query = "DELETE FROM Pilota WHERE ID = %s"
    db.execute_query(query, (id,))
    
    return jsonify({
        'success': True,
        'message': 'Pilota eliminato con successo'
    })

# ============================================
# ENDPOINTS MISSIONI
# ============================================

@app.route('/api/missioni', methods=['GET'])
def get_missioni():
    """Restituisce tutte le missioni con informazioni su drone e pilota"""
    db = get_db()
    query = """
        SELECT m.*, 
               d.Modello as DroneModello, 
               p.Nome as PilotaNome, 
               p.Cognome as PilotaCognome
        FROM Missioni m
        JOIN Drone d ON m.IdDrone = d.ID
        JOIN Pilota p ON m.IdPilota = p.ID
        ORDER BY m.DataMissione DESC, m.Ora DESC
    """
    missioni = db.fetch_query(query)
    
    # Converti date e time in stringhe
    for missione in missioni:
        if missione['DataMissione']:
            missione['DataMissione'] = missione['DataMissione'].strftime('%Y-%m-%d')
        if missione['Ora']:
            missione['Ora'] = str(missione['Ora'])
    
    return jsonify(missioni)

@app.route('/api/missioni/<int:id>', methods=['GET'])
def get_missione(id):
    """Restituisce una missione specifica"""
    db = get_db()
    query = """
        SELECT m.*, 
               d.Modello as DroneModello, 
               p.Nome as PilotaNome, 
               p.Cognome as PilotaCognome
        FROM Missioni m
        JOIN Drone d ON m.IdDrone = d.ID
        JOIN Pilota p ON m.IdPilota = p.ID
        WHERE m.ID = %s
    """
    missione = db.fetch_one(query, (id,))
    
    if missione:
        if missione['DataMissione']:
            missione['DataMissione'] = missione['DataMissione'].strftime('%Y-%m-%d')
        if missione['Ora']:
            missione['Ora'] = str(missione['Ora'])
        return jsonify(missione)
    return jsonify({'error': 'Missione non trovata'}), 404

@app.route('/api/missioni/stato/<stato>', methods=['GET'])
def get_missioni_by_stato(stato):
    """Restituisce le missioni filtrate per stato"""
    db = get_db()
    query = """
        SELECT m.*, 
               d.Modello as DroneModello, 
               p.Nome as PilotaNome, 
               p.Cognome as PilotaCognome
        FROM Missioni m
        JOIN Drone d ON m.IdDrone = d.ID
        JOIN Pilota p ON m.IdPilota = p.ID
        WHERE m.Stato = %s
        ORDER BY m.DataMissione DESC, m.Ora DESC
    """
    missioni = db.fetch_query(query, (stato,))
    
    for missione in missioni:
        if missione['DataMissione']:
            missione['DataMissione'] = missione['DataMissione'].strftime('%Y-%m-%d')
        if missione['Ora']:
            missione['Ora'] = str(missione['Ora'])
    
    return jsonify(missioni)

# ============================================
# ENDPOINTS TRACCE
# ============================================

@app.route('/api/tracce/missione/<int:id_missione>', methods=['GET'])
def get_tracce_missione(id_missione):
    """Restituisce tutte le tracce di una missione"""
    db = get_db()
    query = """
        SELECT * FROM Traccia 
        WHERE ID_Missione = %s 
        ORDER BY TIMESTAMP ASC
    """
    tracce = db.fetch_query(query, (id_missione,))
    
    # Converti timestamp in stringhe
    for traccia in tracce:
        if traccia['TIMESTAMP']:
            traccia['TIMESTAMP'] = traccia['TIMESTAMP'].strftime('%Y-%m-%d %H:%M:%S')
    
    return jsonify(tracce)

@app.route('/api/tracce/ultima/<int:id_missione>', methods=['GET'])
def get_ultima_traccia(id_missione):
    """Restituisce l'ultima posizione di un drone per una missione"""
    db = get_db()
    query = """
        SELECT * FROM Traccia 
        WHERE ID_Missione = %s 
        ORDER BY TIMESTAMP DESC 
        LIMIT 1
    """
    traccia = db.fetch_one(query, (id_missione,))
    
    if traccia:
        if traccia['TIMESTAMP']:
            traccia['TIMESTAMP'] = traccia['TIMESTAMP'].strftime('%Y-%m-%d %H:%M:%S')
        return jsonify(traccia)
    return jsonify({'error': 'Nessuna traccia trovata'}), 404

# ============================================
# ENDPOINTS ORDINI
# ============================================

@app.route('/api/ordini', methods=['GET'])
def get_ordini():
    """Restituisce tutti gli ordini"""
    db = get_db()
    query = """
        SELECT o.*, 
               u.Nome as ClienteNome, 
               u.Mail as ClienteMail,
               m.Stato as StatoMissione
        FROM Ordine o
        JOIN Utente u ON o.ID_Utente = u.ID
        JOIN Missioni m ON o.ID_Missione = m.ID
        ORDER BY o.Orario DESC
    """
    ordini = db.fetch_query(query)
    
    for ordine in ordini:
        if ordine['Orario']:
            ordine['Orario'] = ordine['Orario'].strftime('%Y-%m-%d %H:%M:%S')
    
    return jsonify(ordini)

@app.route('/api/ordini/utente/<int:id_utente>', methods=['GET'])
def get_ordini_utente(id_utente):
    """Restituisce gli ordini di un utente specifico"""
    db = get_db()
    query = """
        SELECT o.*, 
               m.Stato as StatoMissione,
               m.DataMissione,
               m.Ora as OraMissione
        FROM Ordine o
        JOIN Missioni m ON o.ID_Missione = m.ID
        WHERE o.ID_Utente = %s
        ORDER BY o.Orario DESC
    """
    ordini = db.fetch_query(query, (id_utente,))
    
    for ordine in ordini:
        if ordine['Orario']:
            ordine['Orario'] = ordine['Orario'].strftime('%Y-%m-%d %H:%M:%S')
        if ordine['DataMissione']:
            ordine['DataMissione'] = ordine['DataMissione'].strftime('%Y-%m-%d')
        if ordine['OraMissione']:
            ordine['OraMissione'] = str(ordine['OraMissione'])
    
    return jsonify(ordini)

@app.route('/api/ordini/<int:id>', methods=['GET'])
def get_ordine(id):
    """Restituisce un ordine specifico con i prodotti"""
    db = get_db()
    
    # Query per l'ordine
    query_ordine = """
        SELECT o.*, 
               u.Nome as ClienteNome, 
               u.Mail as ClienteMail,
               m.Stato as StatoMissione,
               m.ID as MissioneID
        FROM Ordine o
        JOIN Utente u ON o.ID_Utente = u.ID
        JOIN Missioni m ON o.ID_Missione = m.ID
        WHERE o.ID = %s
    """
    ordine = db.fetch_one(query_ordine, (id,))
    
    if ordine:
        if ordine['Orario']:
            ordine['Orario'] = ordine['Orario'].strftime('%Y-%m-%d %H:%M:%S')
        
        # Query per i prodotti dell'ordine
        query_prodotti = """
            SELECT p.*, c.Quantita
            FROM Prodotto p
            JOIN Contiene c ON p.ID = c.ID_Prodotto
            WHERE c.ID_Ordine = %s
        """
        prodotti = db.fetch_query(query_prodotti, (id,))
        ordine['Prodotti'] = prodotti
        return jsonify(ordine)
    
    return jsonify({'error': 'Ordine non trovato'}), 404

# ============================================
# ENDPOINTS PRODOTTI
# ============================================

@app.route('/api/prodotti', methods=['GET'])
def get_prodotti():
    """Restituisce tutti i prodotti"""
    db = get_db()
    query = "SELECT * FROM Prodotto"
    prodotti = db.fetch_query(query)
    return jsonify(prodotti)

@app.route('/api/prodotti/categoria/<categoria>', methods=['GET'])
def get_prodotti_by_categoria(categoria):
    """Restituisce i prodotti di una categoria specifica"""
    db = get_db()
    query = "SELECT * FROM Prodotto WHERE categoria = %s"
    prodotti = db.fetch_query(query, (categoria,))
    return jsonify(prodotti)

# ============================================
# ENDPOINTS UTENTI
# ============================================

@app.route('/api/utenti', methods=['GET'])
def get_utenti():
    """Restituisce tutti gli utenti (senza password)"""
    db = get_db()
    query = "SELECT ID, Nome, Mail, Ruolo FROM Utente"
    utenti = db.fetch_query(query)
    return jsonify(utenti)

@app.route('/api/login', methods=['POST'])
def login():
    """Endpoint per il login utente"""
    data = request.get_json()
    
    db = get_db()
    query = "SELECT * FROM Utente WHERE Mail = %s AND Password = %s"
    utente = db.fetch_one(query, (data['Mail'], data['Password']))
    
    if utente:
        # Salva l'utente nella sessione
        session['user_id'] = utente['ID']
        session['user_role'] = utente['Ruolo']
        
        return jsonify({
            'success': True,
            'user': {
                'ID': utente['ID'],
                'Nome': utente['Nome'],
                'Mail': utente['Mail'],
                'Ruolo': utente['Ruolo']
            }
        })
    
    return jsonify({
        'success': False,
        'message': 'Credenziali non valide'
    }), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Endpoint per il logout utente"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logout effettuato'})

# ============================================
# ENDPOINTS VALUTAZIONI
# ============================================

@app.route('/api/missioni/<int:id>/valutazione', methods=['POST'])
def add_valutazione(id):
    """Aggiunge una valutazione a una missione completata"""
    data = request.get_json()
    
    db = get_db()
    
    # Verifica che la missione sia completata
    check_query = "SELECT Stato FROM Missioni WHERE ID = %s"
    missione = db.fetch_one(check_query, (id,))
    
    if not missione:
        return jsonify({'error': 'Missione non trovata'}), 404
    
    if missione['Stato'] != 'completata':
        return jsonify({'error': 'Puoi valutare solo missioni completate'}), 400
    
    # Aggiorna la valutazione
    update_query = """
        UPDATE Missioni 
        SET Valutazione = %s, Commento = %s 
        WHERE ID = %s
    """
    db.execute_query(update_query, (
        data.get('Valutazione'),
        data.get('Commento', ''),
        id
    ))
    
    return jsonify({
        'success': True,
        'message': 'Valutazione aggiunta con successo'
    })

@app.route('/api/missioni/<int:id>/valutazione', methods=['GET'])
def get_valutazione(id):
    """Restituisce la valutazione di una missione"""
    db = get_db()
    query = "SELECT Valutazione, Commento FROM Missioni WHERE ID = %s"
    valutazione = db.fetch_one(query, (id,))
    
    if valutazione:
        return jsonify(valutazione)
    return jsonify({'error': 'Valutazione non trovata'}), 404

# ============================================
# ENDPOINTS STATISTICHE
# ============================================

@app.route('/api/statistiche/missioni', methods=['GET'])
def get_statistiche_missioni():
    """Restituisce statistiche sulle missioni"""
    db = get_db()
    
    query = """
        SELECT 
            Stato,
            COUNT(*) as Totale,
            AVG(Valutazione) as MediaValutazione
        FROM Missioni
        GROUP BY Stato
    """
    stats = db.fetch_query(query)
    
    return jsonify(stats)

@app.route('/api/statistiche/droni', methods=['GET'])
def get_statistiche_droni():
    """Restituisce statistiche sui droni"""
    db = get_db()
    
    query = """
        SELECT 
            d.ID,
            d.Modello,
            d.Batteria,
            COUNT(m.ID) as NumeroMissioni,
            AVG(m.Valutazione) as MediaValutazione
        FROM Drone d
        LEFT JOIN Missioni m ON d.ID = m.IdDrone
        GROUP BY d.ID, d.Modello, d.Batteria
        ORDER BY NumeroMissioni DESC
    """
    stats = db.fetch_query(query)
    
    return jsonify(stats)

@app.route('/api/statistiche/piloti', methods=['GET'])
def get_statistiche_piloti():
    """Restituisce statistiche sui piloti (top performers)"""
    db = get_db()
    
    query = """
        SELECT 
            p.ID,
            p.Nome,
            p.Cognome,
            COUNT(m.ID) as NumeroMissioni,
            AVG(m.Valutazione) as MediaValutazione,
            SUM(CASE WHEN m.Stato = 'completata' THEN 1 ELSE 0 END) as MissioniCompletate
        FROM Pilota p
        LEFT JOIN Missioni m ON p.ID = m.IdPilota
        GROUP BY p.ID, p.Nome, p.Cognome
        ORDER BY MediaValutazione DESC
    """
    stats = db.fetch_query(query)
    
    return jsonify(stats)

@app.route('/api/report/consegne', methods=['GET'])
def get_report_consegne():
    """Report sulle consegne per tipo"""
    db = get_db()
    
    query = """
        SELECT 
            o.Tipo,
            COUNT(*) as Totale,
            AVG(o.PesoTotale) as PesoMedio
        FROM Ordine o
        GROUP BY o.Tipo
    """
    report = db.fetch_query(query)
    
    return jsonify(report)

# ============================================
# ENDPOINTS ANALYTICS / ML
# ============================================

@app.route('/api/analytics/demand-prediction', methods=['GET'])
def get_demand_prediction():
    """Previsione domanda basata su dati storici"""
    db = get_db()
    
    # Calcola media ordini per settimana
    query = """
        SELECT 
            COUNT(*) as TotaleOrdini,
            COUNT(DISTINCT DATE(o.DataConsegna)) as GiorniAttivi
        FROM Ordine o
        WHERE o.DataConsegna IS NOT NULL
    """
    result = db.fetch_one(query)
    
    if result and result['GiorniAttivi'] > 0:
        media_giornaliera = result['TotaleOrdini'] / result['GiorniAttivi']
        previsione_settimanale = round(media_giornaliera * 7)
    else:
        previsione_settimanale = 0
    
    return jsonify({
        'previsione_settimanale': previsione_settimanale,
        'media_giornaliera': round(media_giornaliera, 1) if result else 0,
        'totale_storico': result['TotaleOrdini'] if result else 0
    })

@app.route('/api/analytics/route-analysis', methods=['GET'])
def get_route_analysis():
    """Analisi percorsi e tempi medi"""
    db = get_db()
    
    # Analizza tempi tra prima e ultima traccia
    query = """
        SELECT 
            m.ID,
            MIN(t.Timestamp) as InizioVolo,
            MAX(t.Timestamp) as FineVolo,
            COUNT(t.ID) as NumTracce
        FROM Missioni m
        JOIN Traccia t ON m.ID = t.IdMissione
        WHERE m.Stato = 'completata'
        GROUP BY m.ID
    """
    tracce = db.fetch_query(query)
    
    if tracce:
        # Calcola tempo medio in minuti (approssimativo)
        tempo_medio = len(tracce) * 5  # Ogni traccia ~ 5 min
    else:
        tempo_medio = 0
    
    return jsonify({
        'tempo_medio_consegna': tempo_medio,
        'missioni_analizzate': len(tracce) if tracce else 0,
        'tracce_totali': sum(t['NumTracce'] for t in tracce) if tracce else 0
    })

@app.route('/api/analytics/maintenance-prediction', methods=['GET'])
def get_maintenance_prediction():
    """Previsione manutenzione droni"""
    db = get_db()
    
    query = """
        SELECT 
            d.ID,
            d.Modello,
            d.Batteria,
            COUNT(m.ID) as NumMissioni
        FROM Drone d
        LEFT JOIN Missioni m ON d.ID = m.IdDrone
        GROUP BY d.ID, d.Modello, d.Batteria
    """
    droni = db.fetch_query(query)
    
    # Logica predittiva semplice
    risultati = []
    for d in droni:
        if d['Batteria'] < 30 or d['NumMissioni'] > 50:
            stato = 'critico'
        elif d['Batteria'] < 50 or d['NumMissioni'] > 30:
            stato = 'attenzione'
        else:
            stato = 'ok'
        
        risultati.append({
            'id': d['ID'],
            'modello': d['Modello'],
            'batteria': d['Batteria'],
            'missioni': d['NumMissioni'],
            'stato': stato
        })
    
    return jsonify(risultati)

@app.route('/api/analytics/sentiment', methods=['GET'])
def get_sentiment_analysis():
    """Analisi sentiment delle valutazioni"""
    db = get_db()
    
    query = """
        SELECT Valutazione, Commento
        FROM Missioni
        WHERE Valutazione IS NOT NULL
    """
    valutazioni = db.fetch_query(query)
    
    positivi = 0
    neutri = 0
    negativi = 0
    
    for v in valutazioni:
        if v['Valutazione'] >= 8:
            positivi += 1
        elif v['Valutazione'] >= 5:
            neutri += 1
        else:
            negativi += 1
    
    return jsonify({
        'positivi': positivi,
        'neutri': neutri,
        'negativi': negativi,
        'totale': len(valutazioni)
    })

# ============================================
# AVVIO SERVER
# ============================================
# Nota: Per avviare il server, usa run.py nella root del progetto
