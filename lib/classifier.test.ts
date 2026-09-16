import { classifyGrievance } from './classifier';

async function runClassifierTests() {
  const testCases = [
    {
      name: 'Hindi Water Supply Grievance',
      text: 'हमारे मोहल्ले में 3 दिन से पानी नहीं आ रहा है, पीने का पानी खत्म हो गया है और गंदा पानी बह रहा है।',
      location: 'Ward 12, Indiranagar, Bhopal',
    },
    {
      name: 'Telugu Electricity Outage',
      text: 'మా ఏరియాలో నిన్నటి నుండి కరెంట్ లేదు, ట్రాన్స్‌ఫార్మర్ లో కరెంట్ షార్ట్ సర్క్యూట్ అయింది.',
      location: 'Miyapur, Hyderabad',
    },
    {
      name: 'English Sanitation Complaint',
      text: 'Garbage and plastic waste is overflowing in the street dustbin, creating foul smell and mosquitoes.',
      location: 'Sector 15, Gurgaon',
    },
    {
      name: 'Mixed Pothole / Road Complaint',
      text: 'Main road contains huge potholes, sadak toot gayi hai and roadu padaindi.',
      location: 'MG Road, Mysuru',
    },
    {
      name: 'Ambiguous Vernacular Grievance (LLM / Tiebreak Candidate)',
      text: 'There is a major public issue in our colony area requiring immediate government official attention.',
      location: 'Gandhi Nagar, Vijayawada',
    },
  ];

  console.log('=== Vernacular Grievance Classification Engine Test Run ===\n');

  for (const tc of testCases) {
    const result = await classifyGrievance(tc.text, tc.location);
    console.log(`Test: ${tc.name}`);
    console.log(`Input: "${tc.text}"`);
    console.log(`Location: ${tc.location}`);
    console.log(`Category: ${result.classification.category} (${result.classification.department})`);
    console.log(`Method Used: ${result.classification.method}`);
    console.log(`Confidence: ${result.classification.confidence}`);
    console.log(`Matched Keywords: [${result.classification.matched_keywords.join(', ')}]`);
    console.log(`Reasoning: ${result.classification.reasoning}`);
    console.log(`Structured Ticket:`, result.structured_ticket);
    console.log('--------------------------------------------------\n');
  }
}

runClassifierTests().catch(console.error);
