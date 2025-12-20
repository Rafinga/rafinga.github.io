import { useState, useRef } from "react";
import WebCompiler from "../compiler/webCompiler.js";
import X86Interpreter from "../interpreter/x86Interpreter.ts";
import "../styles/compiler.css";

const Compiler = () => {
  const [inputCode, setInputCode] = useState(`// Example Decaf program
// Example Decaf program
import printf;
void main() {
    int x[3];
    x[0] = 5;        // Error: using 'x' before declaration  
    printf("%d\\n",x[0]);
}
`);
  const [outputAssembly, setOutputAssembly] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [optimizations, setOptimizations] = useState([
    "cp", "cse", "dce", "algebra", "fold", "regalloc", "inline"
  ]);

  const optimizationOptions = [
    { key: "cp", label: "Constant Propagation" },
    { key: "cse", label: "Common Subexpression Elimination" },
    { key: "dce", label: "Dead Code Elimination" },
    { key: "algebra", label: "Algebraic Simplification" },
    { key: "fold", label: "Constant Folding" },
    { key: "regalloc", label: "Register Allocation" },
    { key: "inline", label: "Function Inlining" }
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
      const result = compiler.compile(inputCode, optimizations);
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
        <div className="optimization-controls">
          <h4>Optimization Settings</h4>
          <div className="optimization-checkboxes">
            {optimizationOptions.map(opt => (
              <label key={opt.key} className="optimization-option">
                <input
                  type="checkbox"
                  checked={optimizations.includes(opt.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setOptimizations([...optimizations, opt.key]);
                    } else {
                      setOptimizations(optimizations.filter(o => o !== opt.key));
                    }
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="input-section">
          <h4>Input Code</h4>
          <textarea
            className="code-input"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter your Decaf code here..."
            rows={15}
          />
          <button
            className="compile-button"
            onClick={compileCode}
            disabled={isCompiling}
          >
            {isCompiling ? "Compiling..." : "Compile to Assembly"}
          </button>
          <button
            className="execute-button"
            onClick={executeCode}
            disabled={isRunning || !outputAssembly}
          >
            {isRunning ? "Running..." : "Execute x86 Code"}
          </button>
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
