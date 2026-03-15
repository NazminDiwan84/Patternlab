document.addEventListener('DOMContentLoaded', () => {
    const el = {
        themeToggle: document.getElementById('theme-toggle'),
        generateBtn: document.getElementById('generate-btn'),
        visualizeBtn: document.getElementById('visualize-btn'),
        showCodeBtn: document.getElementById('show-code-btn'),
        copyCodeBtn: document.getElementById('copy-code-btn'),
        patternType: document.getElementById('pattern-type'),
        rows: document.getElementById('rows'),
        symbol: document.getElementById('symbol'),
        symbolHelp: document.getElementById('symbol-help'),
        patternOutput: document.getElementById('pattern-output'),
        logicExplanation: document.getElementById('logic-explanation'),
        codeContainer: document.getElementById('code-container'),
        codeOutput: document.getElementById('code-output'),
        statusBadge: document.getElementById('status-badge')
    };

    const state = { isAnimating: false, animationInterval: null, code: '' };

    const initTheme = () => {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    };
    const toggleTheme = () => {
        const theme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    };
    const updateThemeIcon = (theme) => {
        el.themeToggle.querySelector('i').className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    };
    el.themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    const getInputs = () => ({
        type: el.patternType.value,
        rows: Math.min(Math.max(parseInt(el.rows.value) || 5, 2), 20),
        symbol: el.symbol.value || '*'
    });

    const patterns = {
        'square': {
            gen: (r, s) => Array.from({ length: r }, () => (s + " ").repeat(r).trimEnd()),
            code: (r, s) => `public class SquarePattern {\n    public static void main(String[] args) {\n        int rows = ${r};\n        for (int i = 0; i < rows; i++) {\n            for (int j = 0; j < rows; j++) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`,
            exp: (r, s) => `<p>Uses a nested loop where the <strong>outer loop</strong> handles <code>${r}</code> rows, and the <strong>inner loop</strong> prints the symbol <code>${s}</code> exactly <code>${r}</code> times per row. Because rows and columns are equal, a perfect square is formed.</p>`
        },
        'hollow-square': {
            gen: (r, s) => Array.from({ length: r }, (_, i) => {
                let str = "";
                for (let j = 0; j < r; j++) {
                    if (i === 0 || i === r - 1 || j === 0 || j === r - 1) str += s + " "; else str += "  ";
                }
                return str.trimEnd();
            }),
            code: (r, s) => `public class HollowSquare {\n    public static void main(String[] args) {\n        int n = ${r};\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                if (i == 0 || i == n - 1 || j == 0 || j == n - 1) System.out.print("${s} ");\n                else System.out.print("  ");\n            }\n            System.out.println();\n        }\n    }\n}`,
            exp: (r, s) => `<p>Similar to the square, but uses an <code>if</code> condition inside the inner loop. It only prints <code>${s}</code> if the current position is on the absolute border.</p>`
        },
        'rectangle': {
            gen: (r, s) => {
                let cols = Math.floor(r * 1.5) || 3;
                return Array.from({ length: r }, () => (s + " ").repeat(cols).trimEnd());
            },
            code: (r, s) => {
                let cols = Math.floor(r * 1.5) || 3;
                return `public class RectanglePattern {\n    public static void main(String[] args) {\n        int rows = ${r};\n        int cols = ${cols};\n        for (int i = 0; i < rows; i++) {\n            for (int j = 0; j < cols; j++) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`;
            },
            exp: (r, s) => `<p>Similar to a square but the number of columns differs from the number of rows. Here, the outer loop runs for rows, and the inner loop runs for a larger number of columns.</p>`
        },
        'hollow-rectangle': {
            gen: (r, s) => {
                let cols = Math.floor(r * 1.5) || 3;
                return Array.from({ length: r }, (_, i) => {
                    let str = "";
                    for (let j = 0; j < cols; j++) {
                        if (i === 0 || i === r - 1 || j === 0 || j === cols - 1) str += s + " "; else str += "  ";
                    }
                    return str.trimEnd();
                });
            },
            code: (r, s) => {
                let cols = Math.floor(r * 1.5) || 3;
                return `public class HollowRectangle {\n    public static void main(String[] args) {\n        int rows = ${r};\n        int cols = ${cols};\n        for (int i = 0; i < rows; i++) {\n            for (int j = 0; j < cols; j++) {\n                if (i == 0 || i == rows - 1 || j == 0 || j == cols - 1) System.out.print("${s} ");\n                else System.out.print("  ");\n            }\n            System.out.println();\n        }\n    }\n}`;
            },
            exp: (r, s) => `<p>A combination of the logic from Hollow Square and Rectangle. Uses boundary checks on both rows and columns to skip printing inner symbols.</p>`
        },
        'right-triangle': {
            gen: (r, s) => Array.from({ length: r }, (_, i) => (s + " ").repeat(i + 1).trimEnd()),
            code: (r, s) => `public class RightTriangle {\n    public static void main(String[] args) {\n        int rows = ${r};\n        for (int i = 1; i <= rows; i++) {\n            for (int j = 1; j <= i; j++) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`,
            exp: (r, s) => `<p>The <strong>inner loop</strong> runs based on the current row number. For row 1, it runs 1 time. For row ${r}, it runs ${r} times. This increasing sequence forms a right-angled triangle.</p>`
        },
        'equilateral-triangle': {
            gen: (r, s) => Array.from({ length: r }, (_, i) => " ".repeat(r - (i + 1)) + (s + " ").repeat(i + 1).trimEnd()),
            code: (r, s) => {
                return `public class EquilateralTriangle {\n    public static void main(String[] args) {\n        int t = ${r};\n        for (int i = 1; i <= t; i++) {\n            for (int j = 1; j <= t - i; j++) System.out.print(" ");\n            for (int j = 1; j <= i; j++) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`;
            },
            exp: (r, s) => `<p>Also known as a Pyramid. Uses an inner loop to print initial spaces (decreasing) and a second inner loop to print symbols separated by spaces.</p>`
        },
        'reverse-equilateral': {
            gen: (r, s) => Array.from({ length: r }, (_, i) => " ".repeat(i) + (s + " ").repeat(r - i).trimEnd()),
            code: (r, s) => {
                return `public class ReverseEquilateral {\n    public static void main(String[] args) {\n        int r = ${r};\n        for (int i = 1; i <= r; i++) {\n            for (int j = r; j >= r - i + 1; j--) System.out.print(" ");\n            for (int j = r; j >= i; j--) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`;
            },
            exp: (r, s) => `<p>Also known as an Inverted Pyramid. The space loop increases as we go down, and the symbol loop decreases.</p>`
        },
        'pyramid': {
            gen: (r, s) => Array.from({ length: r }, (_, i) => " ".repeat(r - (i + 1)) + (s + " ").repeat(i + 1).trimEnd()),
            code: (r, s) => `public class PyramidPattern {\n    public static void main(String[] args) {\n        int rows = ${r};\n        for (int i = 1; i <= rows; i++) {\n            for (int j = 1; j <= rows - i; j++) System.out.print(" ");\n            for (int k = 1; k <= i; k++) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`,
            exp: (r, s) => `<p>Requires <strong>three loops</strong>. The outer loop handles the rows. Inside, the first inner loop decreases spaces as rows increase. The second inner loop prints the <code>${s}</code> character with a trailing space.</p>`
        },
        'inverted-pyramid': {
            gen: (r, s) => Array.from({ length: r }, (_, i) => " ".repeat(i) + (s + " ").repeat(r - i).trimEnd()),
            code: (r, s) => `public class InvertedPyramid {\n    public static void main(String[] args) {\n        int rows = ${r};\n        for (int i = rows; i >= 1; i--) {\n            for (int j = 1; j <= rows - i; j++) System.out.print(" ");\n            for (int k = 1; k <= i; k++) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`,
            exp: (r, s) => `<p>The reverse of the standard pyramid. The <strong>outer loop</strong> starts from the maximum rows and decrements down to 1.</p>`
        },
        'diamond': {
            gen: (r, s) => {
                let n = Math.floor(r / 2) + 1, m = r - n;
                let top = Array.from({ length: n }, (_, i) => " ".repeat(n - (i + 1)) + (s + " ").repeat(i + 1).trimEnd());
                let bot = Array.from({ length: m }, (_, i) => " ".repeat(i + 1) + (s + " ").repeat(m - i).trimEnd());
                return [...top, ...bot];
            },
            code: (r, s) => {
                let n = Math.floor(r / 2) + 1, m = r - n;
                return `public class DiamondPattern {\n    public static void main(String[] args) {\n        int n = ${n}, m = ${m};\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= n - i; j++) System.out.print(" ");\n            for (int k = 1; k <= i; k++) System.out.print("${s} ");\n            System.out.println();\n        }\n        for (int i = m; i >= 1; i--) {\n            for (int j = 1; j <= n - i; j++) System.out.print(" ");\n            for (int k = 1; k <= i; k++) System.out.print("${s} ");\n            System.out.println();\n        }\n    }\n}`;
            },
            exp: (r, s) => `<p>Created by combining a <strong>Pyramid</strong> and an <strong>Inverted Pyramid</strong>. It divides the rows into top and bottom halves.</p>`
        },
        'number-triangle': {
            gen: (r) => Array.from({ length: r }, (_, i) => Array.from({ length: i + 1 }, (_, j) => j + 1).join(" ")),
            code: (r) => `public class NumberTriangle {\n    public static void main(String[] args) {\n        int rows = ${r};\n        for (int i = 1; i <= rows; i++) {\n            for (int j = 1; j <= i; j++) System.out.print(j + " ");\n            System.out.println();\n        }\n    }\n}`,
            exp: (r) => `<p>Functions like a Right Triangle, but it prints the value of the <strong>inner loop variable</strong> (<code>j</code>). As the inner loop increments, the number increases.</p>`
        },
        'floyd-triangle': {
            gen: (r) => {
                let lines = [], num = 1;
                for (let i = 1; i <= r; i++) {
                    let row = [];
                    for (let j = 1; j <= i; j++) { row.push(num); num++; }
                    lines.push(row.join(" "));
                }
                return lines;
            },
            code: (r) => `public class FloydTriangle {\n    public static void main(String[] args) {\n        int rows = ${r}, num = 1;\n        for (int i = 1; i <= rows; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print(num + " ");\n                num++;\n            }\n            System.out.println();\n        }\n    }\n}`,
            exp: (r) => `<p>Uses an external <code>num</code> variable that tracks a continuous sequence. After every time the inner loop prints the number, <code>num</code> is incremented by 1.</p>`
        }
    };

    el.patternType.addEventListener('change', (e) => {
        const type = e.target.value;
        if (type === 'number-triangle' || type === 'floyd-triangle') {
            el.symbol.disabled = true; el.symbol.value = ''; el.symbolHelp.style.display = 'block';
        } else {
            el.symbol.disabled = false; if (el.symbol.value === '') el.symbol.value = '*'; el.symbolHelp.style.display = 'none';
        }
    });

    const updateUIState = (code, exp) => {
        state.code = code;
        el.codeOutput.textContent = code;
        if (window.Prism) Prism.highlightElement(el.codeOutput);
        el.logicExplanation.innerHTML = exp;
        el.showCodeBtn.disabled = false;
        el.copyCodeBtn.disabled = false;
    };

    const stopAnimation = (done = false) => {
        if (state.animationInterval) { clearInterval(state.animationInterval); state.animationInterval = null; }
        state.isAnimating = false;
        if (done) { el.statusBadge.textContent = 'Done'; el.statusBadge.className = 'badge success'; }
    };

    el.generateBtn.addEventListener('click', () => {
        stopAnimation();
        el.statusBadge.textContent = 'Generated'; el.statusBadge.className = 'badge success';
        const { type, rows, symbol } = getInputs();
        const p = patterns[type];
        const lines = p.gen(rows, symbol);

        let htmlLines = lines.map((l, idx) => `<div style="animation-delay: ${idx * 0.05}s">${l.replace(/ /g, '&nbsp;')}</div>`).join('');
        el.patternOutput.innerHTML = `<div class="pattern-wrapper">${htmlLines}</div>`;

        updateUIState(p.code(rows, symbol), p.exp(rows, symbol));
    });

    el.visualizeBtn.addEventListener('click', () => {
        stopAnimation();
        el.statusBadge.textContent = 'Visualizing...'; el.statusBadge.className = 'badge active';
        el.patternOutput.innerHTML = '';
        const { type, rows, symbol } = getInputs();
        const p = patterns[type];
        const lines = p.gen(rows, symbol);
        updateUIState(p.code(rows, symbol), p.exp(rows, symbol));

        let tokens = [];
        lines.forEach(line => {
            for (let i = 0; i < line.length; i++) tokens.push({ char: line[i] });
            tokens.push({ newline: true });
        });

        state.isAnimating = true;

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'pattern-wrapper';
        el.patternOutput.appendChild(wrapperDiv);

        let index = 0, currentDiv = document.createElement('div');
        wrapperDiv.appendChild(currentDiv);

        state.animationInterval = setInterval(() => {
            if (index >= tokens.length) { stopAnimation(true); return; }
            const t = tokens[index];
            if (t.newline) {
                currentDiv = document.createElement('div');
                wrapperDiv.appendChild(currentDiv);
            } else {
                currentDiv.innerHTML += t.char === ' ' ? '&nbsp;' : t.char;
            }
            index++;
        }, 30);
    });

    el.showCodeBtn.addEventListener('click', () => {
        const collapsed = el.codeContainer.classList.contains('collapsed');
        if (collapsed) {
            el.codeContainer.classList.remove('collapsed');
            el.showCodeBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Hide Code';
        } else {
            el.codeContainer.classList.add('collapsed');
            el.showCodeBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Show Code';
        }
    });

    el.copyCodeBtn.addEventListener('click', () => {
        if (!state.code) return;
        navigator.clipboard.writeText(state.code).then(() => {
            const icon = el.copyCodeBtn.querySelector('i');
            icon.className = 'fa-solid fa-check text-success';
            el.copyCodeBtn.style.color = 'var(--success-color)';
            setTimeout(() => { icon.className = 'fa-regular fa-copy'; el.copyCodeBtn.style.color = ''; }, 2000);
        });
    });

    el.patternType.dispatchEvent(new Event('change'));
});
