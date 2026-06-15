const { getModel } = require('./gemini');

/**
 * Generates a personalized cover letter using Gemini.
 */
async function generateCoverLetter(jobDescription, jobTitle, company, tone = 'professional', profile) {
  const model = getModel();

  const userName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || profile?.name || 'Candidate';
  const userEmail = profile?.email || '';
  const userPhone = profile?.phone || '';
  const userLinkedin = profile?.linkedinUrl || '';
  const userSkills = profile?.skills?.join(', ') || '';
  const userSummary = profile?.summary || '';
  const userExp = profile?.experience?.slice(0, 3).map(e =>
    `${e.title} at ${e.company} (${e.startDate || ''} - ${e.current ? 'Present' : e.endDate || ''}): ${e.description || ''}`
  ).join('\n') || '';
  const userEdu = profile?.education?.slice(0, 2).map(e =>
    `${e.degree || ''} in ${e.field || ''} from ${e.institution} (${e.endDate || ''})`
  ).join(', ') || '';
  const userProjects = profile?.projects?.slice(0, 2).map(p =>
    `${p.name}: ${p.description || ''}`
  ).join('\n') || '';

  const toneInstructions = {
    professional: 'formal, polished, and professional',
    enthusiastic: 'enthusiastic, energetic, and passionate',
    concise: 'concise, direct, and to-the-point (under 250 words)',
    creative: 'creative, unique, and memorable'
  }[tone] || 'professional';

  const prompt = `You are an expert career coach. Write a compelling cover letter that is ${toneInstructions}.

POSITION: ${jobTitle || 'the advertised position'}
COMPANY: ${company || 'your company'}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE INFO:
Name: ${userName}
Email: ${userEmail}
Phone: ${userPhone}
LinkedIn: ${userLinkedin}
Summary: ${userSummary}
Skills: ${userSkills}

EXPERIENCE:
${userExp}

EDUCATION:
${userEdu}

PROJECTS:
${userProjects}

Instructions:
- Write a complete, ready-to-send cover letter
- Start with "Dear Hiring Manager," or the specific recruiter if name is known
- Open with a compelling hook that references the specific role and company
- Highlight 2-3 most relevant experiences/skills that match the job
- Show genuine enthusiasm for the company and role
- End with a clear call to action
- Sign off with candidate's name
- Do NOT include placeholders like [Your Name] — use the actual data provided
- Keep it between 300-400 words (unless "concise" tone requested)
- Return ONLY the cover letter text, no JSON, no explanation`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Cover letter error:', err);
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle || 'open position'} at ${company || 'your company'}. With my background in ${userSkills || 'relevant technologies'} and ${profile?.yearsOfExp || 'several'} years of experience, I am confident I would be a valuable addition to your team.

${userSummary || 'I am passionate about delivering high-quality work and continuously learning.'}

I look forward to discussing how my experience aligns with your needs.

Best regards,
${userName}`;
  }
}

module.exports = { generateCoverLetter };
