import React from 'react';
import TeamMember from './TeamMember';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Mr Gopal Kumar',
    role: 'Lead AI Researcher',
    designation: 'Computer Vision Specialist',
    education: 'Bachelor of Technology in Information Technology',
    photo: 'https://github.com/user-attachments/assets/a6839b0a-ba96-4ccd-b11e-73a12950633a',
    email : 'gopal.kmr@yahoo.com'
  },
  {
    id: 2,
    name: 'Mr Sachin Singh',
    role: 'Data Engineer',
    designation: 'Data Engieering Team',
    education: 'Bachelor of Technology in computer Science',
    photo: 'https://github.com/user-attachments/assets/39cb74ef-1e0f-49c4-bbc3-4dca2f8a42a2',
    email : 'sachin@visionml.tech'
  },
  {
    name: 'Swetha Parthiban',
    role: 'AI Researcher',
    designation: 'Bachelor of Technology in Information Technology',
    photo: 'https://github.com/user-attachments/assets/a6839b0a-ba96-4ccd',
    email: '9921008045@klu.ac.in',
  },
 
];

const TeamSection: React.FC = () => {
  return (
    <div className="py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold mb-2">Meet Our People</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our team of expert researchers and engineers are dedicated to developing cutting-edge
          surveillance technology for public safety and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <TeamMember
            key={member.id}
            name={member.name}
            role={member.role}
            designation={member.designation}
            photo={member.photo}
            education={member.education}
            email={member.email}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
