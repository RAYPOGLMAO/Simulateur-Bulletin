import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { BudgetService } from '../../core/services/budget.service';
import { ToastService } from '../../core/services/toast.service';
import { HistoryEntry } from '../../core/models/budget.model';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { PayslipReportComponent } from '../../shared/components/payslip-report/payslip-report.component';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [FormsModule, RouterLink, SidebarComponent, ThemeToggleComponent, PayslipReportComponent],
  templateUrl: './historique.component.html'
})
export class HistoriqueComponent {
  private historyService = inject(HistoryService);
  private budgetService = inject(BudgetService);
  private toastService = inject(ToastService);

  searchTerm = '';
  detailEntry: HistoryEntry | null = null;

  get fullList(): HistoryEntry[] {
    return this.historyService.list();
  }

  get filteredList(): HistoryEntry[] {
    const term = this.searchTerm.trim().toLowerCase();
    const list = term
      ? this.fullList.filter(item => item.input.employeeName.toLowerCase().includes(term))
      : this.fullList;
    return list.slice().reverse();
  }

  get statCount(): number {
    return this.fullList.length;
  }

  get statAverageNet(): string {
    if (!this.fullList.length) return '—';
    const values = this.fullList.map(item => item.result.netSalary || 0);
    return this.budgetService.formatDT(values.reduce((a, b) => a + b, 0) / values.length);
  }

  get statAverageDisposable(): string {
    if (!this.fullList.length) return '—';
    const values = this.fullList.map(item => item.result.disposableIncome || 0);
    return this.budgetService.formatDT(values.reduce((a, b) => a + b, 0) / values.length);
  }

  fmt(amount: number): string {
    return this.budgetService.formatDT(amount);
  }

  openDetail(entry: HistoryEntry): void {
    this.detailEntry = entry;
  }

  closeDetail(): void {
    this.detailEntry = null;
  }

  deleteEntry(id: string): void {
    this.historyService.remove(id);
    this.toastService.show('Simulation supprimée.');
  }

  clearAll(): void {
    if (!this.fullList.length) return;
    if (confirm("Vider tout l'historique des simulations ?")) {
      this.historyService.clear();
      this.toastService.show('Historique vidé.');
    }
  }
}
