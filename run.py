"""
Script per avviare il server Flask
"""
from backend.app import app
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5001)) # Ho cambiato la porta predefinita a 5001
    app.run(host=host, port=port, debug=True)
