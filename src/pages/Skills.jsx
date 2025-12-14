const Skills = () => {
  const languages = [
    'Java', 'C++', 'TypeScript', 'Python', 'HTML', 'CSS'
  ]

  const skills = [
    'React', 'CDK', 'Agile', 'Git', 'Mockito', 'JUnit', 
    'AWS Lambda', 'DynamoDB', 'S3', 'MongoDB'
  ]

  return (
    <section className="skills">
      <h3>Technical Skills</h3>
      
      <div className="skills-section">
        <h4>Programming Languages</h4>
        <div className="skills-grid">
          {languages.map((lang, index) => (
            <span key={index} className="skill-item">{lang}</span>
          ))}
        </div>
      </div>

      <div className="skills-section">
        <h4>Technologies & Tools</h4>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <span key={index} className="skill-item">{skill}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
