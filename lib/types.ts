export interface Category {
  id: string;
  name: string;
  department: string;
  description?: string | null;
  created_at?: string;
}

export interface Grievance {
  id: string;
  raw_text: string;
  language_detected?: string | null;
  citizen_contact?: string | null;
  location_hint?: string | null;
  status: 'pending' | 'classified' | 'processed';
  created_at?: string;
}

export interface StructuredSummary {
  summary: string;
  issue_type?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  extracted_entities?: Record<string, string>;
}

export interface Ticket {
  id: string;
  grievance_id: string;
  category_id?: string | null;
  structured_summary?: StructuredSummary | null;
  classification_method: string;
  confidence: number;
  matched_keywords?: string[] | null;
  reasoning?: string | null;
  status: 'draft' | 'confirmed' | 'rejected' | 'submitted';
  created_at?: string;
}

export interface Confirmation {
  id: string;
  ticket_id: string;
  citizen_action: 'accept' | 'modify' | 'reject';
  edited_fields?: Record<string, unknown> | null;
  confirmed_at?: string;
}

export interface ClassifyRequestPayload {
  raw_text: string;
  citizen_contact?: string;
  location_hint?: string;
}

export interface ClassifyResponsePayload {
  success: boolean;
  message: string;
  grievance_id?: string;
  ticket_id?: string;
  classification?: {
    category_id?: string;
    category_name?: string;
    confidence?: number;
    reasoning?: string;
  };
}

export interface ConfirmRequestPayload {
  ticket_id: string;
  citizen_action: 'accept' | 'modify' | 'reject';
  edited_fields?: Record<string, unknown>;
}
