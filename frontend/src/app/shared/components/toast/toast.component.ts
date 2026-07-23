import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast" [class.show]="toastService.visible()">{{ toastService.message() }}</div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
