import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, SidebarComponent, ThemeToggleComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  firstName = this.authService.user()?.firstName ?? '';
  lastName = this.authService.user()?.lastName ?? '';
  email = this.authService.user()?.email ?? '';
  avatarDataUrl: string | null = this.authService.user()?.avatar ?? null;

  newPassword = '';
  confirmPassword = '';

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toastService.show('Merci de choisir un fichier image.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarDataUrl = reader.result as string;
      this.authService.updateUser({ avatar: this.avatarDataUrl });
      this.toastService.show('Photo de profil mise à jour.');
    };
    reader.readAsDataURL(file);
  }

  saveInfo(): void {
    this.authService.updateUser({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      avatar: this.avatarDataUrl
    });
    this.toastService.show('Informations mises à jour.');
  }

  savePassword(): void {
    if (!this.newPassword || this.newPassword.length < 8) {
      this.toastService.show('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.show('Les deux mots de passe ne correspondent pas.');
      return;
    }
    this.newPassword = '';
    this.confirmPassword = '';
    this.toastService.show('Mot de passe mis à jour.');
  }

  selectTheme(theme: 'light' | 'dark'): void {
    this.themeService.set(theme);
  }

  logOut(): void {
    this.authService.clearUser();
    this.toastService.show('Vous êtes déconnecté.');
    setTimeout(() => this.router.navigateByUrl('/dashboard'), 500);
  }
}
