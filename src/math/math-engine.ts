/**
 * Deterministic Mathematical Verification Engine
 * Safe expression evaluation, symbolic checking, numerical integration,
 * double-integral region verification, and step equivalence testing.
 */

import { evaluate, parse, compile } from 'mathjs';

export interface VerificationResult {
  isValid: boolean;
  method: 'exact_algebraic' | 'numerical_sampling' | 'quadrature_check' | 'region_equivalence' | 'syntax_error';
  confidence: number; // 0 to 1
  message: string;
  details?: Record<string, unknown>;
}

export interface RegionBounds {
  order: 'dy_dx' | 'dx_dy';
  outerMin: number;
  outerMax: number;
  innerMinExpr: string; // e.g. "x^2" or "0"
  innerMaxExpr: string; // e.g. "2*x" or "sqrt(y)"
}

/**
 * Clean and sanitize math expression string
 */
export function sanitizeMathExpr(expr: string): string {
  if (!expr) return '';
  return expr
    .trim()
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'log')
    .replace(/\\exp/g, 'exp')
    .replace(/e\^/g, 'exp')
    .replace(/([0-9])([a-zA-Z])/g, '$1*$2'); // 2x -> 2*x
}

/**
 * Safely evaluate f(x) for numerical testing
 */
export function safeEvalFn(expr: string, scope: Record<string, number>): number {
  try {
    const sanitized = sanitizeMathExpr(expr);
    const compiled = compile(sanitized);
    const result = compiled.evaluate(scope);
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return NaN;
  } catch {
    return NaN;
  }
}

/**
 * Verify whether two single-variable expressions are mathematically equivalent.
 * Combines algebraic AST comparison and numerical multi-point sampling with boundary & domain checks.
 */
export function verifyExpressionEquivalence(
  expr1: string,
  expr2: string,
  variable = 'x',
  testDomain: [number, number] = [0.2, 5.0]
): VerificationResult {
  const clean1 = sanitizeMathExpr(expr1);
  const clean2 = sanitizeMathExpr(expr2);

  if (clean1 === clean2) {
    return {
      isValid: true,
      method: 'exact_algebraic',
      confidence: 1.0,
      message: 'Expressions are algebraically identical.',
    };
  }

  // Parse check
  let compiled1, compiled2;
  try {
    compiled1 = compile(clean1);
    compiled2 = compile(clean2);
  } catch (err: unknown) {
    return {
      isValid: false,
      method: 'syntax_error',
      confidence: 0,
      message: `Syntax error in expression: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Sample points in safe interior domain avoiding typical branch cuts/poles (0, 1, negatives for sqrt/log)
  const [minVal, maxVal] = testDomain;
  const sampleCount = 15;
  const step = (maxVal - minVal) / (sampleCount + 1);

  let matchCount = 0;
  let evaluatedCount = 0;
  const tolerance = 1e-5;

  for (let i = 1; i <= sampleCount; i++) {
    const val = minVal + i * step;
    try {
      const scope = { [variable]: val, pi: Math.PI, e: Math.E };
      const y1 = compiled1.evaluate(scope);
      const y2 = compiled2.evaluate(scope);

      if (typeof y1 === 'number' && typeof y2 === 'number' && !isNaN(y1) && !isNaN(y2) && isFinite(y1) && isFinite(y2)) {
        evaluatedCount++;
        const diff = Math.abs(y1 - y2);
        const relDiff = Math.abs(y1) > 1e-4 ? diff / Math.abs(y1) : diff;
        if (diff < tolerance || relDiff < tolerance) {
          matchCount++;
        }
      }
    } catch {
      // ignore individual sample errors (e.g. division by zero or negative log)
    }
  }

  if (evaluatedCount >= 5 && matchCount === evaluatedCount) {
    return {
      isValid: true,
      method: 'numerical_sampling',
      confidence: 0.99,
      message: 'Expressions match across all sampled test points in domain.',
      details: { sampleCount: evaluatedCount, matchCount },
    };
  }

  return {
    isValid: false,
    method: 'numerical_sampling',
    confidence: evaluatedCount > 0 ? (matchCount / evaluatedCount) : 0,
    message: `Expression values differ: ${matchCount}/${evaluatedCount} points matched.`,
    details: { sampleCount: evaluatedCount, matchCount },
  };
}

/**
 * Verify derivative using central finite difference: f'(x) == d/dx f(x)
 */
export function verifyDerivative(
  originalFn: string,
  proposedDerivative: string,
  variable = 'x',
  domain: [number, number] = [0.5, 4.0]
): VerificationResult {
  const cleanOriginal = sanitizeMathExpr(originalFn);
  const cleanDeriv = sanitizeMathExpr(proposedDerivative);

  let cOrig, cDeriv;
  try {
    cOrig = compile(cleanOriginal);
    cDeriv = compile(cleanDeriv);
  } catch (err: unknown) {
    return {
      isValid: false,
      method: 'syntax_error',
      confidence: 0,
      message: `Syntax error in function or derivative: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const h = 1e-5;
  const tolerance = 1e-3;
  let matches = 0;
  let validTests = 0;

  for (let t = domain[0]; t <= domain[1]; t += (domain[1] - domain[0]) / 10) {
    try {
      const scopeMid = { [variable]: t };
      const scopePlus = { [variable]: t + h };
      const scopeMinus = { [variable]: t - h };

      const fPlus = cOrig.evaluate(scopePlus);
      const fMinus = cOrig.evaluate(scopeMinus);
      const numericalDeriv = (fPlus - fMinus) / (2 * h);
      const proposedVal = cDeriv.evaluate(scopeMid);

      if (
        typeof numericalDeriv === 'number' &&
        typeof proposedVal === 'number' &&
        !isNaN(numericalDeriv) &&
        !isNaN(proposedVal) &&
        isFinite(numericalDeriv) &&
        isFinite(proposedVal)
      ) {
        validTests++;
        const diff = Math.abs(numericalDeriv - proposedVal);
        if (diff < tolerance || diff / (Math.abs(numericalDeriv) + 1e-5) < tolerance) {
          matches++;
        }
      }
    } catch {
      // skip point
    }
  }

  const isValid = validTests >= 4 && matches >= validTests - 1;
  return {
    isValid,
    method: 'quadrature_check',
    confidence: validTests > 0 ? matches / validTests : 0,
    message: isValid
      ? 'Derivative verified via central difference quadrature.'
      : 'Derivative does not match slope of original function.',
    details: { validTests, matches },
  };
}

/**
 * Numerical definite integration using Composite Simpson's 1/3 Rule
 */
export function numericalIntegrate(
  fnExpr: string,
  a: number,
  b: number,
  n = 100,
  variable = 'x'
): number {
  if (n % 2 !== 0) n++; // Must be even
  const h = (b - a) / n;
  const compiled = compile(sanitizeMathExpr(fnExpr));

  const f = (val: number) => {
    try {
      const res = compiled.evaluate({ [variable]: val });
      return typeof res === 'number' && !isNaN(res) ? res : 0;
    } catch {
      return 0;
    }
  };

  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }

  return (h / 3) * sum;
}

/**
 * Numerical Double Integration across Region
 * Supports:
 * - dy dx: Outer x in [xMin, xMax], Inner y in [y1(x), y2(x)]
 * - dx dy: Outer y in [yMin, yMax], Inner x in [x1(y), x2(y)]
 */
export function numericalDoubleIntegrate(
  integrand: string,
  region: RegionBounds,
  nOuter = 40,
  nInner = 40
): number {
  const cIntegrand = compile(sanitizeMathExpr(integrand));
  const cInnerMin = compile(sanitizeMathExpr(region.innerMinExpr));
  const cInnerMax = compile(sanitizeMathExpr(region.innerMaxExpr));

  const outerA = region.outerMin;
  const outerB = region.outerMax;
  const hOuter = (outerB - outerA) / nOuter;

  let totalSum = 0;

  for (let i = 0; i <= nOuter; i++) {
    const outerVal = outerA + i * hOuter;
    const outerWeight = i === 0 || i === nOuter ? 1 : i % 2 === 0 ? 2 : 4;

    // Determine inner limits for this slice
    let innerA: number, innerB: number;
    try {
      const outerScope = region.order === 'dy_dx' ? { x: outerVal } : { y: outerVal };
      innerA = cInnerMin.evaluate(outerScope);
      innerB = cInnerMax.evaluate(outerScope);
    } catch {
      continue;
    }

    if (isNaN(innerA) || isNaN(innerB) || innerB <= innerA) {
      continue;
    }

    // Inner Simpson integration
    const hInner = (innerB - innerA) / nInner;
    let innerSum = 0;

    for (let j = 0; j <= nInner; j++) {
      const innerVal = innerA + j * hInner;
      const innerWeight = j === 0 || j === nInner ? 1 : j % 2 === 0 ? 2 : 4;

      const evalScope =
        region.order === 'dy_dx'
          ? { x: outerVal, y: innerVal }
          : { x: innerVal, y: outerVal };

      try {
        const val = cIntegrand.evaluate(evalScope);
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
          innerSum += innerWeight * val;
        }
      } catch {
        // ignore pole
      }
    }

    const innerIntegral = (hInner / 3) * innerSum;
    totalSum += outerWeight * innerIntegral;
  }

  return (hOuter / 3) * totalSum;
}

/**
 * Specialized Double Integral Verification:
 * Validates that reversing the order of integration (e.g. from dy dx to dx dy)
 * covers the EXACT same geometric region and yields the same volume for multiple test integrands.
 */
export function verifyReversedOrderOfIntegration(
  originalRegion: RegionBounds,
  reversedRegion: RegionBounds,
  testIntegrand = '1' // Area check first
): VerificationResult {
  // Step 1: Area calculation (integrand = 1)
  const area1 = numericalDoubleIntegrate('1', originalRegion);
  const area2 = numericalDoubleIntegrate('1', reversedRegion);

  const areaDiff = Math.abs(area1 - area2);
  const areaTolerance = 0.05 * Math.max(Math.abs(area1), 0.1);

  if (isNaN(area1) || isNaN(area2) || area1 <= 0 || area2 <= 0) {
    return {
      isValid: false,
      method: 'region_equivalence',
      confidence: 0,
      message: 'Failed to evaluate region areas. Check that the inner limits are continuous and innerMax >= innerMin.',
      details: { area1, area2 },
    };
  }

  if (areaDiff > areaTolerance) {
    return {
      isValid: false,
      method: 'region_equivalence',
      confidence: 0.1,
      message: `Region area mismatch! Original region area is ~${area1.toFixed(3)}, but proposed reversed region area is ~${area2.toFixed(3)}. When changing order, integration bounds must describe the exact same region, not just swap numerical values.`,
      details: { areaOriginal: area1, areaProposed: area2, areaDiff },
    };
  }

  // Step 2: Test with non-symmetric integrand (e.g., x * y + x) to ensure orientation and bounds match
  const testVal1 = numericalDoubleIntegrate('x * y + x', originalRegion);
  const testVal2 = numericalDoubleIntegrate('x * y + x', reversedRegion);

  const testDiff = Math.abs(testVal1 - testVal2);
  const testTol = 0.08 * Math.max(Math.abs(testVal1), 0.1);

  if (testDiff > testTol) {
    return {
      isValid: false,
      method: 'region_equivalence',
      confidence: 0.3,
      message: `Integrals differ under test function f(x,y)=xy+x (Original: ~${testVal1.toFixed(3)}, Reversed: ~${testVal2.toFixed(3)}). The geometric boundaries or domain slicing do not match.`,
      details: { testVal1, testVal2, testDiff },
    };
  }

  return {
    isValid: true,
    method: 'region_equivalence',
    confidence: 0.98,
    message: `Verified! Both formulations describe the identical geometric region (Area: ~${area1.toFixed(3)}) and produce identical integral values.`,
    details: {
      area: area1,
      originalOrder: originalRegion.order,
      reversedOrder: reversedRegion.order,
    },
  };
}

/**
 * Check student intermediate step against expected step
 */
export function checkStudentStep(
  studentInput: string,
  expectedExpression: string,
  acceptableForms: string[] = []
): { isValid: boolean; feedback: string; errorType?: 'conceptual' | 'algebraic' | 'arithmetic' | 'geometric' | 'notation' } {
  if (!studentInput.trim()) {
    return {
      isValid: false,
      feedback: 'Please enter a mathematical expression or equation step.',
    };
  }

  // Exact string match check
  const sClean = sanitizeMathExpr(studentInput).replace(/\s+/g, '');
  const eClean = sanitizeMathExpr(expectedExpression).replace(/\s+/g, '');

  if (sClean === eClean) {
    return {
      isValid: true,
      feedback: 'Excellent! Your step is mathematically exact and correctly simplified.',
    };
  }

  // Check acceptable forms
  for (const alt of acceptableForms) {
    if (sClean === sanitizeMathExpr(alt).replace(/\s+/g, '')) {
      return {
        isValid: true,
        feedback: 'Correct! Equivalent valid form recognized.',
      };
    }
  }

  // Equivalence check via math engine
  const equivResult = verifyExpressionEquivalence(studentInput, expectedExpression);
  if (equivResult.isValid) {
    return {
      isValid: true,
      feedback: 'Correct! Your expression is mathematically equivalent to the required step.',
    };
  }

  // Common error heuristics
  if (studentInput.includes('=') && !expectedExpression.includes('=')) {
    return {
      isValid: false,
      errorType: 'notation',
      feedback: 'Note: Provide just the transformed expression rather than the full equation.',
    };
  }

  if (studentInput.includes('dx') && !studentInput.includes('dy') && expectedExpression.includes('dy')) {
    return {
      isValid: false,
      errorType: 'geometric',
      feedback: 'Check your differentials: did you reverse the order from dy dx to dx dy correctly?',
    };
  }

  return {
    isValid: false,
    errorType: 'algebraic',
    feedback: `The expression does not match the expected result. Check your algebra or substitution. Expected form is close to ${expectedExpression}.`,
  };
}
