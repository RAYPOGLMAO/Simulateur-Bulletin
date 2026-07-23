import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
import { HistoryService } from '../../core/services/history.service';
import { BudgetService } from '../../core/services/budget.service';
import { ToastService } from '../../core/services/toast.service';
import { HistoryEntry } from '../../core/models/budget.model';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

interface RingStat {
  label: string;
  amount: number;
  color: string;
  pct: number;
  circumference: number;
  offset: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, SidebarComponent, ThemeToggleComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trendChartCanvas') trendChartCanvas?: ElementRef<HTMLCanvasElement>;

  private historyService = inject(HistoryService);
  private budgetService = inject(BudgetService);
  private toastService = inject(ToastService);

  history: HistoryEntry[] = [];
  latest: HistoryEntry | null = null;

  ringStats: RingStat[] = [];
  private chart?: Chart;
  private readonly ringRadius = 42;

  fmt(amount: number): string {
    return this.budgetService.formatDT(amount);
  }

  ngAfterViewInit(): void {
    this.historyService.load().subscribe({
      next: () => {
        this.history = this.historyService.list();
        this.latest = this.history.length ? this.history[this.history.length - 1] : null;
        if (!this.latest) return;
        this.buildRingStats();
        this.renderTrendChart();
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildRingStats(): void {
    const net = this.latest!.result.netSalary || 0;
    const circumference = 2 * Math.PI * this.ringRadius;
    const items = [
      { label: 'Factures', amount: this.latest!.result.billsTotal, color: '#06b6d4' },
      { label: 'Dépenses courantes', amount: this.latest!.result.livingExpensesTotal, color: '#22c55e' },
      { label: 'Enfants, santé & loisirs', amount: this.latest!.result.otherAllocationsTotal, color: '#6366f1' }
    ];
    this.ringStats = items.map(item => {
      const pct = net > 0 ? Math.round((item.amount / net) * 100) : 0;
      const clampedPct = Math.max(0, Math.min(100, pct));
      const offset = circumference * (1 - clampedPct / 100);
      return { ...item, pct, circumference, offset };
    });
  }

  private renderTrendChart(): void {
    if (!this.trendChartCanvas) return;
    const recent = this.history.slice(-8);
    const labels = recent.map(entry => entry.date.split(' ')[0]);
    const netSeries = recent.map(entry => Math.round(entry.result.netSalary));

    this.chart?.destroy();
    this.chart = new Chart(this.trendChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Revenu net', data: netSeries, backgroundColor: '#3b82f6', borderRadius: 6, maxBarThickness: 46 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#71717a', font: { size: 11 } } },
          y: { grid: { color: 'rgba(120,120,130,.15)' }, ticks: { color: '#71717a', font: { size: 11 } } }
        }
      }
    });
  }

  exportJson(): void {
    const data = JSON.stringify(this.historyService.list(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paiesim-historique.json';
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.show('Export JSON téléchargé.');
  }
}
