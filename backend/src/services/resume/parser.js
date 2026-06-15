const fs = require('fs');
const path = require('path');
const { getModel } = require('../ai/gemini');

/**
 * Parses a resume PDF/DOC and extracts structured profile data using Gemini.
 */
async function parseResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let textContent = '';

  if (ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      textContent = data.text;
    } catch (err) {
      console.error('PDF parse error:', err);
      throw new Error('Failed to read PDF');
    }
  } else if (ext === '.docx') {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      textContent = result.value;
    } catch (err) {
      throw new Error('Failed to read DOCX');
    }
  } else {
    textContent = fs.readFileSync(filePath, 'utf-8');
  }

  if (!textContent.trim()) throw new Error('Empty resume file');

  const model = getModel();

  const prompt = `You are a resume parsing expert. Extract all structured information from this resume text.

RESUME TEXT:
${textContent.substring(0, 8000)}

Return ONLY a valid JSON object with this exact structure (use null for missing fields):
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "location": "",
  "city": "",
  "state": "",
  "country": "",
  "linkedinUrl": "",
  "githubUrl": "",
  "portfolioUrl": "",
  "headline": "",
  "summary": "",
  "skills": [],
  "languages": [],
  "yearsOfExp": 0,
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "gpa": "",
      "current": false
    }
  ],
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "url": "",
      "techStack": []
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "issueDate": "",
      "credentialId": ""
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Resume parse AI error:', err);
    // Return minimal data from text
    const emailMatch = textContent.match(/[\w.+-]+@[\w-]+\.\w+/);
    const phoneMatch = textContent.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}/);
    return {
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      rawText: textContent.substring(0, 2000)
    };
  }
}

module.exports = { parseResume };
