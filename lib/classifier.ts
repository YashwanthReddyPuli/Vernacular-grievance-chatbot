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
  low_confidence?: boolean;
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
 * Normalizes text for matching
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * STAGE 1: Deterministic Rule-Based Classification with Edge Case Handling
 */
export function classifyRuleBased(rawText: string): {
  topCategory: string;
  topDepartment: string;
  confidence: number;
  matchedKeywords: string[];
  candidates: CategoryCandidateScore[];
  isAmbiguous: boolean;
  isShortInput: boolean;
} {
  const normalized = normalizeText(rawText);
  const words = normalized.split(/\s+/).filter(Boolean);
  const isShortInput = words.length <= 4;

  const candidates: CategoryCandidateScore[] = [];

  for (const [catName, def] of Object.entries(CATEGORY_DEFINITIONS)) {
    const matched: string[] = [];
    let matchCount = 0;

    for (const kw of def.keywords) {
      const normalizedKw = normalizeText(kw);
      if (normalizedKw && normalized.includes(normalizedKw)) {
        // Prevent duplicate keyword matches
        if (!matched.includes(kw)) {
          matched.push(kw);
          matchCount++;
        }
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

  // Scaled confidence calculation
  let confidence = 0;
  if (totalMatches > 0 && top.score > 0) {
    if (isShortInput && top.score <= 1) {
      // Short 2-3 word inputs get a capped lower confidence score
      confidence = 0.35;
    } else {
      confidence = Math.min(1.0, Number((top.score / Math.max(1, totalMatches * 0.75)).toFixed(2)));
    }
  }

  // Ambiguity condition: 0 matches OR top 2 scores within 1 match distance
  const isAmbiguous = top.score === 0 || (second && top.score > 0 && top.score - second.score <= 1);

  return {
    topCategory: top && top.score > 0 ? top.category : 'Water Supply',
    topDepartment: top && top.score > 0 ? top.department : CATEGORY_DEFINITIONS['Water Supply'].department,
    confidence: confidence,
    matchedKeywords: top ? top.matched_keywords : [],
    candidates: candidates,
    isAmbiguous: isAmbiguous,
    isShortInput: isShortInput,
  };
}

/**
 * Stage 2 Helper: Call LLM API with fallback
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

  if (!apiKey) return null;

  const prompt = `You are an expert civic grievance classifier for Indian Municipal & State Departments.
Analyze this citizen complaint (written in English, Hindi, Telugu, code-switched dialect, or rambling text).

Complaint Text: "${rawText}"
Location Hint: "${locationHint || 'None'}"

Candidates from Keyword Analysis:
${candidates ? candidates.slice(0, 3).map((c) => `- ${c.category} (${c.department}): ${c.score} matches`).join('\n') : 'None'}

Valid Departments:
1. Water Supply (Municipal Water Board)
2. Electricity (Electricity Board)
3. Sanitation (Sanitation Department)
4. Roads/PWD (Public Works Department)
5. Police (Police Department)
6. Revenue/Land Records (Revenue Department)

Respond STRICTLY with raw JSON (no markdown formatting):
{
  "category": "<Exact category name from valid list>",
  "department": "<Exact department name>",
  "reasoning": "<Short explanation resolving the core issue>",
  "issue_summary": "<Concise 1-sentence English summary isolating the core issue>",
  "location": "<Extracted or inferred location>",
  "urgency": "<low|medium|high|urgent>",
  "requested_action": "<Clear action required>"
}`;

  try {
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
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return {
        category: parsed.category,
        department: CATEGORY_DEFINITIONS[parsed.category]?.department || parsed.department,
        reasoning: parsed.reasoning,
        structured_ticket: {
          issue_summary: parsed.issue_summary || rawText.substring(0, 100),
          location: parsed.location || locationHint || 'Not specified',
          urgency: parsed.urgency || 'medium',
          requested_action: parsed.requested_action || 'Address grievance',
        },
      };
    }

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
          issue_summary: parsed.issue_summary || rawText.substring(0, 100),
          location: parsed.location || locationHint || 'Not specified',
          urgency: parsed.urgency || 'medium',
          requested_action: parsed.requested_action || 'Address grievance',
        },
      };
    }
  } catch (err) {
    console.warn('LLM Stage 2 execution failed, using rule-based fallback:', err);
    return null;
  }

  return null;
}

/**
 * Core Two-Stage Classification Function with Hardened Edge-Case Support
 */
export async function classifyGrievance(
  rawText: string,
  locationHint?: string
): Promise<ClassificationResponse> {
  const stage1 = classifyRuleBased(rawText);

  // Clean, concise summary extraction for long/rambling inputs
  const cleanSummary =
    rawText.length > 140
      ? `${rawText.substring(0, 137).trim()}...`
      : rawText.trim();

  const fallbackTicket: StructuredTicketDraft = {
    issue_summary: cleanSummary,
    location: locationHint && locationHint.trim() ? locationHint.trim() : 'Not specified',
    urgency: stage1.confidence >= 0.6 ? 'high' : 'medium',
    requested_action: `Inspect and address issue in ${stage1.topCategory} department`,
  };

  // If Stage 1 is non-ambiguous & has high confidence, return Stage 1 immediately
  if (!stage1.isAmbiguous && stage1.confidence >= 0.5) {
    return {
      classification: {
        category: stage1.topCategory,
        department: stage1.topDepartment,
        method: 'rule_based',
        confidence: stage1.confidence,
        matched_keywords: stage1.matchedKeywords,
        candidates: stage1.candidates,
        reasoning: `Rule-based match: identified keyword(s) [${stage1.matchedKeywords.join(', ')}] for ${stage1.topCategory}.`,
        low_confidence: false,
      },
      structured_ticket: fallbackTicket,
    };
  }

  // STAGE 2: LLM Tiebreak for ambiguous or low keyword count
  const llmResult = await callLLMStage2(rawText, locationHint, stage1.candidates);

  if (llmResult) {
    return {
      classification: {
        category: llmResult.category,
        department: llmResult.department,
        method: 'ai_assisted_tiebreak',
        confidence: 0.88,
        matched_keywords: stage1.matchedKeywords,
        candidates: stage1.candidates,
        reasoning: llmResult.reasoning,
        low_confidence: false,
      },
      structured_ticket: llmResult.structured_ticket,
    };
  }

  // Fallback mode when Stage 2 API is unavailable or failed
  const finalConfidence = stage1.confidence;
  const isLowConfidence = finalConfidence < 0.35 || stage1.matchedKeywords.length === 0;

  return {
    classification: {
      category: stage1.topCategory,
      department: stage1.topDepartment,
      method: stage1.isAmbiguous ? 'rule_based_fallback' : 'rule_based',
      confidence: finalConfidence,
      matched_keywords: stage1.matchedKeywords,
      candidates: stage1.candidates,
      reasoning: isLowConfidence
        ? `Low keyword score (${stage1.candidates.slice(0, 2).map((c) => `${c.category}:${c.score}`).join(', ')}). Manual department selection recommended.`
        : `Rule-based match selected with matched keywords: [${stage1.matchedKeywords.join(', ')}].`,
      low_confidence: isLowConfidence,
    },
    structured_ticket: fallbackTicket,
  };
}
