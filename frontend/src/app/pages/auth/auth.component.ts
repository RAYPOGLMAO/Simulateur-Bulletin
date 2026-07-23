import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab: 'signin' | 'signup' = 'signin';

  signInEmail = '';
  signInPassword = '';
  signInError = '';
  signInPasswordVisible = false;
  signInLoading = false;

  signUpFirstName = '';
  signUpLastName = '';
  signUpEmail = '';
  signUpPassword = '';
  signUpError = '';
  signUpPasswordVisible = false;
  signUpLoading = false;

  uploadedAvatarDataUrl: string | null = null;

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'signup') this.activeTab = 'signup';
  }

  switchTab(tab: 'signin' | 'signup'): void {
    this.activeTab = tab;
    this.router.navigate([], { relativeTo: this.route, queryParams: { mode: tab }, replaceUrl: true });
  }

  togglePasswordVisibility(which: 'signin' | 'signup'): void {
    if (which === 'signin') this.signInPasswordVisible = !this.signInPasswordVisible;
    else this.signUpPasswordVisible = !this.signUpPasswordVisible;
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toastService.show('Merci de choisir un fichier image.'); return; }
    const reader = new FileReader();
    reader.onload = () => { this.uploadedAvatarDataUrl = reader.result as string; };
    reader.readAsDataURL(file);
  }

  submitSignIn(): void {
    const email = this.signInEmail.trim();
    const password = this.signInPassword;
    if (!email || !password) {
      this.signInError = 'Merci de renseigner votre email et votre mot de passe.';
      return;
    }
    this.signInError = '';
    this.signInLoading = true;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.signInLoading = false;
        this.redirectAfterAuth();
      },
      error: (err) => {
        this.signInLoading = false;
        this.signInError = err.error?.error || 'Erreur de connexion au serveur.';
      }
    });
  }

  submitSignUp(): void {
    const firstName = this.signUpFirstName.trim();
    const lastName = this.signUpLastName.trim();
    const email = this.signUpEmail.trim();
    const password = this.signUpPassword;
    if (!firstName || !email || !password) {
      this.signUpError = 'Merci de compléter au minimum le prénom, l\'email et le mot de passe.';
      return;
    }
    if (password.length < 6) {
      this.signUpError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    this.signUpError = '';
    this.signUpLoading = true;
    const name = lastName ? `${firstName} ${lastName}` : firstName;
    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.signUpLoading = false;
        this.redirectAfterAuth();
      },
      error: (err) => {
        this.signUpLoading = false;
        this.signUpError = err.error?.error || 'Erreur de connexion au serveur.';
      }
    });
  }

  private redirectAfterAuth(): void {
    this.toastService.show('Connexion réussie.');
    setTimeout(() => this.router.navigateByUrl('/dashboard'), 600);
  }
}
