const { getModel } = require('./gemini');

/**
 * Uses Gemini to classify form fields and map them to user profile data.
 * @param {Array} fields - Array of { id, name, label, placeholder, type, ariaLabel }
 * @param {Object} profile - User profile data
 * @returns {Array} - Array of { fieldId, profileKey, value }
 */
async function classifyFields(fields, profile) {
  const model = getModel();

  const profileSummary = JSON.stringify({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    zipCode: profile.zipCode,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    portfolioUrl: profile.portfolioUrl,
    websiteUrl: profile.websiteUrl,
    headline: profile.headline,
    summary: profile.summary,
    skills: profile.skills,
    yearsOfExp: profile.yearsOfExp,
    currentCompany: profile.experience?.[0]?.company,
    currentTitle: profile.experience?.[0]?.title,
    highestDegree: profile.education?.[0]?.degree,
    university: profile.education?.[0]?.institution,
  }, null, 2);

  const fieldsSummary = fields.map(f =>
    `ID: "${f.id}" | name: "${f.name}" | label: "${f.label}" | placeholder: "${f.placeholder}" | type: "${f.type}" | aria: "${f.ariaLabel || ''}"`
  ).join('\n');

  const prompt = `You are a smart form-filling assistant. Given a list of HTML form fields and a user profile, map each field to the correct profile value.

USER PROFILE:
${profileSummary}

FORM FIELDS:
${fieldsSummary}

Rules:
- Match fields based on their label, name, placeholder, and aria-label semantics
- Return ONLY a JSON array, no explanation
- If a field has no matching profile data, set value to ""
- For dropdowns (select), provide the best matching option text
- Common mappings: "first name/given name" → firstName, "last name/surname/family name" → lastName, "email/e-mail" → email, "phone/mobile/cell" → phone, "linkedin" → linkedinUrl, "github" → githubUrl, "portfolio/website" → portfolioUrl, "city" → city, "state/province" → state, "country" → country, "zip/postal" → zipCode, "summary/about/bio" → summary, "current company/employer" → currentCompany, "job title/current role" → currentTitle, "degree" → highestDegree, "university/school/college" → university

Output format (JSON array):
[
  { "fieldId": "field_id_here", "profileKey": "firstName", "value": "John" },
  ...
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Field classification error:', err);
    // Fallback: basic keyword matching
    return fields.map(f => {
      const combined = `${f.name} ${f.label} ${f.placeholder} ${f.ariaLabel || ''}`.toLowerCase();
      let value = '';
      if (/first.?name|given.?name|forename/i.test(combined)) value = profile.firstName || '';
      else if (/last.?name|surname|family.?name/i.test(combined)) value = profile.lastName || '';
      else if (/email|e-mail/i.test(combined)) value = profile.email || '';
      else if (/phone|mobile|cell/i.test(combined)) value = profile.phone || '';
      else if (/linkedin/i.test(combined)) value = profile.linkedinUrl || '';
      else if (/github/i.test(combined)) value = profile.githubUrl || '';
      else if (/portfolio|website/i.test(combined)) value = profile.portfolioUrl || '';
      else if (/city/i.test(combined)) value = profile.city || '';
      else if (/state|province/i.test(combined)) value = profile.state || '';
      else if (/country/i.test(combined)) value = profile.country || '';
      else if (/zip|postal/i.test(combined)) value = profile.zipCode || '';
      else if (/summary|about|bio/i.test(combined)) value = profile.summary || '';
      return { fieldId: f.id, profileKey: 'unknown', value };
    });
  }
}

module.exports = { classifyFields };
