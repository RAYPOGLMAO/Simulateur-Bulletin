Create database simulateurbulletin;
USE simulateurbulletin;

CREATE TABLE users (
   
);

create table simualtions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    salary_brut DECIMAL(10, 2) NOT NULL,
    primes DECIMAL(10, 2) NOT NULL,
    enfants INT NOT NULL,
    cotisations DECIMAL(10, 2) NOT NULL,
    impot DECIMAL(10, 2) NOT NULL,
    salary_net DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

