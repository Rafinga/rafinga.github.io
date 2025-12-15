import { useState } from "react";
import WebCompiler from "../compiler/webCompiler.js";

const Compiler = () => {
  const [inputCode, setInputCode] = useState(`// Example Decaf program
import printf;
void main() {
    int x;
    x = 5;        // Error: using 'x' before declaration\
    printf("%d\n",x);
}
`);
  const [outputAssembly, setOutputAssembly] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState("");

  const compiler = new WebCompiler();

  const compileCode = async () => {
    setIsCompiling(true);
    setError("");
    setOutputAssembly("");

    try {
      // Use the web compiler
      const result = compiler.compile(inputCode);

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
