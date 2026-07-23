# Simulateur-Bulletin

Simulateur de Bulletin de Paie et Calcul des Taxes

## Project Structure

- `frontend/` - Angular application (UI)
- `backend/` - Node.js/Express API server
- `database/` - MySQL schema

## Getting Started

### Backend

```bash
cd backend
npm install
cp ../.env.example ../.env   # configure MySQL credentials
npm run dev
```

### Frontend

```bash
npm install -g @angular/cli
cd frontend
npm install
ng serve --open
```
