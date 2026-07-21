const CNSS_CEILING_MONTHLY = 500;
const CNSS_SALARIAL_RATE = 0.01;
const CNSS_PATRONAL_RATE = 0.1808;

const CMR_SALARIAL_RATE = 0.01;
const CMR_PATRONAL_RATE = 0.1429;

const AMG_SALARIAL_RATE = 0.0075;
const AMG_PATRONAL_RATE = 0.0401;

const CHILDREN_DEDUCTION_ANNUAL = 150;

const TAX_BRACKETS = [
  { limit: 5000, rate: 0 },
  { limit: 20000, rate: 0.26 },
  { limit: 30000, rate: 0.28 },
  { limit: Infinity, rate: 0.35 },
];

function calculatePayroll({ salary_brut, primes = 0, indemnites = 0, enfants_charge = 0 }) {
  const totalBrut = Number(salary_brut) + Number(primes) + Number(indemnites);

  const cnssBase = Math.min(totalBrut, CNSS_CEILING_MONTHLY);
  const cnssSalarial = parseFloat((cnssBase * CNSS_SALARIAL_RATE).toFixed(2));
  const cnssPatronal = parseFloat((cnssBase * CNSS_PATRONAL_RATE).toFixed(2));

  const cmrSalarial = parseFloat((totalBrut * CMR_SALARIAL_RATE).toFixed(2));
  const cmrPatronal = parseFloat((totalBrut * CMR_PATRONAL_RATE).toFixed(2));

  const amgSalarial = parseFloat((totalBrut * AMG_SALARIAL_RATE).toFixed(2));
  const amgPatronal = parseFloat((totalBrut * AMG_PATRONAL_RATE).toFixed(2));

  const cotisationsSalariales = parseFloat(
    (cnssSalarial + cmrSalarial + amgSalarial).toFixed(2)
  );
  const cotisationsPatronales = parseFloat(
    (cnssPatronal + cmrPatronal + amgPatronal).toFixed(2)
  );

  const salaireImposable = totalBrut - cotisationsSalariales;

  const annualImposable = salaireImposable * 12;
  const annualDeduction = Math.min(
    Math.max(annualImposable * 0.1, 1000),
    3000
  );
  const netFiscalAnnual = annualImposable - annualDeduction;

  const childrenDeduction = enfants_charge * CHILDREN_DEDUCTION_ANNUAL;
  const taxableAnnual = Math.max(0, netFiscalAnnual - childrenDeduction);

  let impotAnnual = 0;
  let remaining = taxableAnnual;
  let previousLimit = 0;

  for (const bracket of TAX_BRACKETS) {
    const bracketSize = bracket.limit - previousLimit;
    const taxableInBracket = Math.min(remaining, bracketSize);
    if (taxableInBracket <= 0) break;
    impotAnnual += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    previousLimit = bracket.limit;
  }

  const impotMensuel = parseFloat((impotAnnual / 12).toFixed(2));
  const salaryNet = parseFloat((totalBrut - cotisationsSalariales - impotMensuel).toFixed(2));

  return {
    salary_brut: Number(salary_brut),
    primes: Number(primes),
    indemnites: Number(indemnites),
    enfants_charge,
    cnss_salarial: cnssSalarial,
    cmr_salarial: cmrSalarial,
    amg_salarial: amgSalarial,
    cotisations_salariales: cotisationsSalariales,
    cnss_patronal: cnssPatronal,
    cmr_patronal: cmrPatronal,
    amg_patronal: amgPatronal,
    cotisations_patronales: cotisationsPatronales,
    impot_revenu: impotMensuel,
    salary_net: salaryNet,
  };
}

module.exports = { calculatePayroll };
