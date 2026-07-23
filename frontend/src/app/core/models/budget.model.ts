export interface BudgetInput {
  employeeName: string;
  familyStatus: 'celibataire' | 'marie';
  dependentChildren: number;
  baseSalary: number;
  taxableBonuses: number;
  allowances: number;
  overtimeHours: number;
  overtimeRate: number;
  cnssRate: number;
  healthInsurancePremium: number;
  loanRepayment: number;
  electricityBill: number;
  waterBill: number;
  internetBill: number;
  groceriesExpense: number;
  tuitionExpense: number;
  rentExpense: number;
  transportationExpense: number;
  kidsSchoolExpense: number;
  medicationCost: number;
  medicationReimbursementRate: number;
  vacationBudget: number;
  savingsAmount: number;
}

export interface BudgetResult {
  hourlyRate: number;
  overtimeAmount: number;
  cnssBase: number;
  cnssContribution: number;
  taxableGross: number;
  flatDeduction: number;
  familyDeduction: number;
  monthlyTaxableBase: number;
  yearlyTaxableBase: number;
  yearlyIncomeTax: number;
  monthlyIncomeTax: number;
  solidarityContribution: number;
  grossTotal: number;
  payrollDeductions: number;
  netSalary: number;
  billsTotal: number;
  livingExpensesTotal: number;
  netMedicationCost: number;
  fixedChargesTotal: number;
  otherAllocationsTotal: number;
  totalOutflows: number;
  disposableIncome: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  input: BudgetInput;
  result: BudgetResult;
}

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

export interface BreakdownCategory {
  label: string;
  amount: number;
  color: string;
}

export function defaultBudgetInput(): BudgetInput {
  return {
    employeeName: '',
    familyStatus: 'celibataire',
    dependentChildren: 0,
    baseSalary: 1200,
    taxableBonuses: 0,
    allowances: 0,
    overtimeHours: 0,
    overtimeRate: 0.25,
    cnssRate: 9.18,
    healthInsurancePremium: 0,
    loanRepayment: 0,
    electricityBill: 0,
    waterBill: 0,
    internetBill: 0,
    groceriesExpense: 0,
    tuitionExpense: 0,
    rentExpense: 0,
    transportationExpense: 0,
    kidsSchoolExpense: 0,
    medicationCost: 0,
    medicationReimbursementRate: 70,
    vacationBudget: 0,
    savingsAmount: 0
  };
}
