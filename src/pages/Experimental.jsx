import { useState } from 'react'

const Experimental = () => {
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')

  const handleCompile = () => {
    // Dummy compilation - replace with your TypeScript compiler
    setOutput(`Compiled output:\n${code}`)
  }

  return (
    <section className="experimental">
      <h3>Experimental</h3>
      <div className="experimental-grid">
        <div className="experiment-card">
          <h4>AI Integration</h4>
          <p>Exploring machine learning APIs</p>
        </div>
        <div className="experiment-card">
          <h4>WebGL Graphics</h4>
          <p>3D rendering experiments</p>
        </div>
        <div className="experiment-card compiler-card">
          <h4>TypeScript Compiler</h4>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter TypeScript code here..."
            rows={8}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <button onClick={handleCompile} style={{ marginBottom: '10px' }}>
            Compile
          </button>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            rows={8}
            style={{ width: '100%', backgroundColor: '#f5f5f5' }}
          />
        </div>
      </div>
    </section>
  )
}

export default Experimental
