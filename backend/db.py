import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

class Database:
    def __init__(self):
        self.host = os.getenv('DB_HOST')
        db_port_str = os.getenv('DB_PORT')
        if not db_port_str:
            print("\n\nATTENZIONE: La variabile d'ambiente DB_PORT non è impostata. Verrà usata la porta di default 3306. Controlla il tuo file .env se usi un database remoto come Aiven.\n\n")
            self.port = 3306
        else:
            self.port = int(db_port_str)

        self.database = os.getenv('DB_NAME')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        self.connection = None
    
    def connect(self):
        """Crea una connessione al database"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
                ssl_disabled=False
            )
            if self.connection.is_connected():
                print("Connessione al database MySQL riuscita")
        except Error as e:
            print(f"Errore durante la connessione a MySQL: {e}")
            self.connection = None # Assicura che la connessione sia None in caso di errore
            raise ConnectionError(f"Connessione al database fallita: {e}") from e
    
    def disconnect(self):
        """Chiude la connessione al database"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Connessione al database MySQL chiusa")
    
    def execute_query(self, query, params=None):
        """Esegue una query di modifica (INSERT, UPDATE, DELETE)"""
        if not self.connection:
            raise ConnectionError("Connessione al database non disponibile. Controllare le credenziali e la raggiungibilità del server.")

        cursor = self.connection.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            self.connection.commit()
            return cursor.lastrowid
        except Error as e:
            print(f"Errore durante l'esecuzione della query: {e}")
            return None
        finally:
            cursor.close()
    
    def fetch_query(self, query, params=None):
        """Esegue una query di lettura (SELECT) e restituisce i risultati"""
        if not self.connection:
            raise ConnectionError("Connessione al database non disponibile. Controllare le credenziali e la raggiungibilità del server.")

        cursor = self.connection.cursor(dictionary=True)
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            result = cursor.fetchall()
            return result
        except Error as e:
            print(f"Errore durante l'esecuzione della query: {e}")
            return None
        finally:
            cursor.close()
    
    def fetch_one(self, query, params=None):
        """Esegue una query di lettura (SELECT) e restituisce un singolo risultato"""
        if not self.connection:
            raise ConnectionError("Connessione al database non disponibile. Controllare le credenziali e la raggiungibilità del server.")

        cursor = self.connection.cursor(dictionary=True)
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            result = cursor.fetchone()
            return result
        except Error as e:
            print(f"Errore durante l'esecuzione della query: {e}")
            return None
        finally:
            cursor.close()
