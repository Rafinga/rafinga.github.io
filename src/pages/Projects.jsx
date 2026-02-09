const Projects = () => {
  const projects = [
    { 
      name: 'C-like Language Compiler', 
      tech: 'Java, Antlr, Compiler Design', 
      description: 'Led development of a 10,000+ line codebase implementing a complete compiler. Verified user input semantics and grammar via Antlr parse generator. Implemented dataflow algorithms to improve runtime performance.',
      duration: 'Spring 2025',
      link: '#/compiler' 
    },
    { 
      name: 'FPGA Homomorphic Encryption System', 
      tech: 'Verilog, SystemVerilog, FPGA, Cryptography', 
      description: 'Designed Paillier cryptosystem on FPGA fabric using block stream approach for large number operations. Implemented parallel multiplication, exponentiation, and modulo modules for secure election vote encryption and decryption.',
      duration: 'Spring 2024',
      link: 'https://github.com/LuisGuille1729/fpga_election' 
    },
    { 
      name: 'Bouncy Animation System', 
      tech: 'C++, OpenGL, Physics Simulation', 
      description: 'Created a command-line real-time bouncy ball animation using C++ MIT OpenGL interface. Developed a general spring-gravity force system and integrator interfaces to model particle systems.',
      duration: 'Fall 2023',
      link: 'https://github.com/Rafinga/Bouncy-Ball' 
    },
    { 
      name: 'ASCII Video Renderer', 
      tech: 'Java, Computer Vision, Terminal Graphics', 
      description: 'Real-time video to ASCII art converter that transforms webcam or video input into terminal-based ASCII characters, creating live animated text representations.',
      duration: 'Personal Project',
      link: 'https://github.com/Rafinga/ascii-training' 
    }
  ]
  
  return (
    <section className="projects">
      <h3>Projects</h3>
      <div className="project-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card">
            <h4>{project.name}</h4>
            <p className="project-duration">{project.duration}</p>
            <p className="tech-stack">{project.tech}</p>
            <p className="project-description">{project.description}</p>
            <a href={project.link}>View Project</a>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Projects
