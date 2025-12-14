const Experience = () => {
  const experiences = [
    {
      title: "Software Engineer",
      company: "Amazon Web Services (AWS)",
      duration: "September 2025 - Present",
      description: "Building tools using widgets, automated deployments, and infrastructure as code for the AWS Tag Policies team. Developing scalable solutions for resource tagging and policy management across AWS services."
    },
    {
      title: "Amazon SDE Intern",
      company: "Amazon",
      duration: "Summer 2024",
      description: "Used CDK to build an SNS notification consumer architecture that updates entries in a DynamoDB table, creating a self-updating L2 cache. Built a new API with throttling rates and authentication to update this cache."
    },
    {
      title: "Amazon Propel Intern", 
      company: "Amazon",
      duration: "Summer 2023",
      description: "Created a new Java library for the Prime Video team that parsed different routing data files, validated them, and uploaded data to different DynamoDB tables. Automated the process using AWS Lambda and performed extensive testing with Mockito and JUnit libraries."
    }
  ]

  const education = [
    {
      degree: "Bachelor of Science in Computer Science and Engineering",
      school: "Massachusetts Institute of Technology (MIT)",
      details: "GPA: 4.8/5.0",
      duration: "Class of 2025"
    }
  ]

  const coursework = [
    "Operating Systems", "Software Performance Engineering", "Computer Language Engineering", 
    "Advances in Computer Vision", "Software Construction", "Advanced Algorithms", 
    "Computer Graphics", "Computation Structures", "Linear Algebra"
  ]

  return (
    <section className="experience">
      <h3>Experience</h3>
      <div className="experience-list">
        {experiences.map((exp, index) => (
          <div key={index} className="experience-card">
            <h4>{exp.title}</h4>
            <h5>{exp.company}</h5>
            <p className="duration">{exp.duration}</p>
            <p className="description">{exp.description}</p>
          </div>
        ))}
      </div>

      <h3>Education</h3>
      <div className="education-list">
        {education.map((edu, index) => (
          <div key={index} className="experience-card">
            <h4>{edu.degree}</h4>
            <h5>{edu.school}</h5>
            <p className="duration">{edu.duration}</p>
            <p className="description">{edu.details}</p>
          </div>
        ))}
      </div>

      <h3>Relevant Coursework</h3>
      <div className="coursework-grid">
        {coursework.map((course, index) => (
          <span key={index} className="coursework-item">{course}</span>
        ))}
      </div>
    </section>
  )
}

export default Experience
