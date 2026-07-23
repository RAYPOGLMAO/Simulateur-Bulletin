import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'bulletin-paie',
    loadComponent: () => import('./pages/bulletin-paie/bulletin-paie.component').then(m => m.BulletinPaieComponent)
  },
  {
    path: 'historique',
    loadComponent: () => import('./pages/historique/historique.component').then(m => m.HistoriqueComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
