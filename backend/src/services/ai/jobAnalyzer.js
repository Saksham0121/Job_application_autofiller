const { getModel } = require('./gemini');

/**
 * Analyzes a job description against a user's profile and returns match score + insights.
 */
async function analyzeJobDescription(jobDescription, jobTitle, company, profile) {
  const model = getModel();

  const userSkills = profile?.skills?.join(', ') || '';
  const userExp = profile?.experience?.map(e => `${e.title} at ${e.company}`).join('; ') || '';
  const userEdu = profile?.education?.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('; ') || '';
  const userSummary = profile?.summary || '';

  const prompt = `You are a career advisor AI. Analyze how well this candidate matches the job description.

JOB TITLE: ${jobTitle || 'Not specified'}
COMPANY: ${company || 'Not specified'}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
- Skills: ${userSkills}
- Experience: ${userExp}
- Education: ${userEdu}
- Summary: ${userSummary}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "matchScore": <number 0-100>,
  "matchLevel": "<Excellent|Good|Fair|Poor>",
  "requiredSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "keyRequirements": ["req1", "req2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1"],
  "recommendation": "<short 2-3 sentence recommendation>",
  "keywords": ["keyword1", "keyword2"],
  "jobType": "<Full-time|Part-time|Contract|Internship>",
  "experienceLevel": "<Entry|Mid|Senior|Lead>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Job analysis error:', err);
    return {
      matchScore: 50,
      matchLevel: 'Fair',
      requiredSkills: [],
      matchingSkills: [],
      missingSkills: [],
      keyRequirements: [],
      strengths: [],
      gaps: [],
      recommendation: 'Could not analyze job description. Please try again.',
      keywords: [],
      jobType: 'Full-time',
      experienceLevel: 'Mid'
    };
  }
}

module.exports = { analyzeJobDescription };
