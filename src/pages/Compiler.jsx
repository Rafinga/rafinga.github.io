import { useState, useRef } from "react";
import WebCompiler from "../compiler/webCompiler.js";
import X86Interpreter from "../interpreter/x86Interpreter.ts";
import "../styles/compiler.css";

const CodeEditor = ({ value, onChange, syntaxErrors }) => {
  const lines = value.split("\n");
  const errorsByLine = new Map();

  syntaxErrors.forEach((error) => {
    // Match multiple error formats
    const match = error.match(/(?:line (\d+)(?::\d+)?:|Parsing error at line (\d+)|Semantic error at line (\d+))/i);
    if (match) {
      const lineNum = parseInt(match[1] || match[2] || match[3]);
      errorsByLine.set(lineNum, error);
    }
  });

  return (
    <div className="code-editor">
      <div className="code-editor-container">
        <div className="line-numbers">
          {lines.map((_, index) => {
            const lineNum = index + 1;
            const hasError = errorsByLine.has(lineNum);
            return (
              <div
                key={index}
                className={`line-number ${hasError ? "error-line-number" : ""}`}
                title={hasError ? errorsByLine.get(lineNum) : ""}
              >
                {lineNum}
              </div>
            );
          })}
        </div>
        <textarea
          className="code-input"
          value={value}
          onChange={onChange}
          placeholder="Enter your Decaf code here..."
          rows={15}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

const Compiler = () => {
  const [inputCode, setInputCode] = useState(`// Example Decaf program
// Example Decaf program
// Example Decaf program
// Example Decaf program
import printf;
long a[10];
int get_int(int x){
return x;
}
long get_long(long x){
return x;
}

bool get_bool(bool x){
return x;
}
void main() {
    int i;
    int x;
    int y;
    int z;
    int temp;
    long result;
    bool flag;
    bool cond1;
    bool cond2;
    bool always_false;
    bool always_true;

    i = get_int(0);
    x = 10;
    y = 20;
    z = 30;
    temp = 42;
    result = get_long(0L);
    flag = false;
    cond1 = true;
    cond2 = false;
    always_false = get_bool(false);
    always_true = true;

    // dead assignment
    x = 5;
    x = 10;

    // unreachable branch
    if (false) {
        y = 99;
        result = result + long(y); // dead
    }

    // dead nested blocks
    if (always_false) {
        if (true) {
            x = x + 1;
        } else {
            x = x + 2;
        }
    } else {
        if (false) {
            y = y + 1;
        }
    }

    // code after return
    if (cond1) {
        result = long(x + y);
        return;

        // dead code below
        z = 100;
        result = result + long(z);
        printf("%ld\\n", result);
    

        // This whole section is never reached
        for (i = 0; i < 10; i = i + 1) {
            a[i] = long(i) * 5000000000L; // dead due to return above
        }
    

        // This won't be printed
        printf("Dead result: %ld\\n", result);
    }
}
`);
  const [outputAssembly, setOutputAssembly] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState("");
  const [syntaxErrors, setSyntaxErrors] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [optimizations, setOptimizations] = useState([
    "cp",
    "cse",
    "dce",
    "algebra",
    "fold",
    "regalloc",
    "inline",
  ]);
  const [showOptimizations, setShowOptimizations] = useState(false);

  const canvasRef = useRef(null);

  const optimizationOptions = [
    { key: "cp", label: "Constant Propagation" },
    { key: "cse", label: "Common Subexpression Elimination" },
    { key: "dce", label: "Dead Code Elimination" },
    { key: "algebra", label: "Algebraic Simplification" },
    { key: "fold", label: "Constant Folding" },
    { key: "regalloc", label: "Register Allocation" },
    { key: "inline", label: "Function Inlining" },
  ];

  const interpreterRef = useRef(new X86Interpreter());

  const compiler = new WebCompiler();

  const executeCode = async () => {
    if (!outputAssembly) {
      setError("Please compile code first");
      return;
    }

    setIsRunning(true);
    setExecutionOutput("");

    try {
      const result = interpreterRef.current.execute(outputAssembly);
      setExecutionOutput(result);
    } catch (err) {
      setError("Execution failed: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const compileCode = async () => {
    setIsCompiling(true);
    setError("");
    setOutputAssembly("");

    try {
      // Use the web compiler with selected optimizations
      const result = compiler.compile(
        inputCode,
        optimizations,
        canvasRef.current
      );
      if (result.success) {
        setOutputAssembly(result.assembly);
      } else {
        setError(result.errors.join("\n"));
      }
    } catch (err) {
      setError(err.message || "Compilation failed");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <section className="compiler">
      <h3>Decaf Compiler</h3>
      <p>
        Interactive C-like language compiler built during MIT coursework. Enter
        your Decaf code below:
      </p>

      <div className="compiler-interface">
        <div className="input-section">
          <h4>Input Code</h4>
          <CodeEditor
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              compiler.checkErrors(e.target.value, setSyntaxErrors);
            }}
            syntaxErrors={syntaxErrors}
          />
          <div className="compile-controls">
            <button
              className="compile-button"
              onClick={compileCode}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Compile to Assembly"}
            </button>
            <div className="optimization-dropdown">
              <button
                className="optimization-toggle"
                onClick={() => setShowOptimizations(!showOptimizations)}
              >
                Optimizations ▼
              </button>
              {showOptimizations && (
                <div className="optimization-menu">
                  {optimizationOptions.map((opt) => (
                    <label key={opt.key} className="optimization-option">
                      <input
                        type="checkbox"
                        checked={optimizations.includes(opt.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOptimizations([...optimizations, opt.key]);
                          } else {
                            setOptimizations(
                              optimizations.filter((o) => o !== opt.key)
                            );
                          }
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            className="execute-button"
            onClick={executeCode}
            disabled={isRunning || !outputAssembly}
          >
            {isRunning ? "Running..." : "Execute x86 Code"}
          </button>
        </div>

        <div className="visualization-section">
          <h4>Control Flow Graph</h4>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ border: "1px solid #ccc", backgroundColor: "#fff" }}
          />
        </div>

        <div className="output-section">
          <h4>Generated Assembly</h4>
          {error && <div className="error-message">{error}</div>}
          <textarea
            className="code-output"
            value={outputAssembly}
            readOnly
            placeholder="Assembly output will appear here..."
            rows={15}
          />
        </div>

        <div className="execution-section">
          <h4>Execution Output</h4>
          <textarea
            className="execution-output"
            value={executionOutput}
            readOnly
            placeholder="Program output will appear here..."
            rows={8}
          />
        </div>
      </div>

      <div className="compiler-info">
        <h4>About This Compiler</h4>
        <p>
          This is a simplified web version of my multi-phase Decaf compiler,
          featuring:
        </p>
        <ul>
          <li>Lexical analysis and basic parsing</li>
          <li>Semantic analysis (simplified for web)</li>
          <li>x86-64 assembly code generation</li>
          <li>Error reporting and validation</li>
        </ul>
        <p>
          <em>
            Note: This is a simplified version for web demonstration. The full
            compiler includes advanced optimizations, control flow analysis, and
            complete language support.
          </em>
        </p>
      </div>
    </section>
  );
};

export default Compiler;
