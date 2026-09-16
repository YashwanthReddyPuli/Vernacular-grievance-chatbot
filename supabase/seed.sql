-- Seed file: supabase/seed.sql
-- Description: Initial categories and departments for MeitY Grievance Redressal System

INSERT INTO categories (name, department, description) VALUES
('Water Supply', 'Municipal Water Board', 'Issues related to water supply, pipeline leakages, dirty water, and water metering.'),
('Electricity', 'Electricity Board', 'Power outages, transformer issues, high voltage fluctuations, and billing disputes.'),
('Sanitation', 'Sanitation Department', 'Garbage collection, sewage blockage, public hygiene, and waste management.'),
('Roads/PWD', 'Public Works Department', 'Potholes, broken roads, street lighting issues, and public infrastructure repairs.'),
('Police', 'Police Department', 'Law and order concerns, public safety, complaints, and neighborhood security.'),
('Revenue/Land Records', 'Revenue Department', 'Property tax disputes, land title verification, patta/chitta queries, and revenue certificates.');
