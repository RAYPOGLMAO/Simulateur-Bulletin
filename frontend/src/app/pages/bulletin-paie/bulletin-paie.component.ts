import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BudgetService } from '../../core/services/budget.service';
import { HistoryService } from '../../core/services/history.service';
import { ToastService } from '../../core/services/toast.service';
import { BudgetInput, BudgetResult, defaultBudgetInput } from '../../core/models/budget.model';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { PayslipReportComponent } from '../../shared/components/payslip-report/payslip-report.component';

@Component({
  selector: 'app-bulletin-paie',
  standalone: true,
  imports: [FormsModule, SidebarComponent, ThemeToggleComponent, PayslipReportComponent],
  templateUrl: './bulletin-paie.component.html'
})
export class BulletinPaieComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private historyService = inject(HistoryService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  form: BudgetInput = defaultBudgetInput();

  lastComputedInput: BudgetInput | null = null;
  lastComputedResult: BudgetResult | null = null;

  ngOnInit(): void {
    const reuseId = this.route.snapshot.queryParamMap.get('reuse');
    if (reuseId) {
      const entry = this.historyService.findById(reuseId);
      if (entry) {
        this.form = { ...entry.input };
        this.toastService.show('Simulation rechargée dans le formulaire.');
      }
    }
  }

  calculate(): void {
    if (!this.form.baseSalary || this.form.baseSalary <= 0) {
      this.toastService.show('Veuillez saisir un salaire de base valide.');
      return;
    }
    const input: BudgetInput = { ...this.form, employeeName: this.form.employeeName.trim() || 'Salarié(e)' };
    const result = this.budgetService.computeBudget(input);
    this.lastComputedInput = input;
    this.lastComputedResult = result;
  }

  async copyDisposable(): Promise<void> {
    if (!this.lastComputedResult) return;
    try {
      await navigator.clipboard.writeText(this.budgetService.formatDT(this.lastComputedResult.disposableIncome));
      this.toastService.show('Montant disponible copié dans le presse-papiers.');
    } catch {
      this.toastService.show('Impossible de copier automatiquement.');
    }
  }

  print(): void {
    window.print();
  }

  saveSimulation(): void {
    if (!this.lastComputedInput || !this.lastComputedResult) return;
    this.historyService.add({
      id: Date.now().toString(36),
      date: new Date().toLocaleString('fr-FR'),
      input: this.lastComputedInput,
      result: this.lastComputedResult
    });
    this.toastService.show('Simulation enregistrée. Consultez le tableau de bord pour la synthèse.');
  }
}
