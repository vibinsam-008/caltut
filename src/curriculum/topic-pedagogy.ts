import { Topic, Unit, TutorMessage, WhiteboardVisualSpec } from '../types';

export interface TopicPedagogy {
  initialMessage: TutorMessage;
  whiteboardSpec: WhiteboardVisualSpec;
  intuitionSummary: string;
  keyFormulaLatex: string;
}

export function generateTopicPedagogy(topic?: Topic, unit?: Unit): TopicPedagogy {
  const topicTitle = topic?.title || 'Core Calculus Concepts';
  const unitTitle = unit?.title || 'Engineering Mathematics';
  const normTopic = topicTitle.toLowerCase();
  const normUnit = unitTitle.toLowerCase();

  // 1. Several Variables / Partial Derivatives
  if (
    normTopic.includes('several variable') ||
    normTopic.includes('partial derivative') ||
    normTopic.includes('total derivative') ||
    normTopic.includes('jacobian') ||
    normUnit.includes('several variable')
  ) {
    return {
      intuitionSummary:
        'In multivariable functions z = f(x,y), partial derivatives measure the instantaneous rate of change along coordinate slices, holding all other variables constant.',
      keyFormulaLatex:
        '\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x + h, y) - f(x, y)}{h}, \\quad dz = \\frac{\\partial f}{\\partial x}dx + \\frac{\\partial f}{\\partial y}dy',
      whiteboardSpec: {
        type: 'cartesian_plot',
        title: 'Slice Curve z = 4 - x² and Tangent Line at x = 1 (Fixed y = 1)',
        xAxisLabel: 'x',
        yAxisLabel: 'z = f(x, 1)',
        xRange: [-2.5, 2.5],
        yRange: [-1.0, 5.0],
        functions: [
          {
            id: 'slice',
            expression: 'z = 4 - x^2',
            fnString: '4 - x^2',
            color: '#38bdf8',
            label: 'Surface Slice: z = 4 - x²',
          },
          {
            id: 'tangent',
            expression: 'z = 3 - 2*(x - 1)',
            fnString: '3 - 2*(x - 1)',
            color: '#f43f5e',
            label: 'Tangent: dz/dx = -2',
          },
        ],
        points: [
          { x: 1, y: 3, label: 'P(1, 1, 3)', color: '#eab308' },
          { x: 0, y: 4, label: 'Vertex (0, 1, 4)', color: '#10b981' },
        ],
        annotations: [
          { text: 'Slope ∂z/∂x = -2 at x = 1 (Holding y constant)', x: 0.2, y: 1.5 },
        ],
      },
      initialMessage: {
        id: `msg-several-var-${Date.now()}`,
        sender: 'tutor',
        timestamp: '10:00',
        actionTaken: 'explain_concept',
        text: `Welcome to **${topicTitle}** in **${unitTitle}**!

In engineering physical systems, quantities depend simultaneously on multiple variables—such as stress $\\sigma(x, y)$, temperature $T(x, y, z)$, or electrostatic potential $V(r, \\theta)$.

When we compute a **partial derivative** $\\frac{\\partial f}{\\partial x}$, we inspect the slope along a single direction by **freezing all other variables as constants**:
$$\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x + h, y) - f(x, y)}{h}$$

Geometrically, this is the slope of the tangent line to the 1D slice curve cut by the plane $y = c$. For small changes in both coordinates, the **total differential** gives:
$$dz = \\frac{\\partial f}{\\partial x}\\,dx + \\frac{\\partial f}{\\partial y}\\,dy$$

Let's verify your conceptual readiness with this quick diagnostic:`,
        diagnosticQuestion: {
          question: 'When computing the partial derivative ∂f/∂x of f(x,y) = x³y² + sin(xy), how is the variable y treated?',
          options: [
            'As an unchanging constant parameter',
            'Differentiated with respect to x using dy/dx',
            'Set to zero before differentiating',
            'Integrated using integration by parts',
          ],
          correctIndex: 0,
          explanation:
            'Exactly! When taking the partial derivative with respect to x, y is held strictly constant, so ∂/∂x [x³y²] = 3x²y².',
        },
      },
    };
  }

  // 2. Matrices / Eigenvalues
  if (
    normTopic.includes('matrix') ||
    normTopic.includes('matrices') ||
    normTopic.includes('eigen') ||
    normTopic.includes('cayley') ||
    normUnit.includes('matrix') ||
    normUnit.includes('matrices')
  ) {
    return {
      intuitionSummary:
        'A matrix transformation A acts on vectors. An eigenvector v is an invariant direction that does not rotate—it merely scales by eigenvalue λ: A v = λ v.',
      keyFormulaLatex:
        '\\det(A - \\lambda I) = 0 \\implies (A - \\lambda I)\\mathbf{v} = \\mathbf{0}',
      whiteboardSpec: {
        type: 'cartesian_plot',
        title: 'Eigenvector Directions & Invariant Subspaces (λ₁ = 3, λ₂ = 1)',
        xAxisLabel: 'x₁',
        yAxisLabel: 'x₂',
        xRange: [-3.0, 3.0],
        yRange: [-3.0, 3.0],
        functions: [
          {
            id: 'eigen1',
            expression: 'x2 = x1',
            fnString: 'x',
            color: '#10b981',
            label: 'Eigenspace v₁: y = x (λ = 3)',
          },
          {
            id: 'eigen2',
            expression: 'x2 = -x1',
            fnString: '-x',
            color: '#38bdf8',
            label: 'Eigenspace v₂: y = -x (λ = 1)',
          },
        ],
        points: [
          { x: 1, y: 1, label: 'v₁ (1, 1)', color: '#10b981' },
          { x: -1, y: 1, label: 'v₂ (-1, 1)', color: '#38bdf8' },
        ],
        annotations: [
          { text: 'A v₁ = 3 v₁ (Pure stretch by 3)', x: 1.2, y: 2.2 },
          { text: 'A v₂ = 1 v₂ (Preserved length)', x: -2.2, y: 1.6 },
        ],
      },
      initialMessage: {
        id: `msg-matrix-${Date.now()}`,
        sender: 'tutor',
        timestamp: '10:00',
        actionTaken: 'explain_concept',
        text: `Welcome to **${topicTitle}** in **${unitTitle}**!

In structural analysis, quantum mechanics, and network graphs, a linear transformation represented by matrix $A$ stretches and rotates coordinate space.

An **eigenvector** $\\mathbf{v}$ represents a special invariant direction: $A$ transforms $\\mathbf{v}$ without rotating it, merely scaling its length by scalar **eigenvalue** $\\lambda$:
$$A \\mathbf{v} = \\lambda \\mathbf{v} \\iff (A - \\lambda I)\\mathbf{v} = \\mathbf{0}$$

For non-trivial solutions $(\\mathbf{v} \\neq \\mathbf{0})$, the characteristic determinant must vanish:
$$\\det(A - \\lambda I) = 0$$

Let's test your conceptual intuition on linear operators:`,
        diagnosticQuestion: {
          question: 'What geometric effect does matrix A produce on one of its eigenvectors v?',
          options: [
            'It scales the vector along its own line by factor λ without rotation',
            'It rotates the vector by 90 degrees in the plane',
            'It maps the vector directly into the nullspace of A',
            'It squares the magnitude of every coordinate independently',
          ],
          correctIndex: 0,
          explanation:
            'Correct! By definition, Av = λv means the resulting vector lies on the exact same line through the origin, scaled by λ.',
        },
      },
    };
  }

  // 3. Vector Calculus / Green's Theorem
  if (
    normTopic.includes('vector') ||
    normTopic.includes('green') ||
    normTopic.includes('stoke') ||
    normTopic.includes('curl') ||
    normTopic.includes('divergence') ||
    normTopic.includes('line integral') ||
    normUnit.includes('vector')
  ) {
    return {
      intuitionSummary:
        'Vector calculus connects flow along 1D boundaries to 2D area flux. Green\'s Theorem equates boundary circulation ∮ (L dx + M dy) to the area integral of 2D curl ∬ (∂M/∂x - ∂L/∂y) dA.',
      keyFormulaLatex:
        '\\oint_C (L \\, dx + M \\, dy) = \\iint_D \\left( \\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y} \\right) dA',
      whiteboardSpec: {
        type: 'bounded_region',
        title: 'Green\'s Theorem: Boundary Curve C and Enclosed Domain D',
        xAxisLabel: 'x',
        yAxisLabel: 'y',
        xRange: [-2.5, 2.5],
        yRange: [-2.5, 2.5],
        functions: [
          {
            id: 'circle_top',
            expression: 'y = sqrt(4 - x^2)',
            fnString: 'sqrt(max(0, 4 - x^2))',
            color: '#38bdf8',
            label: 'Boundary C: x² + y² = 4',
          },
          {
            id: 'circle_bot',
            expression: 'y = -sqrt(4 - x^2)',
            fnString: '-sqrt(max(0, 4 - x^2))',
            color: '#38bdf8',
            label: '',
          },
        ],
        region: {
          lowerBoundFn: '-sqrt(max(0, 4 - x^2))',
          upperBoundFn: 'sqrt(max(0, 4 - x^2))',
          xMin: -2,
          xMax: 2,
          color: '#6366f1',
          opacity: 0.25,
        },
        annotations: [
          { text: 'Counter-clockwise path ∮_C', x: 0.2, y: 2.1 },
          { text: 'Enclosed 2D Region D (curl area)', x: -0.8, y: 0 },
        ],
      },
      initialMessage: {
        id: `msg-vector-${Date.now()}`,
        sender: 'tutor',
        timestamp: '10:00',
        actionTaken: 'explain_concept',
        text: `Welcome to **${topicTitle}** in **${unitTitle}**!

In fluid dynamics and electromagnetism, vector fields govern force, work, and flux. **Green's Theorem** establishes a fundamental duality:

The macroscopic work (circulation) done by field $\\mathbf{F} = \\langle L, M \\rangle$ along closed boundary curve $C$ equals the double integral of microscopic rotational vorticity (curl) across region $D$:
$$\\oint_C (L \\, dx + M \\, dy) = \\iint_D \\left( \\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y} \\right) dA$$

Notice how computing an area integral is frequently far simpler than evaluating four separate piecewise line integrals along boundary curves!

Let's check your understanding:`,
        diagnosticQuestion: {
          question: "Under Green's Theorem, what does the 2D scalar curl (∂M/∂x - ∂L/∂y) quantify physically?",
          options: [
            'The local rotational circulation density per unit area at each point',
            'The total rate of fluid mass expansion across the outer boundary',
            'The normal acceleration vector of a moving particle',
            'The total volume under the potential energy surface',
          ],
          correctIndex: 0,
          explanation:
            'Exactly! (∂M/∂x - ∂L/∂y) represents 2D curl: the infinitesimal paddle-wheel rotational tendency at each coordinate point.',
        },
      },
    };
  }

  // 4. Multiple Integrals / Order of Integration
  if (
    normTopic.includes('multiple integral') ||
    normTopic.includes('double integral') ||
    normTopic.includes('triple integral') ||
    normTopic.includes('order of integration') ||
    normUnit.includes('multiple integral')
  ) {
    return {
      intuitionSummary:
        'Double integrals calculate volumes and centers of mass. Changing order from dy dx (vertical strips) to dx dy (horizontal strips) requires inverting boundary functions.',
      keyFormulaLatex:
        '\\int_{0}^{2} \\int_{x^2}^{2x} f(x,y) \\, dy \\, dx = \\int_{0}^{4} \\int_{y/2}^{\\sqrt{y}} f(x,y) \\, dx \\, dy',
      whiteboardSpec: {
        type: 'order_of_integration',
        title: 'Visualizing Integration Limits and Boundary Curves (y = x² to y = 2x)',
        xAxisLabel: 'x',
        yAxisLabel: 'y',
        xRange: [-0.5, 3.0],
        yRange: [-0.5, 4.5],
        functions: [
          { id: 'f1', expression: 'y = x^2', fnString: 'x^2', color: '#38bdf8', label: 'y = x²' },
          { id: 'f2', expression: 'y = 2x', fnString: '2*x', color: '#f43f5e', label: 'y = 2x' },
        ],
        region: {
          lowerBoundFn: 'x^2',
          upperBoundFn: '2*x',
          xMin: 0,
          xMax: 2,
          color: '#6366f1',
          opacity: 0.35,
          integrationOrder: 'dy_dx',
        },
        points: [
          { x: 0, y: 0, label: 'Origin (0,0)', color: '#10b981' },
          { x: 2, y: 4, label: 'Intersection (2,4)', color: '#eab308' },
        ],
      },
      initialMessage: {
        id: `msg-multiple-int-${Date.now()}`,
        sender: 'tutor',
        timestamp: '10:00',
        actionTaken: 'explain_concept',
        text: `Welcome to **${topicTitle}** in **${unitTitle}**!

In engineering design, multiple integrals determine centers of gravity, moments of inertia, and electrostatic flux across complex boundaries.

When you see a double integral formulated as:
$$\\int_{0}^{2} \\int_{x^2}^{2x} f(x,y) \\, dy \\, dx$$

the inner differential $dy$ means we are slicing the 2D region using **vertical strips**. For each fixed $x \\in [0,2]$, $y$ enters at the lower parabola $y = x^2$ and exits at the upper line $y = 2x$.

To reverse this into **horizontal strips** ($dx\\,dy$), we invert the curves into functions of $y$: $x = \\frac{y}{2}$ (left entry) and $x = \\sqrt{y}$ (right exit), spanning $y \\in [0,4]$.

Let's test your limit identification skills:`,
        diagnosticQuestion: {
          question: 'In the integral above, what is the geometric shape of the lower boundary curve of the vertical strips?',
          options: [
            'The parabola y = x^2',
            'The straight line y = 2x',
            'A horizontal line y = 0',
            'A circular arc of radius 2',
          ],
          correctIndex: 0,
          explanation:
            'Correct! The inner lower limit is y = x^2, which defines the bottom parabolic boundary of the region.',
        },
      },
    };
  }

  // 5. Applications / Extrema & Lagrange Multipliers
  if (
    normTopic.includes('application') ||
    normTopic.includes('optimization') ||
    normTopic.includes('extrema') ||
    normTopic.includes('lagrange') ||
    normTopic.includes('maxima') ||
    normUnit.includes('application')
  ) {
    return {
      intuitionSummary:
        'Constrained optimization finds maximum or minimum values of f(x,y) subject to constraint g(x,y) = c. At optimal points, gradients are parallel: ∇f = λ ∇g.',
      keyFormulaLatex:
        '\\nabla f(x, y) = \\lambda \\nabla g(x, y), \\quad g(x, y) = c',
      whiteboardSpec: {
        type: 'critical_points',
        title: 'Constraint Circle x² + y² = 8 & Hyperbolic Level Curves xy = c',
        xAxisLabel: 'x',
        yAxisLabel: 'y',
        xRange: [-3.5, 3.5],
        yRange: [-3.5, 3.5],
        functions: [
          {
            id: 'circ_top',
            expression: 'y = sqrt(8 - x^2)',
            fnString: 'sqrt(max(0, 8 - x^2))',
            color: '#38bdf8',
            label: 'Constraint: x² + y² = 8',
          },
          {
            id: 'circ_bot',
            expression: 'y = -sqrt(8 - x^2)',
            fnString: '-sqrt(max(0, 8 - x^2))',
            color: '#38bdf8',
            label: '',
          },
          {
            id: 'hyper_max',
            expression: 'y = 4/x',
            fnString: '4/x',
            color: '#10b981',
            label: 'Level Curve: xy = 4 (Max)',
          },
        ],
        points: [
          { x: 2, y: 2, label: 'Max (2,2), f=4', color: '#10b981' },
          { x: -2, y: -2, label: 'Max (-2,-2), f=4', color: '#10b981' },
        ],
        annotations: [
          { text: 'Tangency condition: ∇f || ∇g', x: 0.5, y: 2.5 },
        ],
      },
      initialMessage: {
        id: `msg-opt-${Date.now()}`,
        sender: 'tutor',
        timestamp: '10:00',
        actionTaken: 'explain_concept',
        text: `Welcome to **${topicTitle}** in **${unitTitle}**!

Engineers optimize designs under real physical constraints—minimizing material cost subject to volume requirements or maximizing heat dissipation within a spatial envelope.

Using **Lagrange's Method of Undetermined Multipliers**, an extremum of objective $f(x, y)$ on constraint curve $g(x, y) = c$ occurs exactly where the level curve of $f$ is **tangent** to the constraint curve:
$$\\nabla f = \\lambda \\nabla g \\implies \\left\\langle \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right\\rangle = \\lambda \\left\\langle \\frac{\\partial g}{\\partial x}, \\frac{\\partial g}{\\partial y} \\right\\rangle$$

Along with $g(x, y) = c$, this yields 3 equations for the 3 unknowns $(x, y, \\lambda)$.

Let's test this geometric tangency principle:`,
        diagnosticQuestion: {
          question: 'At a constrained local extremum of f subject to g(x,y)=c, what is the geometric relationship between their gradient vectors ∇f and ∇g?',
          options: [
            'They are parallel (proportional by scalar multiplier λ)',
            'They are perpendicular (their dot product is zero)',
            '∇f must equal the zero vector',
            '∇g must equal the unit vector along the x-axis',
          ],
          correctIndex: 0,
          explanation:
            'Exactly! Because the level curve of f and the constraint curve g=c are tangent at the optimum, their normal vectors (gradients) point in the same (or opposite) direction, so ∇f = λ ∇g.',
        },
      },
    };
  }

  // 6. Generic Canonical Fallback
  return {
    intuitionSummary: `Mastering ${topicTitle} provides essential analytical tools for formulating and solving engineering models in ${unitTitle}.`,
    keyFormulaLatex: 'f(x) = \\lim_{\\Delta x \\to 0} \\frac{\\Delta f}{\\Delta x}, \\quad I = \\int_{a}^{b} f(x) \\, dx',
    whiteboardSpec: {
      type: 'cartesian_plot',
      title: `${topicTitle} - Analytical Visualizer`,
      xAxisLabel: 'x',
      yAxisLabel: 'y',
      xRange: [-2.0, 4.0],
      yRange: [-1.0, 6.0],
      functions: [
        {
          id: 'fn1',
          expression: 'f(x) = 0.5*x^2 + 1',
          fnString: '0.5*x^2 + 1',
          color: '#38bdf8',
          label: 'Response Curve f(x)',
        },
      ],
      points: [
        { x: 0, y: 1, label: 'Origin Intercept (0,1)', color: '#10b981' },
        { x: 2, y: 3, label: 'Evaluation Point (2,3)', color: '#eab308' },
      ],
      annotations: [
        { text: `Focus: ${topicTitle}`, x: 0.5, y: 4.5 },
      ],
    },
    initialMessage: {
      id: `msg-generic-${Date.now()}`,
      sender: 'tutor',
      timestamp: '10:00',
      actionTaken: 'explain_concept',
      text: `Welcome to **${topicTitle}** in **${unitTitle}**!

In engineering analysis, mastering ${topicTitle} is essential for modeling dynamic physical processes, calculating exact quantitative rates, and establishing rigorous bounds.

We will proceed step-by-step:
1. Building conceptual intuition before formal algebraic formulas.
2. Observing mathematical behavior directly on the geometric whiteboard.
3. Solving verified problems with guided feedback.

Let's begin with this foundational diagnostic question:`,
      diagnosticQuestion: {
        question: `In the study of ${topicTitle}, what is the primary purpose of identifying boundary constraints and differential relationships?`,
        options: [
          'To define the valid domain of integration and physical governing equations',
          'To eliminate all variable parameters before solving',
          'To replace analytical methods with numerical approximations exclusively',
          'To ensure the solution is always an integer value',
        ],
        correctIndex: 0,
        explanation:
          'Correct! Rigorous boundary and differential definitions establish the valid mathematical domain for computing exact solutions.',
      },
    },
  };
}
