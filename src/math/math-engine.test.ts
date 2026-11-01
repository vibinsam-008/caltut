import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeMathExpr,
  verifyExpressionEquivalence,
  verifyDerivative,
  numericalIntegrate,
  verifyReversedOrderOfIntegration,
  checkStudentStep,
} from './math-engine';

test('sanitizeMathExpr formats LaTeX and implicit multiplications properly', () => {
  assert.equal(sanitizeMathExpr('2x + 3'), '2*x + 3');
  assert.equal(sanitizeMathExpr('\\frac{x^2}{2}'), '(x^2)/(2)');
  assert.equal(sanitizeMathExpr('\\sqrt{x}'), 'sqrt(x)');
});

test('verifyExpressionEquivalence identifies algebraically equivalent expressions', () => {
  // (x + 1)^2 == x^2 + 2x + 1
  const result1 = verifyExpressionEquivalence('(x + 1)^2', 'x^2 + 2*x + 1');
  assert.equal(result1.isValid, true);

  // sin^2(x) + cos^2(x) == 1
  const result2 = verifyExpressionEquivalence('sin(x)^2 + cos(x)^2', '1');
  assert.equal(result2.isValid, true);

  // unequal expressions
  const result3 = verifyExpressionEquivalence('x^2 + 1', 'x^2 + 2');
  assert.equal(result3.isValid, false);
});

test('verifyDerivative confirms central difference verification', () => {
  // d/dx (x^3) = 3x^2
  const res1 = verifyDerivative('x^3', '3*x^2');
  assert.equal(res1.isValid, true);

  // d/dx (sin(x)) = cos(x)
  const res2 = verifyDerivative('sin(x)', 'cos(x)');
  assert.equal(res2.isValid, true);

  // false derivative
  const res3 = verifyDerivative('x^2', '3*x');
  assert.equal(res3.isValid, false);
});

test('numericalIntegrate calculates Simpson integral accurately', () => {
  // Integral of x^2 from 0 to 3 is [x^3/3] = 27/3 = 9
  const val = numericalIntegrate('x^2', 0, 3, 50);
  assert.ok(Math.abs(val - 9.0) < 0.01, `Expected 9, got ${val}`);
});

test('verifyReversedOrderOfIntegration validates region equivalence', () => {
  // Region bounded by y = x^2 and y = 2x from x=0 to 2
  // Original (dy dx): x in [0, 2], y in [x^2, 2x]
  // Reversed (dx dy): y in [0, 4], x in [y/2, sqrt(y)]
  const origRegion = {
    order: 'dy_dx' as const,
    outerMin: 0,
    outerMax: 2,
    innerMinExpr: 'x^2',
    innerMaxExpr: '2*x',
  };

  const validReversedRegion = {
    order: 'dx_dy' as const,
    outerMin: 0,
    outerMax: 4,
    innerMinExpr: 'y/2',
    innerMaxExpr: 'sqrt(y)',
  };

  const verification = verifyReversedOrderOfIntegration(origRegion, validReversedRegion);
  assert.equal(verification.isValid, true, verification.message);

  // Incorrect reversed region (e.g. naive swapping of numbers: y in [0, 2], x in [x^2, 2x])
  const badReversedRegion = {
    order: 'dx_dy' as const,
    outerMin: 0,
    outerMax: 2,
    innerMinExpr: '0',
    innerMaxExpr: '1',
  };
  const badVerification = verifyReversedOrderOfIntegration(origRegion, badReversedRegion);
  assert.equal(badVerification.isValid, false);
});

test('checkStudentStep provides accurate feedback', () => {
  const check = checkStudentStep('2*x + 1', '2*x + 1');
  assert.equal(check.isValid, true);

  const equivCheck = checkStudentStep('x + x + 1', '2*x + 1');
  assert.equal(equivCheck.isValid, true);

  const wrongCheck = checkStudentStep('3*x', '2*x + 1');
  assert.equal(wrongCheck.isValid, false);
});
