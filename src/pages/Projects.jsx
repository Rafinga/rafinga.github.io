const Projects = () => {
  const projects = [
    { name: 'Project One', tech: 'React, Node.js', link: '#' },
    { name: 'Project Two', tech: 'Python, Flask', link: '#' },
    { name: 'Project Three', tech: 'JavaScript, Express', link: '#' }
  ]
  
  return (
    <section className="projects">
      <h3>Projects</h3>
      <div className="project-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card">
            <h4>{project.name}</h4>
            <p>{project.tech}</p>
            <a href={project.link}>View Project</a>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Projects
