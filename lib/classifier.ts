import { CATEGORY_DEFINITIONS } from './categories';

export interface CategoryCandidateScore {
  category: string;
  department: string;
  score: number;
  matched_keywords: string[];
}

export interface ClassificationMetadata {
  category: string;
  department: string;
  method: 'rule_based' | 'ai_assisted_tiebreak' | 'ai_assisted_fallback' | 'rule_based_fallback';
  confidence: number;
  matched_keywords: string[];
  candidates: CategoryCandidateScore[];
  reasoning?: string;
}

export interface StructuredTicketDraft {
  issue_summary: string;
  location: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  requested_action: string;
}

export interface ClassificationResponse {
  classification: ClassificationMetadata;
  structured_ticket: StructuredTicketDraft;
}

/**
 * Tokenizes and normalizes text for matching
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * STAGE 1: Deterministic Rule-Based Classification
 */
export function classifyRuleBased(rawText: string): {
  topCategory: string;
  topDepartment: string;
  confidence: number;
  matchedKeywords: string[];
  candidates: CategoryCandidateScore[];
  isAmbiguous: boolean;
} {
  const normalized = normalizeText(rawText);
  const candidates: CategoryCandidateScore[] = [];

  for (const [catName, def] of Object.entries(CATEGORY_DEFINITIONS)) {
    const matched: string[] = [];
    let matchCount = 0;

    for (const kw of def.keywords) {
      const normalizedKw = normalizeText(kw);
      if (normalizedKw && normalized.includes(normalizedKw)) {
        matched.push(kw);
        matchCount++;
      }
    }

    candidates.push({
      category: catName,
      department: def.department,
      score: matchCount,
      matched_keywords: matched,
    });
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  const top = candidates[0];
  const second = candidates[1];

  const totalMatches = candidates.reduce((acc, c) => acc + c.score, 0);

  // Confidence calculation
  let confidence = 0;
  if (totalMatches > 0) {
    confidence = Math.min(1.0, Number((top.score / Math.max(1, totalMatches * 0.7)).toFixed(2)));
  }

  // Ambiguity check: no keywords matched OR top two scores are within 1 match / closeness threshold
  const isAmbiguous = top.score === 0 || (second && top.score > 0 && top.score - second.score <= 1);

  return {
    topCategory: top ? top.category : 'Water Supply',
    topDepartment: top ? top.department : CATEGORY_DEFINITIONS['Water Supply'].department,
    confidence: confidence,
    matchedKeywords: top ? top.matched_keywords : [],
    candidates: candidates,
    isAmbiguous: isAmbiguous,
  };
}

/**
 * Stage 2 Helper: Call LLM API (Anthropic / Gemini / OpenAI or Fetch)
 */
async function callLLMStage2(
  rawText: string,
  locationHint?: string,
  candidates?: CategoryCandidateScore[]
): Promise<{
  category: string;
  department: string;
  reasoning: string;
  structured_ticket: StructuredTicketDraft;
} | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const prompt = `You are an expert civic grievance classifier for Indian Municipal and Regional Departments.
Analyze the following citizen complaint (written in Hindi, Telugu, English, or mixed vernacular dialect).

Complaint Text: "${rawText}"
Location Hint Provided: "${locationHint || 'None'}"

Top Matched Categories from Rule-based analysis:
${candidates ? candidates.slice(0, 3).map((c) => `- ${c.category} (${c.department}): ${c.score} keywords`).join('\n') : 'None'}

Valid Departments:
1. Water Supply (Municipal Water Board)
2. Electricity (Electricity Board)
3. Sanitation (Sanitation Department)
4. Roads/PWD (Public Works Department)
5. Police (Police Department)
6. Revenue/Land Records (Revenue Department)

Respond STRICTLY with a raw valid JSON object (no markdown, no backticks):
{
  "category": "<Exact name from the 6 valid departments above>",
  "department": "<Exact department name>",
  "reasoning": "<Short explanation of why this category was selected>",
  "issue_summary": "<Concise English summary of the main complaint>",
  "location": "<Extracted or inferred location/address>",
  "urgency": "<low|medium|high|urgent>",
  "requested_action": "<Clear action required by department>"
}`;

  try {
    // Anthropic API Call
    if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      const content = data.content?.[0]?.text || '';
      const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
      return {
        category: parsed.category,
        department: CATEGORY_DEFINITIONS[parsed.category]?.department || parsed.department,
        reasoning: parsed.reasoning,
        structured_ticket: {
          issue_summary: parsed.issue_summary || rawText,
          location: parsed.location || locationHint || 'Not specified',
          urgency: parsed.urgency || 'medium',
          requested_action: parsed.requested_action || 'Inspect and resolve issue',
        },
      };
    }

    // Gemini API Call
    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!res.ok) return null;
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return {
        category: parsed.category,
        department: CATEGORY_DEFINITIONS[parsed.category]?.department || parsed.department,
        reasoning: parsed.reasoning,
        structured_ticket: {
          issue_summary: parsed.issue_summary || rawText,
          location: parsed.location || locationHint || 'Not specified',
          urgency: parsed.urgency || 'medium',
          requested_action: parsed.requested_action || 'Inspect and resolve issue',
        },
      };
    }
  } catch (err) {
    console.warn('LLM Stage 2 execution failed, falling back to rule-based classification:', err);
    return null;
  }

  return null;
}

/**
 * Core Two-Stage Classification Function
 */
export async function classifyGrievance(
  rawText: string,
  locationHint?: string
): Promise<ClassificationResponse> {
  // STAGE 1: Deterministic Rule-Based Classification
  const stage1 = classifyRuleBased(rawText);

  // Fallback structured ticket extraction for rule-based mode
  const fallbackTicket: StructuredTicketDraft = {
    issue_summary: rawText.length > 120 ? `${rawText.substring(0, 117)}...` : rawText,
    location: locationHint && locationHint.trim() ? locationHint : 'Not specified',
    urgency: stage1.confidence > 0.6 ? 'high' : 'medium',
    requested_action: `Inspect and address issue in ${stage1.topCategory} department`,
  };

  // If Stage 1 is decisive (not ambiguous), return Stage 1 result immediately
  if (!stage1.isAmbiguous && stage1.confidence >= 0.5) {
    return {
      classification: {
        category: stage1.topCategory,
        department: stage1.topDepartment,
        method: 'rule_based',
        confidence: stage1.confidence,
        matched_keywords: stage1.matchedKeywords,
        candidates: stage1.candidates,
        reasoning: `Rule-based match: matched keyword(s) [${stage1.matchedKeywords.join(', ')}] for ${stage1.topCategory}.`,
      },
      structured_ticket: fallbackTicket,
    };
  }

  // STAGE 2: LLM-Assisted Tiebreak / Low Confidence Resolution
  const llmResult = await callLLMStage2(rawText, locationHint, stage1.candidates);

  if (llmResult) {
    return {
      classification: {
        category: llmResult.category,
        department: llmResult.department,
        method: 'ai_assisted_tiebreak',
        confidence: 0.9,
        matched_keywords: stage1.matchedKeywords,
        candidates: stage1.candidates,
        reasoning: llmResult.reasoning,
      },
      structured_ticket: llmResult.structured_ticket,
    };
  }

  // Fallback if LLM API is unavailable or failed
  return {
    classification: {
      category: stage1.topCategory,
      department: stage1.topDepartment,
      method: stage1.isAmbiguous ? 'rule_based_fallback' : 'rule_based',
      confidence: stage1.confidence,
      matched_keywords: stage1.matchedKeywords,
      candidates: stage1.candidates,
      reasoning: stage1.isAmbiguous
        ? `Ambiguous keyword scores (${stage1.candidates.slice(0, 2).map((c) => `${c.category}:${c.score}`).join(', ')}). Rule-based top match selected as fallback.`
        : `Rule-based match selected with matched keywords: [${stage1.matchedKeywords.join(', ')}].`,
    },
    structured_ticket: fallbackTicket,
  };
}
