const Projects = () => {
  const projects = [
    { 
      name: 'C-like Language Compiler', 
      tech: 'Java, Antlr, Compiler Design', 
      description: 'Led development of a 10,000+ line codebase implementing a complete compiler. Verified user input semantics and grammar via Antlr parse generator. Implemented dataflow algorithms to improve runtime performance.',
      duration: 'Spring 2025',
      link: '#' 
    },
    { 
      name: 'Single Model X-ray Classifier', 
      tech: 'Python, Neural Networks, Computer Vision', 
      description: 'Built and trained a multi-headed residual neural network classifier to identify issues in patient X-ray scans using advanced computer vision techniques.',
      duration: 'Spring 2024',
      link: '#' 
    },
    { 
      name: 'Bouncy Animation System', 
      tech: 'C++, OpenGL, Physics Simulation', 
      description: 'Created a command-line real-time bouncy ball animation using C++ MIT OpenGL interface. Developed a general spring-gravity force system and integrator interfaces to model particle systems.',
      duration: 'Fall 2023',
      link: '#' 
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
