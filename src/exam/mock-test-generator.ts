import { CourseCurriculum } from '../types';

export interface ExamQuestionPartA {
  id: string;
  questionNumber: number;
  unitNumber: number;
  unitTitle: string;
  marks: number; // 2 marks
  questionText: string;
  expectedAnswerShort: string;
  markingScheme: {
    criteria: string;
    marks: number;
  }[];
  detailedSolution: string;
  examinerNotes?: string;
}

export interface ExamQuestionPartB {
  id: string;
  questionNumber: number; // 11 to 15
  unitNumber: number;
  unitTitle: string;
  marks: number; // 16 marks
  choiceA: {
    subdivision: '(i)' | '(i) & (ii)';
    statement: string;
    detailedSolution: string;
    markingScheme: {
      step: string;
      marksAllocated: number;
    }[];
  };
  choiceB: {
    subdivision: '(i)' | '(i) & (ii)';
    statement: string;
    detailedSolution: string;
    markingScheme: {
      step: string;
      marksAllocated: number;
    }[];
  };
}

export interface MockExamPaper {
  id: string;
  courseCode: string;
  courseTitle: string;
  regulations: string;
  institution: string;
  examTitle: string;
  durationMinutes: number;
  maxMarks: number;
  generatedDate: string;
  instructions: string[];
  partA: ExamQuestionPartA[];
  partB: ExamQuestionPartB[];
}

export function generateUniversityMockExam(curriculum: CourseCurriculum): MockExamPaper {
  const code = curriculum.code || 'ENG-MATH';
  const title = curriculum.title || 'Engineering Mathematics';
  const institution = curriculum.institution || 'Madras Institute of Technology';
  const regulations = curriculum.regulations || 'Regulation 2021 CBCS';

  const partA: ExamQuestionPartA[] = [
    {
      id: 'q1',
      questionNumber: 1,
      unitNumber: 1,
      unitTitle: curriculum.units[0]?.title || 'Matrices / Several Variables',
      marks: 2,
      questionText: 'State Cayley-Hamilton theorem and express its characteristic matrix equation.',
      expectedAnswerShort: 'Every square matrix satisfies its own characteristic equation: P(A) = 0.',
      markingScheme: [
        { criteria: 'Correct statement of theorem', marks: 1 },
        { criteria: 'Matrix equation form Aⁿ + a₁Aⁿ⁻¹ + ... + aₙI = O', marks: 1 },
      ],
      detailedSolution:
        '**Statement:** Every square matrix $A$ satisfies its own characteristic polynomial equation.\n\nIf the characteristic equation is $\\det(A - \\lambda I) = (-1)^n [\\lambda^n - s_1\\lambda^{n-1} + \\dots + (-1)^n s_n] = 0$, then substituting matrix $A$ yields:\n$$A^n - s_1 A^{n-1} + s_2 A^{n-2} - \\dots + (-1)^n s_n I = O$$\nwhere $O$ is the null matrix and $I$ is the identity matrix.',
    },
    {
      id: 'q2',
      questionNumber: 2,
      unitNumber: 1,
      unitTitle: curriculum.units[0]?.title || 'Matrices / Several Variables',
      marks: 2,
      questionText: 'Two eigenvalues of a $3 \\times 3$ matrix $A$ are $2$ and $3$. If $\\det(A) = 24$, determine the third eigenvalue.',
      expectedAnswerShort: 'λ₃ = 4',
      markingScheme: [
        { criteria: 'Property: Product of eigenvalues equals determinant', marks: 1 },
        { criteria: 'Calculation: 2 * 3 * λ₃ = 24 => λ₃ = 4', marks: 1 },
      ],
      detailedSolution:
        'By the spectral determinant property: $\\lambda_1 \\lambda_2 \\lambda_3 = \\det(A)$.\n\nGiven $\\lambda_1 = 2, \\lambda_2 = 3, \\det(A) = 24$:\n$$(2)(3)\\lambda_3 = 24 \\implies 6\\lambda_3 = 24 \\implies \\lambda_3 = 4$$',
    },
    {
      id: 'q3',
      questionNumber: 3,
      unitNumber: 2,
      unitTitle: curriculum.units[1]?.title || 'Differential Calculus / Multiple Integrals',
      marks: 2,
      questionText: 'State Euler\'s Theorem for a homogeneous function $f(x, y)$ of degree $n$.',
      expectedAnswerShort: 'x (∂f/∂x) + y (∂f/∂y) = n f(x, y)',
      markingScheme: [
        { criteria: 'Definition of homogeneous function f(tx, ty) = tⁿ f(x,y)', marks: 1 },
        { criteria: 'Correct differential equation identity', marks: 1 },
      ],
      detailedSolution:
        'If $f(x, y)$ is a homogeneous function of degree $n$ in $x$ and $y$, having continuous first partial derivatives, then:\n$$x \\frac{\\partial f}{\\partial x} + y \\frac{\\partial f}{\\partial y} = n f(x, y)$$',
    },
    {
      id: 'q4',
      questionNumber: 4,
      unitNumber: 2,
      unitTitle: curriculum.units[1]?.title || 'Differential Calculus / Multiple Integrals',
      marks: 2,
      questionText: 'State the sufficient conditions for a stationary point $(a, b)$ of $f(x, y)$ to be a local maximum.',
      expectedAnswerShort: 'Δ = f_xx * f_yy - (f_xy)² > 0 and f_xx < 0 at (a,b).',
      markingScheme: [
        { criteria: 'Hessian determinant condition Δ > 0', marks: 1 },
        { criteria: 'Negative curvature f_xx < 0 (or f_yy < 0)', marks: 1 },
      ],
      detailedSolution:
        'Let $A = f_{xx}, B = f_{xy}, C = f_{yy}$ evaluated at critical point $(a, b)$ where $f_x = f_y = 0$.\n\n$(a, b)$ is a local maximum if and only if:\n$$\\Delta = AC - B^2 = f_{xx}f_{yy} - (f_{xy})^2 > 0 \\quad \\text{and} \\quad f_{xx} < 0$$',
    },
    {
      id: 'q5',
      questionNumber: 5,
      unitNumber: 3,
      unitTitle: curriculum.units[2]?.title || 'Multiple Integrals / Vector Calculus',
      marks: 2,
      questionText: 'Sketch and state the reversed limits of integration for: $$\\int_{0}^{1} \\int_{0}^{x} f(x, y) \\, dy \\, dx$$',
      expectedAnswerShort: 'int_0^1 [ int_y^1 f(x,y) dx ] dy',
      markingScheme: [
        { criteria: 'Identifying region: 0 ≤ y ≤ 1 and y ≤ x ≤ 1', marks: 1 },
        { criteria: 'Correctly reversed integral notation', marks: 1 },
      ],
      detailedSolution:
        'The region is a triangle bounded by $y = 0$, $y = x$, and $x = 1$.\n\nIn horizontal strips, $y$ varies from $0$ to $1$. For a fixed $y$, $x$ enters at line $x = y$ and exits at $x = 1$:\n$$\\int_{0}^{1} \\int_{0}^{x} f(x, y) \\, dy \\, dx = \\int_{0}^{1} \\int_{y}^{1} f(x, y) \\, dx \\, dy$$',
    },
    {
      id: 'q6',
      questionNumber: 6,
      unitNumber: 3,
      unitTitle: curriculum.units[2]?.title || 'Multiple Integrals / Vector Calculus',
      marks: 2,
      questionText: 'What is the Jacobian $J = \\frac{\\partial(x, y)}{\\partial(r, \\theta)}$ of transformation from Cartesian to Polar coordinates?',
      expectedAnswerShort: 'J = r',
      markingScheme: [
        { criteria: 'Determinant matrix setup with cos and sin terms', marks: 1 },
        { criteria: 'Simplification using cos²θ + sin²θ = 1 to get r', marks: 1 },
      ],
      detailedSolution:
        'With $x = r\\cos\\theta$ and $y = r\\sin\\theta$:\n$$J = \\begin{vmatrix} \\frac{\\partial x}{\\partial r} & \\frac{\\partial x}{\\partial \\theta} \\\\ \\frac{\\partial y}{\\partial r} & \\frac{\\partial y}{\\partial \\theta} \\end{vmatrix} = \\begin{vmatrix} \\cos\\theta & -r\\sin\\theta \\\\ \\sin\\theta & r\\cos\\theta \\end{vmatrix} = r\\cos^2\\theta - (-r\\sin^2\\theta) = r(\\cos^2\\theta + \\sin^2\\theta) = r$$',
    },
    {
      id: 'q7',
      questionNumber: 7,
      unitNumber: 4,
      unitTitle: curriculum.units[3]?.title || 'Vector Calculus / Applications',
      marks: 2,
      questionText: 'Define an irrotational vector field and state the scalar potential condition.',
      expectedAnswerShort: 'curl(F) = ∇ × F = 0, which implies F = ∇φ.',
      markingScheme: [
        { criteria: 'Condition curl(F) = 0', marks: 1 },
        { criteria: 'Existence of scalar potential φ such that F = grad(φ)', marks: 1 },
      ],
      detailedSolution:
        'A vector field $\\mathbf{F}$ is called **irrotational** if its curl vanishes everywhere:\n$$\\nabla \\times \\mathbf{F} = \\mathbf{0}$$\nWhen this holds in a simply connected domain, $\\mathbf{F}$ is conservative and can be expressed as the gradient of a scalar potential function $\\phi$: $\\mathbf{F} = \\nabla\\phi$.',
    },
    {
      id: 'q8',
      questionNumber: 8,
      unitNumber: 4,
      unitTitle: curriculum.units[3]?.title || 'Vector Calculus / Applications',
      marks: 2,
      questionText: 'State Green\'s theorem in the plane in rectangular coordinates.',
      expectedAnswerShort: '∮_C (L dx + M dy) = ∬_D (∂M/∂x - ∂L/∂y) dA',
      markingScheme: [
        { criteria: 'Left side closed line integral ∮_C (L dx + M dy)', marks: 1 },
        { criteria: 'Right side 2D curl area integral ∬_D (∂M/∂x - ∂L/∂y) dA', marks: 1 },
      ],
      detailedSolution:
        'If $C$ is a positively oriented, piecewise smooth, simple closed curve in the $xy$-plane enclosing region $D$, and $L, M$ have continuous partial derivatives on an open region containing $D$, then:\n$$\\oint_C (L \\, dx + M \\, dy) = \\iint_D \\left( \\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y} \\right) dA$$',
    },
    {
      id: 'q9',
      questionNumber: 9,
      unitNumber: 5,
      unitTitle: curriculum.units[4]?.title || 'Applications & Special Functions',
      marks: 2,
      questionText: 'Write the relationship between Beta and Gamma functions.',
      expectedAnswerShort: 'B(m, n) = [ Γ(m) * Γ(n) ] / Γ(m + n)',
      markingScheme: [
        { criteria: 'Exact formula B(m,n) = (Γ(m)Γ(n)) / Γ(m+n)', marks: 1.5 },
        { criteria: 'Constraint m > 0, n > 0', marks: 0.5 },
      ],
      detailedSolution:
        'For all positive real numbers $m > 0$ and $n > 0$:\n$$B(m, n) = \\frac{\\Gamma(m) \\Gamma(n)}{\\Gamma(m + n)}$$\nwhere $\\Gamma(p) = \\int_0^\\infty e^{-t} t^{p-1} dt$.',
    },
    {
      id: 'q10',
      questionNumber: 10,
      unitNumber: 5,
      unitTitle: curriculum.units[4]?.title || 'Applications & Special Functions',
      marks: 2,
      questionText: 'Evaluate the Gamma values $\\Gamma(1/2)$ and $\\Gamma(5/2)$.',
      expectedAnswerShort: 'Γ(1/2) = √π, Γ(5/2) = (3/4)√π',
      markingScheme: [
        { criteria: 'Γ(1/2) = √π', marks: 1 },
        { criteria: 'Γ(5/2) = (3/2)(1/2)Γ(1/2) = (3/4)√π', marks: 1 },
      ],
      detailedSolution:
        'Using the standard value $\\Gamma(1/2) = \\sqrt{\\pi}$ and recurrence $\\Gamma(p+1) = p\\Gamma(p)$:\n$$\\Gamma(5/2) = \\Gamma(3/2 + 1) = \\frac{3}{2} \\Gamma(3/2) = \\frac{3}{2} \\cdot \\frac{1}{2} \\Gamma(1/2) = \\frac{3}{4} \\sqrt{\\pi}$$',
    },
  ];

  const partB: ExamQuestionPartB[] = [
    {
      id: 'q11',
      questionNumber: 11,
      unitNumber: 1,
      unitTitle: curriculum.units[0]?.title || 'Matrices / Functions of Several Variables',
      marks: 16,
      choiceA: {
        subdivision: '(i) & (ii)',
        statement:
          '(i) Find the eigenvalues and eigenvectors of the symmetric matrix: $$A = \\begin{pmatrix} 2 & 2 & 0 \\\\ 2 & 1 & 1 \\\\ 0 & 1 & 2 \\end{pmatrix}$$ [8 Marks]\n\n(ii) Verify Cayley-Hamilton theorem for $B = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ and hence find $B^{-1}$. [8 Marks]',
        detailedSolution:
          '### (i) Eigenvalues and Eigenvectors of Symmetric Matrix A:\n\n1. **Characteristic Equation:** $\\lambda^3 - s_1\\lambda^2 + s_2\\lambda - s_3 = 0$\n   - $s_1 = \\text{tr}(A) = 2 + 1 + 2 = 5$\n   - $s_2 = (2 - 1) + (4 - 0) + (2 - 4) = 1 + 4 - 2 = 3$\n   - $s_3 = \\det(A) = 2(2-1) - 2(4-0) + 0 = 2 - 8 = -4$\n   - Equation: $\\lambda^3 - 5\\lambda^2 + 3\\lambda + 4 = 0$\n   - Roots: $(\\lambda - 1)(\\lambda - 4)(\\lambda + 1) = 0 \\implies \\lambda_1 = 1, \\lambda_2 = 4, \\lambda_3 = -1$.\n\n2. **Eigenvectors:**\n   - For $\\lambda = 1$: $(A - I)X = 0 \\implies X_1 = [1, -1/2, 1/2]^T$ or $[2, -1, 1]^T$.\n   - For $\\lambda = 4$: $(A - 4I)X = 0 \\implies X_2 = [2, 2, 1]^T$.\n   - For $\\lambda = -1$: $(A + I)X = 0 \\implies X_3 = [1, -2, 2]^T$.\n\n### (ii) Cayley-Hamilton Theorem for B:\n1. Characteristic equation: $\\det(B - \\lambda I) = \\lambda^2 - 5\\lambda - 2 = 0$.\n2. Verification: $B^2 = \\begin{pmatrix} 7 & 10 \\\\ 15 & 22 \\end{pmatrix}$. $B^2 - 5B - 2I = \\begin{pmatrix} 7-5-2 & 10-10 \\\\ 15-15 & 22-20-2 \\end{pmatrix} = \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix} = O$.\n3. Inverse: Multiply by $B^{-1}$: $B - 5I - 2B^{-1} = 0 \\implies B^{-1} = \\frac{1}{2}(B - 5I) = \\begin{pmatrix} -2 & 1 \\\\ 3/2 & -1/2 \\end{pmatrix}$.',
        markingScheme: [
          { step: 'Characteristic equation and roots for A', marksAllocated: 4 },
          { step: 'Eigenvectors computation and normalization', marksAllocated: 4 },
          { step: 'Cayley-Hamilton substitution verification B² - 5B - 2I = O', marksAllocated: 4 },
          { step: 'Computation of inverse B⁻¹ = (1/2)(B - 5I)', marksAllocated: 4 },
        ],
      },
      choiceB: {
        subdivision: '(i)',
        statement:
          'Reduce the quadratic form $Q = 2x_1^2 + 5x_2^2 + 2x_3^2 - 4x_1x_2 + 2x_1x_3 - 4x_2x_3$ to canonical form by an orthogonal transformation and establish its nature. [16 Marks]',
        detailedSolution:
          '1. **Matrix Representation:**\n   $$A = \\begin{pmatrix} 2 & -2 & 1 \\\\ -2 & 5 & -2 \\\\ 1 & -2 & 2 \\end{pmatrix}$$\n2. **Characteristic Equation:**\n   - $s_1 = 9$, $s_2 = (10-4) + (4-1) + (10-4) = 6 + 3 + 6 = 15$, $s_3 = \\det(A) = 0$.\n   - $\\lambda^3 - 9\\lambda^2 + 15\\lambda = 0 \\implies \\lambda(\\lambda^2 - 9\\lambda + 15) = 0$.\n3. Canonical form: $y_1^2 \\lambda_1 + y_2^2 \\lambda_2 + y_3^2 \\lambda_3$.\n4. **Nature:** Since $\\det(A) = 0$ with positive trace and non-negative roots, the quadratic form is **Positive Semi-Definite**.',
        markingScheme: [
          { step: 'Matrix formulation of quadratic form A', marksAllocated: 4 },
          { step: 'Characteristic roots derivation', marksAllocated: 5 },
          { step: 'Normalized modal matrix N and canonical form Y^T D Y', marksAllocated: 4 },
          { step: 'Rank, index, signature, and nature classification', marksAllocated: 3 },
        ],
      },
    },
    {
      id: 'q12',
      questionNumber: 12,
      unitNumber: 2,
      unitTitle: curriculum.units[1]?.title || 'Functions of Several Variables & Extrema',
      marks: 16,
      choiceA: {
        subdivision: '(i)',
        statement:
          'Find and classify all local maxima, local minima, and saddle points of the surface: $$f(x, y) = x^3 + y^3 - 3xy$$ [16 Marks]',
        detailedSolution:
          '1. **First Partial Derivatives:**\n   $$f_x = 3x^2 - 3y = 0 \\implies y = x^2$$\n   $$f_y = 3y^2 - 3x = 0 \\implies x = y^2$$\n2. **Critical Points:**\n   $$x = (x^2)^2 = x^4 \\implies x(x^3 - 1) = 0 \\implies x = 0 \\text{ or } x = 1$$\n   Critical points are $(0, 0)$ and $(1, 1)$.\n3. **Second Partial Derivatives:**\n   $$A = f_{xx} = 6x, \\quad B = f_{xy} = -3, \\quad C = f_{yy} = 6y$$\n   Discriminant: $\\Delta = AC - B^2 = (6x)(6y) - (-3)^2 = 36xy - 9$.\n4. **Classification:**\n   - At $(0, 0)$: $\\Delta = -9 < 0 \\implies$ **Saddle Point** at $(0, 0)$ with $f(0, 0) = 0$.\n   - At $(1, 1)$: $\\Delta = 36(1)(1) - 9 = 27 > 0$ and $A = 6 > 0 \\implies$ **Local Minimum** at $(1, 1)$ with $f(1, 1) = 1 + 1 - 3 = -1$.',
        markingScheme: [
          { step: 'First partial derivatives fx and fy', marksAllocated: 4 },
          { step: 'Simultaneous solution for critical points (0,0) and (1,1)', marksAllocated: 4 },
          { step: 'Computation of second derivatives A, B, C and Hessian Δ', marksAllocated: 4 },
          { step: 'Rigorous classification of saddle point and local minimum', marksAllocated: 4 },
        ],
      },
      choiceB: {
        subdivision: '(i)',
        statement:
          'A rectangular box open at the top is to have a volume of $32 \\text{ cm}^3$. Using the method of Lagrange multipliers, determine the dimensions of the box that require the least surface area of material. [16 Marks]',
        detailedSolution:
          '1. **Formulate Objective and Constraint:**\n   - Surface Area: $S(x, y, z) = xy + 2xz + 2yz$\n   - Constraint: $g(x, y, z) = xyz - 32 = 0$\n2. **Lagrange Multiplier System:** $\\nabla S = \\lambda \\nabla g$\n   - $y + 2z = \\lambda yz$\n   - $x + 2z = \\lambda xz$\n   - $2x + 2y = \\lambda xy$\n3. **Elimination:**\n   - Multiply by $x, y, z$: $xy + 2xz = xy + 2yz \\implies x = y$.\n   - $xy + 2xz = 2xz + 2yz \\implies xy = 2yz \\implies x = 2z \\implies z = x/2$.\n4. **Substitute in Constraint:**\n   $$x \\cdot x \\cdot \\frac{x}{2} = 32 \\implies x^3 = 64 \\implies x = 4$$\n   Hence $y = 4$ cm and $z = 2$ cm.\n5. **Minimum Surface Area:**\n   $$S_{\\text{min}} = (4)(4) + 2(4)(2) + 2(4)(2) = 16 + 16 + 16 = 48 \\text{ cm}^2$$',
        markingScheme: [
          { step: 'Formulating objective S and constraint g', marksAllocated: 3 },
          { step: 'Setting up Lagrange equations ∇S = λ ∇g', marksAllocated: 5 },
          { step: 'Deriving geometric relations x = y and z = x/2', marksAllocated: 5 },
          { step: 'Computing dimensions x=4, y=4, z=2 and S_min = 48 cm²', marksAllocated: 3 },
        ],
      },
    },
    {
      id: 'q13',
      questionNumber: 13,
      unitNumber: 3,
      unitTitle: curriculum.units[2]?.title || 'Multiple Integrals',
      marks: 16,
      choiceA: {
        subdivision: '(i)',
        statement:
          'Change the order of integration and hence evaluate: $$\\int_{0}^{2} \\int_{x^2}^{2x} (x + y) \\, dy \\, dx$$ [16 Marks]',
        detailedSolution:
          '1. **Given Region (Vertical Strips):**\n   - $x \\in [0, 2]$, $y$ varies from parabola $y = x^2$ up to straight line $y = 2x$.\n   - Intersections: $x^2 = 2x \\implies x(x - 2) = 0 \\implies (0, 0)$ and $(2, 4)$.\n2. **Horizontal Strips (dx dy):**\n   - $y$ varies from constant bounds $0$ to $4$.\n   - For a fixed $y$, $x$ enters at the straight line $x = y/2$ and exits at the parabola $x = \\sqrt{y}$.\n3. **Reversed Integral:**\n   $$I = \\int_{0}^{4} \\int_{y/2}^{\\sqrt{y}} (x + y) \\, dx \\, dy$$\n4. **Inner Integration:**\n   $$\\int_{y/2}^{\\sqrt{y}} (x + y) dx = \\left[ \\frac{x^2}{2} + xy \\right]_{y/2}^{\\sqrt{y}} = \\left( \\frac{y}{2} + y^{3/2} \\right) - \\left( \\frac{y^2}{8} + \\frac{y^2}{2} \\right) = \\frac{y}{2} + y^{3/2} - \\frac{5y^2}{8}$$\n5. **Outer Integration:**\n   $$I = \\int_{0}^{4} \\left( \\frac{y}{2} + y^{3/2} - \\frac{5y^2}{8} \\right) dy = \\left[ \\frac{y^2}{4} + \\frac{2}{5}y^{5/2} - \\frac{5y^3}{24} \\right]_{0}^{4} = 4 + \\frac{64}{5} - \\frac{40}{3} = \\frac{24}{5} = 4.8$$',
        markingScheme: [
          { step: 'Identification of boundary curves and intersection points (0,0), (2,4)', marksAllocated: 3 },
          { step: 'Sketching and determining inverted limits: y ∈ [0,4], x ∈ [y/2, √y]', marksAllocated: 5 },
          { step: 'Inner integration with respect to x', marksAllocated: 4 },
          { step: 'Outer integration with respect to y and final value 24/5', marksAllocated: 4 },
        ],
      },
      choiceB: {
        subdivision: '(i)',
        statement:
          'Find the volume bounded between the paraboloid $z = x^2 + y^2$ and the plane $z = 4$ using triple integration in cylindrical coordinates. [16 Marks]',
        detailedSolution:
          '1. **Cylindrical Coordinate Transformation:**\n   $$x = r\\cos\\theta, \\; y = r\\sin\\theta, \\; z = z; \\quad dV = r \\, dz \\, dr \\, d\\theta$$\n2. **Limits of Integration:**\n   - Intersection: $r^2 = 4 \\implies r = 2$.\n   - $z$ goes from paraboloid $r^2$ up to plane $4$.\n   - $r \\in [0, 2]$, $\\theta \\in [0, 2\\pi]$.\n3. **Integral Setup:**\n   $$V = \\int_{0}^{2\\pi} \\int_{0}^{2} \\int_{r^2}^{4} r \\, dz \\, dr \\, d\\theta$$\n4. **Inner Integration on z:**\n   $$\\int_{r^2}^{4} dz = [4 - r^2]$$\n5. **Middle Integration on r:**\n   $$\\int_{0}^{2} r(4 - r^2) dr = \\int_{0}^{2} (4r - r^3) dr = \\left[ 2r^2 - \\frac{r^4}{4} \\right]_{0}^{2} = 8 - 4 = 4$$\n6. **Outer Integration on θ:**\n   $$V = \\int_{0}^{2\\pi} 4 \\, d\\theta = 8\\pi$$',
        markingScheme: [
          { step: 'Cylindrical coordinates setup and Jacobian factor r', marksAllocated: 4 },
          { step: 'Correct integration bounds: z ∈ [r², 4], r ∈ [0, 2], θ ∈ [0, 2π]', marksAllocated: 4 },
          { step: 'Inner and middle integration evaluation', marksAllocated: 5 },
          { step: 'Final exact volume V = 8π', marksAllocated: 3 },
        ],
      },
    },
    {
      id: 'q14',
      questionNumber: 14,
      unitNumber: 4,
      unitTitle: curriculum.units[3]?.title || 'Vector Calculus',
      marks: 16,
      choiceA: {
        subdivision: '(i)',
        statement:
          'Verify Green\'s theorem in the plane for $\\oint_C (3x^2 - 8y^2)\\,dx + (4y - 6xy)\\,dy$ where $C$ is the boundary of the region bounded by $y = \\sqrt{x}$ and $y = x^2$. [16 Marks]',
        detailedSolution:
          '1. **Identify L and M:** $L = 3x^2 - 8y^2, \\quad M = 4y - 6xy$.\n   $$\\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y} = -6y - (-16y) = 10y$$\n2. **RHS Double Integral:**\n   $$I_{\\text{RHS}} = \\int_{0}^{1} \\int_{x^2}^{\\sqrt{x}} 10y \\, dy \\, dx = \\int_{0}^{1} 5(x - x^4) dx = 5\\left(\\frac{1}{2} - \\frac{1}{5}\\right) = \\frac{3}{2}$$\n3. **LHS Closed Line Integral:**\n   - Along $C_1: y = x^2$ ($x: 0 \\to 1$): $I_1 = \\int_0^1 [3x^2 - 8x^4 + (4x^2 - 6x^3)(2x)] dx = \\int_0^1 (3x^2 + 8x^3 - 20x^4) dx = 1 + 2 - 4 = -1$.\n   - Along $C_2: y = \\sqrt{x}$ ($x: 1 \\to 0$): $I_2 = \\int_1^0 [3x^2 - 8x + (4\\sqrt{x} - 6x\\sqrt{x})\\frac{1}{2\\sqrt{x}}] dx = \\int_1^0 (3x^2 - 11x + 2) dx = 5/2$.\n   - $I_{\\text{LHS}} = -1 + 5/2 = 3/2$.\n4. **Conclusion:** $I_{\\text{LHS}} = I_{\\text{RHS}} = 3/2$. Hence Green\'s theorem is verified.',
        markingScheme: [
          { step: 'Computing ∂M/∂x - ∂L/∂y = 10y', marksAllocated: 3 },
          { step: 'Evaluation of RHS Double Integral = 3/2', marksAllocated: 5 },
          { step: 'Evaluation of LHS Line Integrals along C₁ and C₂', marksAllocated: 6 },
          { step: 'Verification equality conclusion', marksAllocated: 2 },
        ],
      },
      choiceB: {
        subdivision: '(i)',
        statement:
          'Apply Gauss Divergence theorem to evaluate $\\iint_S \\mathbf{F} \\cdot \\hat{n} \\, dS$, where $\\mathbf{F} = 4xz \\hat{i} - y^2 \\hat{j} + yz \\hat{k}$ and $S$ is the surface of the cube bounded by $x=0, x=1, y=0, y=1, z=0, z=1$. [16 Marks]',
        detailedSolution:
          '1. **Gauss Divergence Theorem:**\n   $$\\iint_S \\mathbf{F} \\cdot \\hat{n} \\, dS = \\iiint_V (\\nabla \\cdot \\mathbf{F}) \\, dV$$\n2. **Divergence of F:**\n   $$\\nabla \\cdot \\mathbf{F} = \\frac{\\partial}{\\partial x}(4xz) + \\frac{\\partial}{\\partial y}(-y^2) + \\frac{\\partial}{\\partial z}(yz) = 4z - 2y + y = 4z - y$$\n3. **Volume Integral:**\n   $$I = \\int_{0}^{1} \\int_{0}^{1} \\int_{0}^{1} (4z - y) \\, dz \\, dy \\, dx$$\n   - Integrate on $z$: $\\left[ 2z^2 - yz \\right]_{0}^{1} = 2 - y$.\n   - Integrate on $y$: $\\int_{0}^{1} (2 - y) dy = \\left[ 2y - \\frac{y^2}{2} \\right]_{0}^{1} = 2 - \\frac{1}{2} = \\frac{3}{2}$.\n   - Integrate on $x$: $\\int_{0}^{1} \\frac{3}{2} dx = \\frac{3}{2}$.\n4. **Result:** $\\iint_S \\mathbf{F} \\cdot \\hat{n} \\, dS = \\frac{3}{2}$.',
        markingScheme: [
          { step: 'Statement of Gauss Divergence Theorem', marksAllocated: 2 },
          { step: 'Computation of divergence ∇ · F = 4z - y', marksAllocated: 4 },
          { step: 'Triple integral setup over cube V: [0,1]³', marksAllocated: 5 },
          { step: 'Sequential integration and exact result = 3/2', marksAllocated: 5 },
        ],
      },
    },
    {
      id: 'q15',
      questionNumber: 15,
      unitNumber: 5,
      unitTitle: curriculum.units[4]?.title || 'Integral Calculus & Special Functions',
      marks: 16,
      choiceA: {
        subdivision: '(i) & (ii)',
        statement:
          '(i) Evaluate $\\int_{0}^{\\pi/2} \\sin^6(\\theta) \\cos^4(\\theta) \\, d\\theta$ using Beta and Gamma functions. [8 Marks]\n\n(ii) Express the improper integral $\\int_{0}^{\\infty} \\frac{x^2}{(1 + x^4)} \\, dx$ in terms of Beta functions and evaluate. [8 Marks]',
        detailedSolution:
          '### (i) Beta Integral Evaluation:\n1. Identity: $\\int_0^{\\pi/2} \\sin^{2m-1}(\\theta) \\cos^{2n-1}(\\theta) d\\theta = \\frac{1}{2} B(m, n) = \\frac{\\Gamma(m)\\Gamma(n)}{2\\Gamma(m+n)}$.\n2. $2m - 1 = 6 \\implies m = 7/2; \\quad 2n - 1 = 4 \\implies n = 5/2$.\n3. $m + n = 6 \\implies \\Gamma(6) = 5! = 120$.\n4. $\\Gamma(7/2) = \\frac{15\\sqrt{\\pi}}{8}, \\quad \\Gamma(5/2) = \\frac{3\\sqrt{\\pi}}{4}$.\n5. $I = \\frac{(15\\sqrt{\\pi}/8)(3\\sqrt{\\pi}/4)}{240} = \\frac{45\\pi / 32}{240} = \\frac{3\\pi}{512}$.\n\n### (ii) Improper Integral Transformation:\n1. Substitute $x^4 = t \\implies x = t^{1/4}, \\quad dx = \\frac{1}{4} t^{-3/4} dt$.\n2. $x^2 = t^{1/2}$. Limits: $t \\in [0, \\infty)$.\n3. $I = \\int_0^\\infty \\frac{t^{1/2}}{1 + t} \\left(\\frac{1}{4} t^{-3/4}\\right) dt = \\frac{1}{4} \\int_0^\\infty \\frac{t^{-1/4}}{1 + t} dt$.\n4. Standard Beta form: $\\int_0^\\infty \\frac{t^{p-1}}{1 + t} dt = B(p, 1-p) = \\frac{\\pi}{\\sin(p\\pi)}$ with $p - 1 = -1/4 \\implies p = 3/4$.\n5. $I = \\frac{1}{4} B(3/4, 1/4) = \\frac{1}{4} \\frac{\\pi}{\\sin(3\\pi/4)} = \\frac{\\pi}{4(1/\\sqrt{2})} = \\frac{\\pi}{2\\sqrt{2}}$.',
        markingScheme: [
          { step: 'Parameters m=7/2, n=5/2 and Gamma formulation', marksAllocated: 4 },
          { step: 'Evaluation of sin⁶ cos⁴ integral = 3π/512', marksAllocated: 4 },
          { step: 'Substitution x⁴ = t and reduction to standard Beta form', marksAllocated: 4 },
          { step: 'Evaluation via reflection formula = π / (2√2)', marksAllocated: 4 },
        ],
      },
      choiceB: {
        subdivision: '(i)',
        statement:
          'Compute the area of the loop of the Folium of Descartes $x^3 + y^3 = 3axy$ using double integration or polar parameterization. [16 Marks]',
        detailedSolution:
          '1. **Parameterization:** Put $y = tx$:\n   $$x^3 + t^3 x^3 = 3a x (tx) \\implies x^3(1 + t^3) = 3a t x^2 \\implies x = \\frac{3at}{1 + t^3}, \\quad y = \\frac{3at^2}{1 + t^3}$$\n2. The loop corresponds to $t \\in [0, \\infty)$.\n3. By Green\'s Theorem area formula $A = \\frac{1}{2} \\oint_C (x dy - y dx)$:\n   $$x dy - y dx = x^2 d\\left(\\frac{y}{x}\\right) = x^2 dt = \\left(\\frac{3at}{1 + t^3}\\right)^2 dt = \\frac{9a^2 t^2}{(1 + t^3)^2} dt$$\n4. **Integration:**\n   $$A = \\frac{1}{2} \\int_{0}^{\\infty} \\frac{9a^2 t^2}{(1 + t^3)^2} dt$$\n   Let $u = 1 + t^3, \\; du = 3t^2 dt$:\n   $$A = \\frac{1}{2} \\cdot 3a^2 \\int_{1}^{\\infty} \\frac{du}{u^2} = \\frac{3a^2}{2} \\left[ -\\frac{1}{u} \\right]_{1}^{\\infty} = \\frac{3a^2}{2}(0 - (-1)) = \\frac{3a^2}{2}$$\n5. **Result:** The area of the loop is $\\frac{3a^2}{2}$.',
        markingScheme: [
          { step: 'Parameterization y = tx and coordinates x(t), y(t)', marksAllocated: 4 },
          { step: 'Area formulation via loop parameter range t ∈ [0, ∞)', marksAllocated: 4 },
          { step: 'Integration substitution u = 1 + t³', marksAllocated: 4 },
          { step: 'Final exact area evaluation A = 3a² / 2', marksAllocated: 4 },
        ],
      },
    },
  ];

  return {
    id: `mock-exam-${Date.now()}`,
    courseCode: code,
    courseTitle: title,
    regulations,
    institution,
    examTitle: 'Model Semester Examination (Full Pattern)',
    durationMinutes: 180,
    maxMarks: 100,
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    instructions: [
      'Answer ALL questions from Part A (10 × 2 = 20 Marks).',
      'Answer FIVE full questions from Part B, choosing either (a) or (b) from each question (5 × 16 = 80 Marks).',
      'Use of approved standard scientific calculators is permitted.',
      'Show complete mathematical working, boundary sketches, and intermediate checks.',
    ],
    partA,
    partB,
  };
}
