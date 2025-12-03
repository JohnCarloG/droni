-- ============================================
-- CREATE DATABASE E TABELLE CON AUTO_INCREMENT
-- ============================================

CREATE DATABASE IF NOT EXISTS Droni;
USE Droni;

-- ============================================
-- CREATE TABLE PILOTA
-- ============================================
CREATE TABLE IF NOT EXISTS Pilota (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL,
    Cognome VARCHAR(50) NOT NULL,
    Turno ENUM('Mattina', 'Pomeriggio', 'Sera') NOT NULL,
    Brevetto VARCHAR(20) NOT NULL
);

-- ============================================
-- CREATE TABLE DRONE
-- ============================================
CREATE TABLE IF NOT EXISTS Drone (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Modello VARCHAR(50) NOT NULL,
    Capacita DECIMAL(5,2) NOT NULL,
    Batteria INT NOT NULL,
    CHECK (Batteria >= 0 AND Batteria <= 100)
);

-- ============================================
-- CREATE TABLE MISSIONI
-- ============================================
CREATE TABLE IF NOT EXISTS Missioni (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    DataMissione DATE NOT NULL,
    Ora TIME NOT NULL,
    LatPrelievo DECIMAL(10,7) NOT NULL,
    LongPrelievo DECIMAL(11,7) NOT NULL,
    LatConsegna DECIMAL(10,7) NOT NULL,
    LongConsegna DECIMAL(11,7) NOT NULL,
    Valutazione INT,
    Commento VARCHAR(255),
    IdDrone INT NOT NULL,
    IdPilota INT NOT NULL,
    Stato ENUM('programmata', 'in corso', 'completata', 'annullata') NOT NULL,
    CHECK (Valutazione >= 1 AND Valutazione <= 10),
    CONSTRAINT FK_Missioni_Drone FOREIGN KEY (IdDrone) REFERENCES Drone(ID),
    CONSTRAINT FK_Missioni_Pilota FOREIGN KEY (IdPilota) REFERENCES Pilota(ID)
);

-- ============================================
-- CREATE TABLE UTENTE
-- ============================================
CREATE TABLE IF NOT EXISTS Utente (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Mail VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Ruolo VARCHAR(50) NOT NULL
);

-- ============================================
-- CREATE TABLE ORDINE
-- ============================================
CREATE TABLE IF NOT EXISTS Ordine (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(50) NOT NULL,
    PesoTotale DECIMAL(10,2) NOT NULL,
    Orario DATETIME NOT NULL,
    IndirizzoDestinazione VARCHAR(255) NOT NULL,
    ID_Missione INT NOT NULL,
    ID_Utente INT NOT NULL,
    CONSTRAINT FK_Ordine_Missioni FOREIGN KEY (ID_Missione) REFERENCES Missioni(ID),
    CONSTRAINT FK_Ordine_Utente FOREIGN KEY (ID_Utente) REFERENCES Utente(ID)
);

-- ============================================
-- CREATE TABLE PRODOTTO
-- ============================================
CREATE TABLE IF NOT EXISTS Prodotto (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    peso DECIMAL(10,3) NOT NULL,
    categoria VARCHAR(50) NOT NULL
);

-- ============================================
-- CREATE TABLE CONTIENE (Chiave composta)
-- ============================================
CREATE TABLE IF NOT EXISTS Contiene (
    ID_Prodotto INT NOT NULL,
    ID_Ordine INT NOT NULL,
    Quantita INT NOT NULL DEFAULT 1,
    PRIMARY KEY (ID_Prodotto, ID_Ordine),
    CONSTRAINT FK_Contiene_Prodotto FOREIGN KEY (ID_Prodotto) REFERENCES Prodotto(ID),
    CONSTRAINT FK_Contiene_Ordine FOREIGN KEY (ID_Ordine) REFERENCES Ordine(ID)
);

-- ============================================
-- CREATE TABLE TRACCIA (Chiave composta)
-- ============================================
CREATE TABLE IF NOT EXISTS Traccia (
    ID_Drone INT NOT NULL,
    ID_Missione INT NOT NULL,
    Latitudine DECIMAL(10,7) NOT NULL,
    Longitudine DECIMAL(11,7) NOT NULL,
    TIMESTAMP DATETIME NOT NULL,
    PRIMARY KEY (ID_Drone, ID_Missione, TIMESTAMP),
    CONSTRAINT FK_Traccia_Drone FOREIGN KEY (ID_Drone) REFERENCES Drone(ID),
    CONSTRAINT FK_Traccia_Missioni FOREIGN KEY (ID_Missione) REFERENCES Missioni(ID)
);