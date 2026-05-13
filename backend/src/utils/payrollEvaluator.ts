/**
 * Simple formula evaluator for payroll components.
 * Supports: base, total_sales, commissions, tardiness_deduction
 */
export const evaluatePayrollFormula = (
  formula: string,
  context: Record<string, number>,
): number => {
  try {
    // Basic sanitization: only allow alphanumeric, dots, and common operators
    const sanitizedFormula = formula.replace(/[^a-zA-Z0-9\s\.\+\-\*\/\(\)]/g, '');

    // Replace variables with values
    let evalString = sanitizedFormula;
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      evalString = evalString.replace(regex, value.toString());
    }

    // Use Function constructor for evaluation (relatively safe with the sanitization above)
    // In a real production system, use a proper expression evaluator like mathjs
    return Number(new Function(`return ${evalString}`)());
  } catch (error) {
    console.error('Formula evaluation error:', formula, error);
    return 0;
  }
};
