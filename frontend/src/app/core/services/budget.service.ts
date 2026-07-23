import { Injectable } from '@angular/core';
import { BreakdownCategory, BudgetInput, BudgetResult } from '../models/budget.model';

const LEGAL_MONTHLY_HOURS = 173.33;

const TAX_BRACKETS = [
  { min: 0, max: 5000, rate: 0 },
  { min: 5000, max: 10000, rate: 0.26 },
  { min: 10000, max: 20000, rate: 0.28 },
  { min: 20000, max: 30000, rate: 0.32 },
  { min: 30000, max: 50000, rate: 0.35 },
  { min: 50000, max: Infinity, rate: 0.40 }
];

@Injectable({ providedIn: 'root' })
export class BudgetService {

  formatDT(amount: number): string {
    return (amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
  }

  computeBudget(input: BudgetInput): BudgetResult {
    const hourlyRate = input.baseSalary / LEGAL_MONTHLY_HOURS;
    const overtimeAmount = input.overtimeHours * hourlyRate * (1 + input.overtimeRate);

    const cnssBase = input.baseSalary + input.taxableBonuses + overtimeAmount;
    const cnssContribution = cnssBase * (input.cnssRate / 100);
    const taxableGross = cnssBase - cnssContribution;

    const flatDeduction = Math.min(taxableGross * 0.10, 2000 / 12);
    const countedChildren = Math.min(input.dependentChildren, 4);
    const familyDeduction = (input.familyStatus === 'marie' ? 300 / 12 : 0) + countedChildren * (100 / 12);

    const monthlyTaxableBase = Math.max(0, taxableGross - flatDeduction - familyDeduction);
    const yearlyTaxableBase = monthlyTaxableBase * 12;

    let yearlyIncomeTax = 0;
    for (const bracket of TAX_BRACKETS) {
      if (yearlyTaxableBase > bracket.min) {
        yearlyIncomeTax += (Math.min(yearlyTaxableBase, bracket.max) - bracket.min) * bracket.rate;
      }
    }
    const monthlyIncomeTax = yearlyIncomeTax / 12;
    const solidarityContribution = monthlyIncomeTax > 0 ? monthlyTaxableBase * 0.01 : 0;

    const grossTotal = input.baseSalary + input.taxableBonuses + overtimeAmount + input.allowances;
    const payrollDeductions = cnssContribution + monthlyIncomeTax + solidarityContribution;
    const netSalary = grossTotal - payrollDeductions;

    const billsTotal = input.electricityBill + input.waterBill + input.internetBill;
    const livingExpensesTotal = input.groceriesExpense + input.tuitionExpense + input.rentExpense + input.transportationExpense;
    const netMedicationCost = input.medicationCost * (1 - input.medicationReimbursementRate / 100);
    const fixedChargesTotal = input.healthInsurancePremium + input.loanRepayment + billsTotal;
    const otherAllocationsTotal = input.kidsSchoolExpense + netMedicationCost + input.vacationBudget + input.savingsAmount;
    const totalOutflows = fixedChargesTotal + livingExpensesTotal + otherAllocationsTotal;
    const disposableIncome = netSalary - totalOutflows;

    return {
      hourlyRate, overtimeAmount, cnssBase, cnssContribution, taxableGross, flatDeduction, familyDeduction,
      monthlyTaxableBase, yearlyTaxableBase, yearlyIncomeTax, monthlyIncomeTax, solidarityContribution,
      grossTotal, payrollDeductions, netSalary,
      billsTotal, livingExpensesTotal, netMedicationCost, fixedChargesTotal, otherAllocationsTotal,
      totalOutflows, disposableIncome
    };
  }

  buildBreakdownCategories(input: BudgetInput, result: BudgetResult): BreakdownCategory[] {
    return [
      { label: 'Impôt sur le revenu', amount: result.monthlyIncomeTax, color: '#ef4444' },
      { label: 'Cotisation CNSS', amount: result.cnssContribution, color: '#f97316' },
      { label: 'Assurance santé', amount: input.healthInsurancePremium, color: '#3b82f6' },
      { label: 'Remboursement crédit', amount: input.loanRepayment, color: '#a855f7' },
      { label: 'Factures (élec/eau/net)', amount: result.billsTotal, color: '#06b6d4' },
      { label: 'Alimentation', amount: input.groceriesExpense, color: '#22c55e' },
      { label: 'Scolarité / formation', amount: input.tuitionExpense, color: '#eab308' },
      { label: 'Loyer', amount: input.rentExpense, color: '#ec4899' },
      { label: 'Transport', amount: input.transportationExpense, color: '#84cc16' },
      { label: 'École des enfants', amount: input.kidsSchoolExpense, color: '#14b8a6' },
      { label: 'Médicaments (net CNSS)', amount: result.netMedicationCost, color: '#f43f5e' },
      { label: 'Vacances', amount: input.vacationBudget, color: '#6366f1' },
      { label: 'Épargne', amount: input.savingsAmount, color: '#0ea5e9' }
    ].filter(category => category.amount > 0);
  }
}
