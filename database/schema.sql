CREATE DATABASE IF NOT EXISTS simulateurbulletin;
USE simulateurbulletin;

CREATE TABLE IF NOT EXISTS simulations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    salary_brut DECIMAL(10, 2) NOT NULL,
    primes DECIMAL(10, 2) DEFAULT 0,
    indemnites DECIMAL(10, 2) DEFAULT 0,
    enfants_charge INT DEFAULT 0,
    cnss_salarial DECIMAL(10, 2) DEFAULT 0,
    cmr_salarial DECIMAL(10, 2) DEFAULT 0,
    amg_salarial DECIMAL(10, 2) DEFAULT 0,
    cotisations_salariales DECIMAL(10, 2) DEFAULT 0,
    cnss_patronal DECIMAL(10, 2) DEFAULT 0,
    cmr_patronal DECIMAL(10, 2) DEFAULT 0,
    amg_patronal DECIMAL(10, 2) DEFAULT 0,
    cotisations_patronales DECIMAL(10, 2) DEFAULT 0,
    impot_revenu DECIMAL(10, 2) DEFAULT 0,
    salary_net DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
