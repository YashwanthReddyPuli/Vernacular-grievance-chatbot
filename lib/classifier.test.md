# Classifier Engine Test Suite Results (`lib/classifier.test.md`)

This document summarizes the validation results for the two-stage **Vernacular Grievance Classification Engine**.

## Test Matrix & Results

| Test Case Name | Input Complaint Text | Primary Method | Confidence | Matched Keywords | Extracted Department |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hindi Water Supply** | `"हमारे मोहल्ले में 3 दिन से पानी नहीं आ रहा है..."` | `rule_based` | `1.0` | `पानी`, `गंदा पानी`, `पीने का पानी`, `पानी नहीं आ रहा` | Municipal Water Board |
| **Telugu Electricity** | `"మా ఏరియాలో నిన్నటి నుండి కరెంట్ లేదు..."` | `rule_based` | `1.0` | `కరెంట్`, `ట్రాన్స్‌ఫార్మర్` | Electricity Board |
| **English Sanitation** | `"Garbage and plastic waste is overflowing in dustbin..."` | `rule_based` | `1.0` | `garbage`, `waste`, `dustbin`, `smell`, `mosquitoes`, `overflow` | Sanitation Department |
| **Mixed Vernacular Road** | `"Main road contains huge potholes, sadak toot gayi..."` | `rule_based` | `1.0` | `road`, `pothole`, `sadak`, `roadu padaindi` | Public Works Department (PWD) |
| **Ambiguous / No Match** | `"There is a major public issue in our colony area..."` | `rule_based_fallback` | `0.0` | *None* | Water Supply (Fallback) |

---

## Explainability & Audit Log

- **Deterministic Stage 1**: Every rule-based classification logs the exact matched token list and candidate scores.
- **Fail-Safe Stage 2**: If an LLM key is absent or API execution fails, the system seamlessly transitions to `rule_based_fallback` without throwing exceptions or failing API requests.
