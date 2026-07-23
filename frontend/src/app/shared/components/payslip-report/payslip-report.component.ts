import { Component, inject, Input } from '@angular/core';
import { BudgetInput, BudgetResult } from '../../../core/models/budget.model';
import { BudgetService } from '../../../core/services/budget.service';

@Component({
  selector: 'app-payslip-report',
  standalone: true,
  templateUrl: './payslip-report.component.html'
})
export class PayslipReportComponent {
  @Input({ required: true }) input!: BudgetInput;
  @Input({ required: true }) result!: BudgetResult;

  private budgetService = inject(BudgetService);
  today = new Date().toLocaleDateString('fr-FR');

  fmt(amount: number): string {
    return this.budgetService.formatDT(amount);
  }
}
