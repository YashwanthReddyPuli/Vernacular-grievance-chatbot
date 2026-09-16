// Department category metadata and multilingual keyword dictionaries (English, Hindi, Telugu)
export interface CategoryDefinition {
  id?: string;
  name: string;
  department: string;
  description: string;
  keywords: string[];
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  'Water Supply': {
    name: 'Water Supply',
    department: 'Municipal Water Board',
    description: 'Issues related to water supply, pipeline leakages, dirty water, and water metering.',
    keywords: [
      // English
      'water', 'pipeline', 'leakage', 'leak', 'tap water', 'water supply', 'dirty water',
      'drinking water', 'low pressure', 'water meter', 'water tank', 'tanker', 'no water',
      'contamination', 'sewage in water', 'broken pipe',
      // Hindi (Devanagari & Transliterated)
      'पानी', 'जल', 'नल', 'पाइपलाइन', 'रिसाव', 'गंदा पानी', 'पीने का पानी', 'पानी की आपूर्ति',
      'पानी नहीं आ रहा', 'टैंकर', 'पाइप टूट गया', 'paani', 'jal', 'nal', 'pipelain', 'ganda paani',
      'peene ka paani', 'paani nahi aa raha', 'tanker',
      // Telugu (Telugu Script & Transliterated)
      'నీరు', 'మంచినీళ్ళు', 'పైప్‌లైన్', 'లీకేజీ', 'తాగునీరు', 'నీటి సరఫరా', 'మురికి నీరు',
      'నీళ్ళు రావట్లేదు', 'ట్యాంకర్', 'neeru', 'manchineellu', 'pipeline', 'leakage', 'taaguneeru',
      'neeti sarafara', 'muriki neeru', 'neellu raavatledu', 'tanker'
    ],
  },
  'Electricity': {
    name: 'Electricity',
    department: 'Electricity Board',
    description: 'Power outages, transformer issues, high voltage fluctuations, and billing disputes.',
    keywords: [
      // English
      'electricity', 'power', 'power cut', 'outage', 'transformer', 'voltage', 'current',
      'electric pole', 'wire', 'short circuit', 'electricity bill', 'meter', 'power failure',
      'blackout', 'sparking',
      // Hindi (Devanagari & Transliterated)
      'बिजली', 'पावर', 'लाइट', 'ट्रांसफार्मर', 'बिजली कटौती', 'कटौती', 'वोल्टेज', 'बिजली का बिल',
      'तार', 'खंभा', 'करंट', 'bijli', 'power', 'light', 'transformer', 'bijli katoti', 'voltage',
      'bijli bill', 'taar', 'khamba', 'current',
      // Telugu (Telugu Script & Transliterated)
      'విద్యుత్', 'కరెంట్', 'పవర్', 'కరెంట్ పోయింది', 'ట్రాన్స్‌ఫార్మర్', 'వోల్టేజ్', 'కరెంట్ బిల్లు',
      'వైర్', 'స్తంభం', 'విద్యుత్ కోత', 'vidyut', 'current', 'power', 'current poyindi',
      'transformer', 'voltage', 'current billu', 'wire', 'stambham'
    ],
  },
  'Sanitation': {
    name: 'Sanitation',
    department: 'Sanitation Department',
    description: 'Garbage collection, sewage blockage, public hygiene, and waste management.',
    keywords: [
      // English
      'garbage', 'waste', 'trash', 'sewage', 'drain', 'drainage', 'dustbin', 'cleaning',
      'sanitation', 'filth', 'smell', 'mosquitoes', 'overflow', 'sweeper', 'waste collection',
      'stagnant water', 'gutters',
      // Hindi (Devanagari & Transliterated)
      'कचरा', 'गंदगी', 'नाली', 'सीवर', 'सफाई', 'कूड़ा', 'बदबू', 'मच्छर', 'नाला', 'कचरा गाड़ी',
      'kachra', 'gandagi', 'naali', 'seewer', 'safai', 'kooda', 'badboo', 'machhar', 'naala',
      // Telugu (Telugu Script & Transliterated)
      'చెత్త', 'మురికి', 'కాలువ', 'డ్రైనేజీ', 'చెత్త కుండీ', 'పారిశుధ్యం', 'దుర్గంధం', 'దోమలు',
      'చెత్త బండి', 'మరుగుదొడ్డి', 'chetta', 'muriki', 'kaaluva', 'drainage', 'chettakundi',
      'paarisudhyam', 'durgandham', 'domalu', 'chetta bandi'
    ],
  },
  'Roads/PWD': {
    name: 'Roads/PWD',
    department: 'Public Works Department',
    description: 'Potholes, broken roads, street lighting issues, and public infrastructure repairs.',
    keywords: [
      // English
      'road', 'pothole', 'street light', 'bridge', 'construction', 'footpath', 'asphalt',
      'broken road', 'tar road', 'highway', 'pavement', 'divider', 'speed breaker',
      // Hindi (Devanagari & Transliterated)
      'सड़क', 'गड्ढा', 'स्ट्रीट लाइट', 'सड़क टूट गई', 'पुल', 'फुटपाथ', 'स्पीड ब्रेकर', 'रास्ता',
      'sadak', 'gaddha', 'street light', 'sadak toot gayi', 'pul', 'footpath', 'speed breaker', 'raasta',
      // Telugu (Telugu Script & Transliterated)
      'రోడ్డు', 'గోతులు', 'వీధి దీపాలు', 'రోడ్డు పాడైంది', 'వంతెన', 'ఫుట్‌పాత్', 'స్పీడ్ బ్రేకర్',
      'రస్తా', 'రహదారి', 'roadu', 'gothulu', 'veedhi deepalu', 'roadu padaindi', 'vantena',
      'footpath', 'speed breaker', 'rahadaari'
    ],
  },
  'Police': {
    name: 'Police',
    department: 'Police Department',
    description: 'Law and order concerns, public safety, complaints, and neighborhood security.',
    keywords: [
      // English
      'police', 'theft', 'robbery', 'crime', 'harassment', 'noise', 'fighting', 'safety',
      'security', 'complaint', 'patrol', 'loudspeaker', 'threat', 'accident', 'stolen',
      // Hindi (Devanagari & Transliterated)
      'पुलिस', 'चोरी', 'अपराध', 'झगड़ा', 'सुरक्षा', 'शिकायत', 'शोर', 'लड़ाई', 'धमकी', 'हादसा',
      'police', 'chori', 'apradh', 'jhagda', 'suraksha', 'shikayat', 'shor', 'ladai', 'dhamki', 'hadsa',
      // Telugu (Telugu Script & Transliterated)
      'పోలీస్', 'దొంగతనం', 'నేరం', 'గొడవ', 'రక్షణ', 'ఫిర్యాదు', 'సౌండ్', 'యాక్సిడెంట్',
      'బెదిరింపు', 'శాంతి భద్రతలు', 'police', 'dongathanam', 'neram', 'godava', 'rakshana',
      'firyaadu', 'accident', 'bedirimpu'
    ],
  },
  'Revenue/Land Records': {
    name: 'Revenue/Land Records',
    department: 'Revenue Department',
    description: 'Property tax disputes, land title verification, patta/chitta queries, and revenue certificates.',
    keywords: [
      // English
      'land', 'property', 'tax', 'patta', 'chitta', 'registration', 'mutation', 'survey',
      'boundary', 'revenue', 'certificate', 'income certificate', 'caste certificate', 'land records',
      // Hindi (Devanagari & Transliterated)
      'जमीन', 'संपत्ति', 'कर', 'टैक्स', 'पटवारी', 'दाखिल खारिज', 'प्रमाण पत्र', 'आय प्रमाण पत्र',
      'भूमि', 'रजिस्ट्री', 'खसरा', 'खतौनी', 'jameen', 'sampatti', 'tax', 'patwari', 'praman patra',
      'bhoomi', 'registry', 'khasra',
      // Telugu (Telugu Script & Transliterated)
      'భూమి', 'ఆస్తి', 'పన్ను', 'పట్టా', 'పాస్ పుస్తకం', 'రిజిస్ట్రేషన్', 'ఆదాయ ధృవీకరణ పత్రం',
      'కులం సర్టిఫికేట్', 'రెవెన్యూ', 'సర్వే', 'bhoomi', 'aasti', 'pannu', 'patta', 'pass book',
      'registration', 'aadaya certificate', 'revenue', 'survey'
    ],
  },
};

// Legacy exports for compatibility
export const CATEGORY_KEYWORDS: Record<string, string[]> = Object.fromEntries(
  Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => [key, def.keywords])
);

export const CATEGORY_MAPPINGS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => [key, def.department])
);
