import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  initialOf(name: string | undefined | null): string {
    return (name || 'A')[0].toUpperCase();
  }

  logOut(): void {
    this.authService.clearUser();
    this.toastService.show('Vous êtes déconnecté.');
    setTimeout(() => this.router.navigateByUrl('/dashboard'), 500);
  }
}
