export interface SalaryComponents {
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  providentFund: number;
  incomeTax: number;
  otherDeductions: number;
}

export interface CalculatedSalary {
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export function calculateSalaryStructure(components: SalaryComponents): CalculatedSalary {
  const grossSalary =
    components.basicSalary +
    components.houseRent +
    components.medicalAllowance +
    components.transportAllowance +
    components.otherAllowances;

  const totalDeductions =
    components.providentFund +
    components.incomeTax +
    components.otherDeductions;

  const netSalary = grossSalary - totalDeductions;

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
  };
}

export interface PayableCalculation {
  perDaySalary: number;
  deductionForAbsent: number;
  finalPayable: number;
}

export function calculatePayableAmount(
  netSalary: number,
  workingDays: number,
  presentDays: number,
  leaveDays: number
): PayableCalculation {
  const perDaySalary = netSalary / workingDays;
  const paidDays = presentDays + leaveDays;
  const absentDays = workingDays - paidDays;
  const deductionForAbsent = absentDays > 0 ? absentDays * perDaySalary : 0;
  const finalPayable = netSalary - deductionForAbsent;

  return {
    perDaySalary: Math.round(perDaySalary * 100) / 100,
    deductionForAbsent: Math.round(deductionForAbsent * 100) / 100,
    finalPayable: Math.round(finalPayable * 100) / 100,
  };
}

export function generatePayslipNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `PS-${year}-${random}`;
}

export function generateEmployeeCode(existingCount: number): string {
  return `EMP-${String(existingCount + 1).padStart(3, "0")}`;
}

export function numberToWords(num: number): string {
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  const rupees = Math.floor(num);
  const paisa = Math.round((num - rupees) * 100);

  let result = convert(rupees) + " Rupees";
  if (paisa > 0) {
    result += " and " + convert(paisa) + " Paisa";
  }

  return result;
}

export const DESIGNATIONS = [
  "Principal",
  "Vice Principal",
  "Teacher",
  "Head Teacher",
  "Accountant",
  "Clerk",
  "Librarian",
  "Peon",
  "Guard",
  "Driver",
  "Other",
] as const;

export const DEPARTMENTS = [
  "Teaching",
  "Administration",
  "Support",
  "Other",
] as const;
