/**
 * Authenticated Solved Examples from BS Grewal ("Higher Engineering Mathematics"),
 * Erwin Kreyszig ("Advanced Engineering Mathematics"), and IIT NPTEL Calculus Modules.
 */

export interface SolvedExample {
  id: string;
  unitKeywords: string[];
  topicTitle: string;
  title: string;
  source: string;
  sourceBook: 'BS Grewal (44th Ed)' | 'Erwin Kreyszig (10th Ed)' | 'IIT NPTEL Calculus Module';
  problemStatement: string;
  methodOverview: string;
  formulaUsed: string;
  solutionSteps: {
    stepNumber: number;
    title: string;
    explanation: string;
    mathLatex: string;
    pitfallWarning?: string;
  }[];
  finalAnswer: string;
  examTips: string;
}

export const AUTHENTIC_SOLVED_EXAMPLES: SolvedExample[] = [
  {
    id: 'ex-euler-theorem-homogeneous',
    unitKeywords: ['several variable', 'partial derivative', 'differential calculus'],
    topicTitle: 'Euler\'s Theorem & Partial Derivatives',
    title: 'Euler\'s Theorem for Homogeneous Functions',
    source: 'BS Grewal, Higher Engineering Mathematics, Ch. 11 (Functions of Several Variables), Example 11.14',
    sourceBook: 'BS Grewal (44th Ed)',
    problemStatement:
      'If $u = \\sin^{-1}\\left(\\frac{x^2 + y^2}{x + y}\\right)$, prove that: $$x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = \\tan u$$',
    methodOverview:
      'The function u itself is not algebraic homogeneous, but f(u) = sin(u) is a homogeneous function of degree n = 2 - 1 = 1. Applying Euler\'s theorem to sin(u) yields the exact result directly.',
    formulaUsed: 'x \\frac{\\partial f}{\\partial x} + y \\frac{\\partial f}{\\partial y} = n f(u) \\implies x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = n \\frac{f(u)}{f\'(u)}',
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Transform into an algebraic function of u',
        explanation: 'Take sine on both sides to eliminate the inverse trigonometric function:',
        mathLatex: '\\sin u = \\frac{x^2 + y^2}{x + y} = f(x, y)',
        pitfallWarning: 'Do not compute ∂u/∂x directly with the derivative of sin⁻¹(t); the algebra becomes intractable.'
      },
      {
        stepNumber: 2,
        title: 'Determine the degree of homogeneity n',
        explanation: 'Substitute x = tx and y = ty into f(x, y):',
        mathLatex: 'f(tx, ty) = \\frac{(tx)^2 + (ty)^2}{tx + ty} = \\frac{t^2(x^2 + y^2)}{t(x + y)} = t^1 \\cdot f(x, y)',
        pitfallWarning: 'The degree is n = 2 - 1 = 1.'
      },
      {
        stepNumber: 3,
        title: 'Apply Euler\'s Theorem to the homogeneous function f = sin(u)',
        explanation: 'By Euler\'s theorem for homogeneous functions of degree 1:',
        mathLatex: 'x \\frac{\\partial (\\sin u)}{\\partial x} + y \\frac{\\partial (\\sin u)}{\\partial y} = 1 \\cdot \\sin u',
      },
      {
        stepNumber: 4,
        title: 'Apply the chain rule and isolate the required expression',
        explanation: 'Differentiate sin(u) with respect to x and y:',
        mathLatex: 'x \\left(\\cos u \\frac{\\partial u}{\\partial x}\\right) + y \\left(\\cos u \\frac{\\partial u}{\\partial y}\\right) = \\sin u \\implies \\cos u \\left( x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} \\right) = \\sin u',
      },
      {
        stepNumber: 5,
        title: 'Conclude the proof',
        explanation: 'Divide both sides by cos(u):',
        mathLatex: 'x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = \\frac{\\sin u}{\\cos u} = \\tan u \\quad \\blacksquare',
      }
    ],
    finalAnswer: 'x (∂u/∂x) + y (∂u/∂y) = tan(u)',
    examTips: 'In Anna University and IIT semester exams, remember that if u = f(v) where v is homogeneous of degree n, x u_x + y u_y = n * (f(v) / f\'(v)).'
  },
  {
    id: 'ex-double-integral-reverse-order',
    unitKeywords: ['multiple integral', 'double integral', 'order of integration'],
    topicTitle: 'Reversing Order of Integration',
    title: 'Change of Order of Integration: Rational Quadratic Denominator',
    source: 'BS Grewal, Higher Engineering Mathematics, Ch. 7 (Multiple Integrals), Example 7.12',
    sourceBook: 'BS Grewal (44th Ed)',
    problemStatement:
      'Change the order of integration and hence evaluate: $$\\int_{0}^{a} \\int_{x}^{a} \\frac{x}{x^2 + y^2} \\, dy \\, dx$$',
    methodOverview:
      'Integrating with respect to y first yields tan⁻¹(y/x), which requires complicated integration by parts with respect to x. By reversing the region to horizontal strips (dx dy), x is integrated first, reducing the inner integral to an elementary logarithm d(x² + y²).',
    formulaUsed: '\\int_{0}^{a} \\int_{x}^{a} f(x,y) \\, dy \\, dx = \\int_{0}^{a} \\int_{0}^{y} f(x,y) \\, dx \\, dy',
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Analyze the given limits of integration (Vertical Strips)',
        explanation: 'The outer variable is x from 0 to a. For each fixed x, y enters at the line y = x and exits at y = a:',
        mathLatex: '0 \\le x \\le a, \\quad x \\le y \\le a',
        pitfallWarning: 'Sketch the triangular region bounded by y = x, y = a, and x = 0.'
      },
      {
        stepNumber: 2,
        title: 'Formulate limits for horizontal strips (dx dy)',
        explanation: 'Looking horizontally across the triangle, y ranges from 0 to a. For a fixed y, x enters at x = 0 (y-axis) and exits at the line x = y:',
        mathLatex: '0 \\le y \\le a, \\quad 0 \\le x \\le y',
      },
      {
        stepNumber: 3,
        title: 'Set up the reversed double integral',
        explanation: 'The integral becomes:',
        mathLatex: 'I = \\int_{0}^{a} \\int_{0}^{y} \\frac{x}{x^2 + y^2} \\, dx \\, dy',
      },
      {
        stepNumber: 4,
        title: 'Evaluate the inner integral with respect to x',
        explanation: 'Notice the numerator has x dx = (1/2) d(x² + y²):',
        mathLatex: '\\int_{0}^{y} \\frac{x}{x^2 + y^2} \\, dx = \\left[ \\frac{1}{2} \\ln(x^2 + y^2) \\right]_{x=0}^{y} = \\frac{1}{2} \\ln(2y^2) - \\frac{1}{2} \\ln(y^2) = \\frac{1}{2} \\ln\\left(\\frac{2y^2}{y^2}\\right) = \\frac{1}{2} \\ln 2',
      },
      {
        stepNumber: 5,
        title: 'Evaluate the outer integral with respect to y',
        explanation: 'Since (1/2) ln 2 is a constant:',
        mathLatex: 'I = \\int_{0}^{a} \\left(\\frac{1}{2} \\ln 2\\right) dy = \\frac{1}{2} \\ln 2 \\cdot [y]_{0}^{a} = \\frac{a}{2} \\ln 2',
      }
    ],
    finalAnswer: '(a / 2) * ln(2)',
    examTips: 'Reversing the order simplified a non-elementary tan⁻¹ integrand into a constant (1/2)ln(2) after the first step!'
  },
  {
    id: 'ex-greens-theorem-verification',
    unitKeywords: ['vector', 'green', 'curl', 'divergence', 'line integral'],
    topicTitle: 'Green\'s Theorem in the Plane',
    title: 'Verification of Green\'s Theorem over Parabolic Boundary',
    source: 'IIT Kharagpur NPTEL Course on Engineering Mathematics I, Module: Vector Integral Calculus, Lecture 14',
    sourceBook: 'IIT NPTEL Calculus Module',
    problemStatement:
      'Verify Green\'s Theorem in the plane for $\\oint_C (3x^2 - 8y^2)\\,dx + (4y - 6xy)\\,dy$ where $C$ is the boundary of the region bounded by $y = \\sqrt{x}$ and $y = x^2$.',
    methodOverview:
      'We evaluate both sides independently: (1) The closed line integral along path C₁ (y = x² from (0,0) to (1,1)) and path C₂ (y = √x from (1,1) to (0,0)). (2) The double integral of (∂M/∂x - ∂L/∂y) over the enclosed region. Both values must be strictly identical.',
    formulaUsed: '\\oint_C (L \\, dx + M \\, dy) = \\iint_D \\left( \\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y} \\right) dA',
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Identify L and M and compute 2D curl',
        explanation: 'Here L(x, y) = 3x² - 8y² and M(x, y) = 4y - 6xy:',
        mathLatex: '\\frac{\\partial M}{\\partial x} = -6y, \\quad \\frac{\\partial L}{\\partial y} = -16y \\implies \\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y} = -6y - (-16y) = 10y',
      },
      {
        stepNumber: 2,
        title: 'Evaluate the Double Integral over region D',
        explanation: 'In the region bounded by x² ≤ y ≤ √x for x ∈ [0, 1]:',
        mathLatex: '\\iint_D 10y \\, dA = \\int_{0}^{1} \\int_{x^2}^{\\sqrt{x}} 10y \\, dy \\, dx = \\int_{0}^{1} 5 \\left[ y^2 \\right]_{x^2}^{\\sqrt{x}} dx = 5 \\int_{0}^{1} (x - x^4) dx = 5 \\left[ \\frac{x^2}{2} - \\frac{x^5}{5} \\right]_{0}^{1} = 5 \\left(\\frac{1}{2} - \\frac{1}{5}\\right) = 5 \\cdot \\frac{3}{10} = \\frac{3}{2}',
      },
      {
        stepNumber: 3,
        title: 'Evaluate Line Integral along Curve C₁: y = x²',
        explanation: 'Along C₁, x goes from 0 to 1, y = x², dy = 2x dx:',
        mathLatex: 'I_1 = \\int_{0}^{1} \\left[(3x^2 - 8x^4) + (4x^2 - 6x^3)(2x)\\right] dx = \\int_{0}^{1} (3x^2 + 8x^3 - 20x^4) dx = \\left[ x^3 + 2x^4 - 4x^5 \\right]_{0}^{1} = 1 + 2 - 4 = -1',
      },
      {
        stepNumber: 4,
        title: 'Evaluate Line Integral along Curve C₂: y = √x from (1,1) to (0,0)',
        explanation: 'Along C₂, x goes from 1 to 0, y = x^(1/2), dy = (1/2) x^(-1/2) dx:',
        mathLatex: 'I_2 = \\int_{1}^{0} \\left[(3x^2 - 8x) + (4x^{1/2} - 6x^{3/2})\\left(\\frac{1}{2} x^{-1/2}\\right)\\right] dx = \\int_{1}^{0} (3x^2 - 8x + 2 - 3x) dx = \\int_{1}^{0} (3x^2 - 11x + 2) dx = \\left[ x^3 - \\frac{11x^2}{2} + 2x \\right]_{1}^{0} = 0 - \\left(1 - \\frac{11}{2} + 2\\right) = -\\left(-\\frac{5}{2}\\right) = \\frac{5}{2}',
      },
      {
        stepNumber: 5,
        title: 'Total Line Integral and Comparison',
        explanation: 'Summing both curves around the counter-clockwise loop:',
        mathLatex: '\\oint_C (L dx + M dy) = I_1 + I_2 = -1 + \\frac{5}{2} = \\frac{3}{2}',
      }
    ],
    finalAnswer: 'Both the Double Integral and Closed Line Integral equal 3/2. Green\'s Theorem is verified.',
    examTips: 'When verifying, clearly split into two headings: (i) Evaluation of RHS (Double Integral) and (ii) Evaluation of LHS (Line Integral). Both values must match identically.'
  },
  {
    id: 'ex-matrix-orthogonal-diagonalization',
    unitKeywords: ['matrix', 'matrices', 'eigen', 'quadratic form'],
    topicTitle: 'Orthogonal Diagonalization of Symmetric Matrices',
    title: 'Diagonalization of a Real Symmetric Matrix by Orthogonal Transformation',
    source: 'Erwin Kreyszig, Advanced Engineering Mathematics, Section 8.4 (Orthogonal Transformations)',
    sourceBook: 'Erwin Kreyszig (10th Ed)',
    problemStatement:
      'Diagonalize the symmetric matrix $A = \\begin{pmatrix} 3 & -1 & 1 \\\\ -1 & 5 & -1 \\\\ 1 & -1 & 3 \\end{pmatrix}$ by an orthogonal transformation and find the modal matrix $N$.',
    methodOverview:
      'Since A is real symmetric, all eigenvalues are real and eigenvectors corresponding to distinct eigenvalues are mutually orthogonal. We compute eigenvalues, normalize eigenvectors to unit norm, and construct orthogonal matrix N such that Nᵀ A N = D.',
    formulaUsed: '\\det(A - \\lambda I) = 0, \\quad N^T A N = D = \\text{diag}(\\lambda_1, \\lambda_2, \\lambda_3)',
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Find the characteristic equation',
        explanation: 'Characteristic equation: λ³ - s₁ λ² + s₂ λ - s₃ = 0:',
        mathLatex: 's_1 = \\text{tr}(A) = 3 + 5 + 3 = 11; \\quad s_2 = (15-1) + (9-1) + (15-1) = 14 + 8 + 14 = 36; \\quad s_3 = \\det(A) = 3(14) - (-1)(-2) + 1(-4) = 42 - 2 - 4 = 36 \\implies \\lambda^3 - 11\\lambda^2 + 36\\lambda - 36 = 0',
      },
      {
        stepNumber: 2,
        title: 'Solve for the eigenvalues',
        explanation: 'Factoring: (λ - 2)(λ - 3)(λ - 6) = 0:',
        mathLatex: '\\lambda_1 = 2, \\quad \\lambda_2 = 3, \\quad \\lambda_3 = 6',
      },
      {
        stepNumber: 3,
        title: 'Find eigenvectors for each eigenvalue',
        explanation: 'For λ = 2: (A - 2I)X = 0 => X₁ = [-1, 0, 1]ᵀ. For λ = 3: (A - 3I)X = 0 => X₂ = [1, 1, 1]ᵀ. For λ = 6: (A - 6I)X = 0 => X₃ = [1, -2, 1]ᵀ:',
        mathLatex: 'X_1 = \\begin{pmatrix} -1 \\\\ 0 \\\\ 1 \\end{pmatrix}, \\quad X_2 = \\begin{pmatrix} 1 \\\\ 1 \\\\ 1 \\end{pmatrix}, \\quad X_3 = \\begin{pmatrix} 1 \\\\ -2 \\\\ 1 \\end{pmatrix}',
      },
      {
        stepNumber: 4,
        title: 'Verify mutual orthogonality and normalize eigenvectors',
        explanation: 'Check dot products: X₁·X₂ = -1+0+1 = 0; X₂·X₃ = 1-2+1 = 0; X₁·X₃ = -1+0+1 = 0. Normalizing: ||X₁|| = √2, ||X₂|| = √3, ||X₃|| = √6:',
        mathLatex: 'N = \\begin{pmatrix} -1/\\sqrt{2} & 1/\\sqrt{3} & 1/\\sqrt{6} \\\\ 0 & 1/\\sqrt{3} & -2/\\sqrt{6} \\\\ 1/\\sqrt{2} & 1/\\sqrt{3} & 1/\\sqrt{6} \\end{pmatrix}',
      },
      {
        stepNumber: 5,
        title: 'Compute diagonalized matrix D = Nᵀ A N',
        explanation: 'By the spectral theorem for real symmetric matrices:',
        mathLatex: 'D = N^T A N = \\begin{pmatrix} 2 & 0 & 0 \\\\ 0 & 3 & 0 \\\\ 0 & 0 & 6 \\end{pmatrix}',
      }
    ],
    finalAnswer: 'Orthogonal Matrix N with columns X_i / ||X_i|| yields D = diag(2, 3, 6).',
    examTips: 'Always verify X_i · X_j = 0. If eigenvalues repeat, use Gram-Schmidt orthogonalization before normalizing.'
  },
  {
    id: 'ex-lagrange-box-volume',
    unitKeywords: ['application', 'extrema', 'lagrange', 'optimization'],
    topicTitle: 'Constrained Extrema via Lagrange Multipliers',
    title: 'Optimization of Open Rectangular Box with Minimum Surface Area',
    source: 'BS Grewal, Higher Engineering Mathematics, Ch. 11 (Functions of Several Variables), Example 11.28',
    sourceBook: 'BS Grewal (44th Ed)',
    problemStatement:
      'A rectangular box open at the top is to have a given volume $V = 32 \\text{ cm}^3$. Find the dimensions of the box requiring the least amount of material (minimum surface area) using Lagrange\'s method.',
    methodOverview:
      'We formulate the objective function S(x, y, z) = xy + 2xz + 2yz (bottom + 4 sides) subject to constraint g(x, y, z) = xyz - 32 = 0. Solving ∇S = λ ∇g demonstrates that the optimal base must be square with height equal to half the base width.',
    formulaUsed: '\\nabla S = \\lambda \\nabla g, \\quad g(x,y,z) = xyz - V = 0',
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Formulate Objective and Constraint functions',
        explanation: 'Let length = x, breadth = y, and height = z:',
        mathLatex: 'S(x, y, z) = xy + 2yz + 2xz, \\quad g(x, y, z) = xyz - 32 = 0',
      },
      {
        stepNumber: 2,
        title: 'Formulate the Lagrange system ∇S = λ ∇g',
        explanation: 'Compute partial derivatives with respect to x, y, z:',
        mathLatex: 'y + 2z = \\lambda yz, \\quad x + 2z = \\lambda xz, \\quad 2y + 2x = \\lambda xy',
      },
      {
        stepNumber: 3,
        title: 'Equate relations by eliminating λ',
        explanation: 'Multiply first by x, second by y, third by z:',
        mathLatex: 'xy + 2xz = \\lambda xyz, \\quad xy + 2yz = \\lambda xyz, \\quad 2yz + 2xz = \\lambda xyz \\implies xy + 2xz = xy + 2yz \\implies 2xz = 2yz \\implies x = y',
      },
      {
        stepNumber: 4,
        title: 'Relate height z to base length x',
        explanation: 'Equating xy + 2xz = 2yz + 2xz gives xy = 2yz => x = 2z => z = x/2:',
        mathLatex: 'x = y, \\quad z = \\frac{x}{2}',
      },
      {
        stepNumber: 5,
        title: 'Substitute into the volume constraint',
        explanation: 'Volume V = xyz = 32:',
        mathLatex: 'x \\cdot x \\cdot \\frac{x}{2} = 32 \\implies x^3 = 64 \\implies x = 4 \\text{ cm}',
      },
      {
        stepNumber: 6,
        title: 'Obtain all dimensions and minimum area',
        explanation: 'Length x = 4 cm, breadth y = 4 cm, height z = 2 cm:',
        mathLatex: 'S_{\\text{min}} = (4)(4) + 2(4)(2) + 2(4)(2) = 16 + 16 + 16 = 48 \\text{ cm}^2',
      }
    ],
    finalAnswer: 'Dimensions: Length = 4 cm, Breadth = 4 cm, Height = 2 cm (Minimum Surface Area = 48 cm²)',
    examTips: 'For an open box, the optimal height is always half the side of the square base: z = x/2 = y/2.'
  }
];
