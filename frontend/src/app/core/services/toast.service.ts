import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<string>('');
  readonly visible = signal<boolean>(false);
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  show(message: string): void {
    this.message.set(message);
    this.visible.set(true);
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.visible.set(false), 2200);
  }
}
