-- ContractorOS Initial Schema Migration
-- All monetary values are stored as INTEGER in cents (e.g., $100.00 = 10000)
-- All tables use UUID primary keys, timestamps, and soft deletes

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'owner', 'admin', 'project_manager', 'estimator', 'field_crew', 'accounting', 'sales'
);

CREATE TYPE contact_type AS ENUM (
  'lead', 'customer', 'vendor', 'subcontractor'
);

CREATE TYPE lead_source AS ENUM (
  'website', 'referral', 'social_media', 'phone', 'email', 'advertising', 'repeat', 'other'
);

CREATE TYPE lead_temperature AS ENUM (
  'hot', 'warm', 'cold', 'dead'
);

CREATE TYPE interaction_type AS ENUM (
  'phone_call', 'email', 'sms', 'meeting', 'site_visit', 'note', 'form_submission'
);

CREATE TYPE interaction_direction AS ENUM (
  'inbound', 'outbound'
);

CREATE TYPE unit_of_measure AS ENUM (
  'each', 'sqft', 'lnft', 'cuyd', 'hour', 'day', 'lump_sum', 'gallon', 'board_ft'
);

CREATE TYPE estimate_status AS ENUM (
  'draft', 'sent', 'viewed', 'approved', 'rejected', 'revised', 'expired'
);

CREATE TYPE contract_type AS ENUM (
  'fixed_price', 'cost_plus', 'time_and_material', 'unit_price'
);

CREATE TYPE project_status AS ENUM (
  'pre_construction', 'in_progress', 'on_hold', 'punch_list', 'completed', 'closed', 'cancelled'
);

CREATE TYPE priority_level AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE task_status AS ENUM (
  'not_started', 'in_progress', 'completed', 'blocked', 'cancelled'
);

CREATE TYPE delay_reason AS ENUM (
  'weather', 'material', 'labor', 'inspection', 'client', 'permit', 'other'
);

CREATE TYPE time_entry_status AS ENUM (
  'pending', 'approved', 'rejected'
);

CREATE TYPE change_order_status AS ENUM (
  'draft', 'pending_approval', 'approved', 'rejected'
);

CREATE TYPE permit_status AS ENUM (
  'not_applied', 'applied', 'in_review', 'approved', 'denied', 'expired'
);

CREATE TYPE inspection_status AS ENUM (
  'scheduled', 'passed', 'failed', 'rescheduled', 'cancelled'
);

CREATE TYPE invoice_type AS ENUM (
  'progress', 'final', 'retainage', 'change_order', 'deposit'
);

CREATE TYPE invoice_status AS ENUM (
  'draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'void'
);

CREATE TYPE payment_terms AS ENUM (
  'due_on_receipt', 'net_15', 'net_30', 'net_45', 'net_60', 'custom'
);

CREATE TYPE payment_method AS ENUM (
  'check', 'cash', 'credit_card', 'ach', 'wire', 'stripe', 'other'
);

CREATE TYPE po_status AS ENUM (
  'draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled'
);

CREATE TYPE bid_request_status AS ENUM (
  'draft', 'sent', 'responses_received', 'awarded', 'closed'
);

CREATE TYPE document_category AS ENUM (
  'contract', 'permit', 'insurance', 'photo', 'plan', 'specification',
  'invoice', 'receipt', 'license', 'bond', 'warranty', 'other'
);

CREATE TYPE message_recipient_type AS ENUM (
  'internal', 'client', 'vendor', 'subcontractor'
);

CREATE TYPE warranty_type AS ENUM (
  'workmanship', 'material', 'equipment', 'manufacturer'
);

CREATE TYPE warranty_status AS ENUM (
  'active', 'expiring_soon', 'expired', 'claimed'
);

CREATE TYPE warranty_claim_status AS ENUM (
  'reported', 'under_review', 'approved', 'in_progress', 'resolved', 'denied'
);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ORGANIZATION & USERS
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  license_number TEXT,
  license_expiry DATE,
  tax_id TEXT,
  default_markup_percentage INTEGER DEFAULT 0, -- stored as basis points (e.g., 2000 = 20.00%)
  default_tax_rate INTEGER DEFAULT 0,           -- stored as basis points
  fiscal_year_start_month INTEGER DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
  subscription_tier TEXT,
  subscription_status TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'field_crew',
  hourly_rate INTEGER DEFAULT 0,   -- cents
  overtime_rate INTEGER DEFAULT 0, -- cents
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (email, organization_id)
);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CRM & LEADS
-- ============================================================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  type contact_type NOT NULL DEFAULT 'lead',
  company_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  source lead_source,
  source_detail TEXT,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
  lead_temperature lead_temperature,
  assigned_to UUID REFERENCES users(id),
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  total_lifetime_value INTEGER DEFAULT 0, -- cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_lead_temperature ON contacts(lead_temperature);

CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE lead_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  is_won_stage BOOLEAN NOT NULL DEFAULT FALSE,
  is_lost_stage BOOLEAN NOT NULL DEFAULT FALSE,
  auto_actions JSONB DEFAULT '{}',
  days_until_stale INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_lead_pipeline_stages_organization_id ON lead_pipeline_stages(organization_id);

CREATE TRIGGER set_lead_pipeline_stages_updated_at
  BEFORE UPDATE ON lead_pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE lead_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  stage_id UUID NOT NULL REFERENCES lead_pipeline_stages(id),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  moved_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_lead_stage_history_contact_id ON lead_stage_history(contact_id);
CREATE INDEX idx_lead_stage_history_stage_id ON lead_stage_history(stage_id);

CREATE TRIGGER set_lead_stage_history_updated_at
  BEFORE UPDATE ON lead_stage_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  type interaction_type NOT NULL,
  direction interaction_direction,
  subject TEXT,
  body TEXT,
  logged_by UUID REFERENCES users(id),
  duration_minutes INTEGER,
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_logged_by ON interactions(logged_by);
CREATE INDEX idx_interactions_follow_up_date ON interactions(follow_up_date);

CREATE TRIGGER set_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE follow_up_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  trigger_stage_id UUID REFERENCES lead_pipeline_stages(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_follow_up_sequences_organization_id ON follow_up_sequences(organization_id);

CREATE TRIGGER set_follow_up_sequences_updated_at
  BEFORE UPDATE ON follow_up_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE web_lead_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  fields_config JSONB DEFAULT '[]',
  assign_to UUID REFERENCES users(id),
  initial_stage_id UUID REFERENCES lead_pipeline_stages(id),
  notification_emails TEXT[],
  confirmation_message TEXT,
  redirect_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_web_lead_forms_organization_id ON web_lead_forms(organization_id);
CREATE INDEX idx_web_lead_forms_slug ON web_lead_forms(slug);

CREATE TRIGGER set_web_lead_forms_updated_at
  BEFORE UPDATE ON web_lead_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ESTIMATING & COST MANAGEMENT
-- ============================================================================

CREATE TABLE cost_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  category TEXT,
  subcategory TEXT,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  unit_of_measure unit_of_measure,
  unit_cost INTEGER DEFAULT 0,        -- cents
  markup_percentage INTEGER DEFAULT 0, -- basis points
  preferred_vendor_id UUID REFERENCES contacts(id),
  last_price_update TIMESTAMPTZ,
  price_history JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_cost_catalog_organization_id ON cost_catalog(organization_id);
CREATE INDEX idx_cost_catalog_category ON cost_catalog(category);
CREATE INDEX idx_cost_catalog_sku ON cost_catalog(sku);

CREATE TRIGGER set_cost_catalog_updated_at
  BEFORE UPDATE ON cost_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE cost_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  items JSONB DEFAULT '[]',
  total_cost INTEGER DEFAULT 0, -- cents
  cascade_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_cost_groups_organization_id ON cost_groups(organization_id);

CREATE TRIGGER set_cost_groups_updated_at
  BEFORE UPDATE ON cost_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Forward-declare projects table for estimates FK
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  estimate_id UUID, -- FK added after estimates table
  project_number INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'pre_construction',
  project_type TEXT,
  priority priority_level DEFAULT 'medium',
  job_site_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  job_site_lat NUMERIC(10, 7),
  job_site_lng NUMERIC(10, 7),
  contract_type contract_type,
  contract_amount INTEGER DEFAULT 0,       -- cents
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  budget_total INTEGER DEFAULT 0,          -- cents
  budget_spent INTEGER DEFAULT 0,          -- cents
  budget_remaining INTEGER DEFAULT 0,      -- cents
  profit_target_percentage INTEGER DEFAULT 0, -- basis points
  actual_profit_percentage INTEGER DEFAULT 0, -- basis points
  assigned_pm UUID REFERENCES users(id),
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_contact_id ON projects(contact_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_assigned_pm ON projects(assigned_pm);

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  estimate_number INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  status estimate_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  parent_estimate_id UUID REFERENCES estimates(id),
  valid_until DATE,
  contract_type contract_type,
  subtotal INTEGER DEFAULT 0,           -- cents
  tax_amount INTEGER DEFAULT 0,         -- cents
  total INTEGER DEFAULT 0,              -- cents
  markup_percentage INTEGER DEFAULT 0,  -- basis points
  profit_margin INTEGER DEFAULT 0,      -- basis points
  notes TEXT,
  terms_and_conditions TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_signature_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Now add the FK from projects -> estimates
ALTER TABLE projects ADD CONSTRAINT fk_projects_estimate FOREIGN KEY (estimate_id) REFERENCES estimates(id);

CREATE INDEX idx_estimates_organization_id ON estimates(organization_id);
CREATE INDEX idx_estimates_project_id ON estimates(project_id);
CREATE INDEX idx_estimates_contact_id ON estimates(contact_id);
CREATE INDEX idx_estimates_status ON estimates(status);

CREATE TRIGGER set_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE estimate_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_optional BOOLEAN DEFAULT FALSE,
  subtotal INTEGER DEFAULT 0, -- cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_estimate_sections_estimate_id ON estimate_sections(estimate_id);

CREATE TRIGGER set_estimate_sections_updated_at
  BEFORE UPDATE ON estimate_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES estimate_sections(id),
  cost_catalog_id UUID REFERENCES cost_catalog(id),
  description TEXT,
  quantity NUMERIC(12, 4) DEFAULT 0,
  unit_of_measure unit_of_measure,
  unit_cost INTEGER DEFAULT 0,          -- cents
  markup_percentage INTEGER DEFAULT 0,  -- basis points
  total_cost INTEGER DEFAULT 0,         -- cents
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible_to_client BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_estimate_line_items_section_id ON estimate_line_items(section_id);

CREATE TRIGGER set_estimate_line_items_updated_at
  BEFORE UPDATE ON estimate_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PROJECT MANAGEMENT (remaining tables)
-- ============================================================================

CREATE TABLE project_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  category TEXT,
  subcategory TEXT,
  description TEXT,
  budget_amount INTEGER DEFAULT 0,  -- cents
  actual_amount INTEGER DEFAULT 0,  -- cents
  variance INTEGER DEFAULT 0,       -- cents
  cost_catalog_id UUID REFERENCES cost_catalog(id),
  vendor_id UUID REFERENCES contacts(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_project_budget_items_project_id ON project_budget_items(project_id);

CREATE TRIGGER set_project_budget_items_updated_at
  BEFORE UPDATE ON project_budget_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  parent_task_id UUID REFERENCES tasks(id),
  name TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'not_started',
  priority priority_level DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  assigned_crew TEXT[],
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  actual_start DATE,
  actual_end DATE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  dependencies JSONB DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_milestone BOOLEAN DEFAULT FALSE,
  checklist JSONB DEFAULT '[]',
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  logged_by UUID NOT NULL REFERENCES users(id),
  log_date DATE NOT NULL,
  weather_conditions TEXT,
  temperature_high INTEGER, -- fahrenheit
  temperature_low INTEGER,  -- fahrenheit
  work_performed TEXT,
  materials_used TEXT,
  visitors TEXT,
  safety_incidents TEXT,
  delays TEXT,
  delay_reason delay_reason,
  crew_on_site JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_daily_logs_project_id ON daily_logs(project_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);

CREATE TRIGGER set_daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  hours NUMERIC(6, 2) DEFAULT 0,
  is_overtime BOOLEAN DEFAULT FALSE,
  hourly_rate INTEGER DEFAULT 0,  -- cents
  total_cost INTEGER DEFAULT 0,   -- cents
  description TEXT,
  status time_entry_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);

CREATE TRIGGER set_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  change_order_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  status change_order_status NOT NULL DEFAULT 'draft',
  amount INTEGER DEFAULT 0, -- cents (can be negative)
  impact_on_schedule_days INTEGER DEFAULT 0,
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  signature_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);

CREATE TRIGGER set_change_orders_updated_at
  BEFORE UPDATE ON change_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  permit_type TEXT,
  permit_number TEXT,
  status permit_status NOT NULL DEFAULT 'not_applied',
  applied_date DATE,
  approved_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  cost INTEGER DEFAULT 0, -- cents
  notes TEXT,
  document_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_permits_project_id ON permits(project_id);

CREATE TRIGGER set_permits_updated_at
  BEFORE UPDATE ON permits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  permit_id UUID REFERENCES permits(id),
  inspection_type TEXT,
  scheduled_date DATE,
  actual_date DATE,
  status inspection_status NOT NULL DEFAULT 'scheduled',
  inspector_name TEXT,
  result_notes TEXT,
  corrections_required TEXT,
  follow_up_date DATE,
  document_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_inspections_project_id ON inspections(project_id);
CREATE INDEX idx_inspections_permit_id ON inspections(permit_id);
CREATE INDEX idx_inspections_scheduled_date ON inspections(scheduled_date);

CREATE TRIGGER set_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FINANCIAL MANAGEMENT
-- ============================================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  invoice_number INTEGER,
  type invoice_type NOT NULL DEFAULT 'progress',
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE,
  due_date DATE,
  paid_date DATE,
  subtotal INTEGER DEFAULT 0,       -- cents
  tax_amount INTEGER DEFAULT 0,     -- cents
  total INTEGER DEFAULT 0,          -- cents
  amount_paid INTEGER DEFAULT 0,    -- cents
  balance_due INTEGER DEFAULT 0,    -- cents
  payment_terms payment_terms DEFAULT 'net_30',
  notes TEXT,
  payment_instructions TEXT,
  stripe_invoice_id TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  reminder_sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  description TEXT,
  quantity NUMERIC(12, 4) DEFAULT 0,
  unit_price INTEGER DEFAULT 0,  -- cents
  total INTEGER DEFAULT 0,       -- cents
  budget_item_id UUID REFERENCES project_budget_items(id),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

CREATE TRIGGER set_invoice_line_items_updated_at
  BEFORE UPDATE ON invoice_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  amount INTEGER NOT NULL DEFAULT 0, -- cents
  payment_date DATE NOT NULL,
  payment_method payment_method,
  reference_number TEXT,
  stripe_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  vendor_id UUID NOT NULL REFERENCES contacts(id),
  po_number INTEGER,
  status po_status NOT NULL DEFAULT 'draft',
  subtotal INTEGER DEFAULT 0,     -- cents
  tax_amount INTEGER DEFAULT 0,   -- cents
  total INTEGER DEFAULT 0,        -- cents
  expected_delivery_date DATE,
  delivery_address TEXT,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_purchase_orders_project_id ON purchase_orders(project_id);
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);

CREATE TRIGGER set_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE po_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  description TEXT,
  quantity NUMERIC(12, 4) DEFAULT 0,
  unit_price INTEGER DEFAULT 0,       -- cents
  total INTEGER DEFAULT 0,            -- cents
  quantity_received NUMERIC(12, 4) DEFAULT 0,
  budget_item_id UUID REFERENCES project_budget_items(id),
  cost_catalog_id UUID REFERENCES cost_catalog(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_po_line_items_purchase_order_id ON po_line_items(purchase_order_id);

CREATE TRIGGER set_po_line_items_updated_at
  BEFORE UPDATE ON po_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE bid_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  sent_to JSONB DEFAULT '[]',
  scope_of_work TEXT,
  due_date DATE,
  status bid_request_status NOT NULL DEFAULT 'draft',
  attachments TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_bid_requests_project_id ON bid_requests(project_id);

CREATE TRIGGER set_bid_requests_updated_at
  BEFORE UPDATE ON bid_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE bid_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_request_id UUID NOT NULL REFERENCES bid_requests(id),
  vendor_id UUID NOT NULL REFERENCES contacts(id),
  amount INTEGER DEFAULT 0, -- cents
  scope_notes TEXT,
  timeline_days INTEGER,
  submitted_at TIMESTAMPTZ,
  attachments TEXT[],
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_bid_responses_bid_request_id ON bid_responses(bid_request_id);
CREATE INDEX idx_bid_responses_vendor_id ON bid_responses(vendor_id);

CREATE TRIGGER set_bid_responses_updated_at
  BEFORE UPDATE ON bid_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DOCUMENTS & COMMUNICATION
-- ============================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  contact_id UUID REFERENCES contacts(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER, -- bytes
  category document_category DEFAULT 'other',
  tags TEXT[],
  is_shared_with_client BOOLEAN DEFAULT FALSE,
  expiry_date DATE,
  expiry_alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_category ON documents(category);

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE photo_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  annotation_data JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_photo_annotations_document_id ON photo_annotations(document_id);

CREATE TRIGGER set_photo_annotations_updated_at
  BEFORE UPDATE ON photo_annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  sender_id UUID REFERENCES users(id),
  sender_contact_id UUID REFERENCES contacts(id),
  recipient_type message_recipient_type NOT NULL DEFAULT 'internal',
  subject TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  parent_message_id UUID REFERENCES messages(id),
  attachments TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_organization_id ON messages(organization_id);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_parent_message_id ON messages(parent_message_id);

CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT,
  title TEXT NOT NULL,
  body TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUBCONTRACTOR & VENDOR MANAGEMENT
-- ============================================================================

CREATE TABLE subcontractor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) UNIQUE,
  trade_specialties TEXT[],
  service_area TEXT,
  insurance_expiry DATE,
  license_expiry DATE,
  bond_expiry DATE,
  insurance_document_id UUID REFERENCES documents(id),
  license_document_id UUID REFERENCES documents(id),
  w9_on_file BOOLEAN DEFAULT FALSE,
  average_rating NUMERIC(3, 2),
  total_projects_completed INTEGER DEFAULT 0,
  reliability_score NUMERIC(3, 2),
  quality_score NUMERIC(3, 2),
  price_competitiveness_score NUMERIC(3, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_subcontractor_profiles_contact_id ON subcontractor_profiles(contact_id);

CREATE TRIGGER set_subcontractor_profiles_updated_at
  BEFORE UPDATE ON subcontractor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE subcontractor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontractor_profile_id UUID NOT NULL REFERENCES subcontractor_profiles(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  reviewed_by UUID NOT NULL REFERENCES users(id),
  quality_rating INTEGER NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER NOT NULL CHECK (timeliness_rating BETWEEN 1 AND 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  price_rating INTEGER NOT NULL CHECK (price_rating BETWEEN 1 AND 5),
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  notes TEXT,
  would_hire_again BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_subcontractor_reviews_profile_id ON subcontractor_reviews(subcontractor_profile_id);
CREATE INDEX idx_subcontractor_reviews_project_id ON subcontractor_reviews(project_id);

CREATE TRIGGER set_subcontractor_reviews_updated_at
  BEFORE UPDATE ON subcontractor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- WARRANTIES & POST-PROJECT
-- ============================================================================

CREATE TABLE warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  warranty_type warranty_type NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  coverage_details TEXT,
  manufacturer_name TEXT,
  contact_info TEXT,
  document_id UUID REFERENCES documents(id),
  status warranty_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_warranties_project_id ON warranties(project_id);
CREATE INDEX idx_warranties_status ON warranties(status);
CREATE INDEX idx_warranties_end_date ON warranties(end_date);

CREATE TRIGGER set_warranties_updated_at
  BEFORE UPDATE ON warranties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_id UUID NOT NULL REFERENCES warranties(id),
  reported_date DATE NOT NULL,
  description TEXT,
  status warranty_claim_status NOT NULL DEFAULT 'reported',
  resolution_notes TEXT,
  resolved_date DATE,
  cost INTEGER DEFAULT 0, -- cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_warranty_claims_warranty_id ON warranty_claims(warranty_id);

CREATE TRIGGER set_warranty_claims_updated_at
  BEFORE UPDATE ON warranty_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE client_satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  testimonial TEXT,
  permission_to_use_testimonial BOOLEAN DEFAULT FALSE,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_client_satisfaction_surveys_project_id ON client_satisfaction_surveys(project_id);
CREATE INDEX idx_client_satisfaction_surveys_contact_id ON client_satisfaction_surveys(contact_id);

CREATE TRIGGER set_client_satisfaction_surveys_updated_at
  BEFORE UPDATE ON client_satisfaction_surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-INCREMENT SEQUENCES (per organization)
-- Uses a helper function to generate the next number scoped to an org.
-- ============================================================================

CREATE OR REPLACE FUNCTION next_org_sequence(
  p_table_name TEXT,
  p_column_name TEXT,
  p_org_id UUID
) RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  EXECUTE format(
    'SELECT COALESCE(MAX(%I), 0) + 1 FROM %I WHERE organization_id = $1 AND deleted_at IS NULL',
    p_column_name, p_table_name
  ) INTO next_val USING p_org_id;
  RETURN next_val;
END;
$$ LANGUAGE plpgsql;

-- Auto-set estimate_number
CREATE OR REPLACE FUNCTION set_estimate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estimate_number IS NULL THEN
    NEW.estimate_number := next_org_sequence('estimates', 'estimate_number', NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_estimate_number
  BEFORE INSERT ON estimates
  FOR EACH ROW EXECUTE FUNCTION set_estimate_number();

-- Auto-set project_number
CREATE OR REPLACE FUNCTION set_project_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_number IS NULL THEN
    NEW.project_number := next_org_sequence('projects', 'project_number', NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_project_number
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION set_project_number();

-- Auto-set invoice_number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := next_org_sequence('invoices', 'invoice_number', NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_invoice_number();

-- Auto-set po_number (purchase_orders needs org_id via project)
CREATE OR REPLACE FUNCTION set_po_number()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
BEGIN
  IF NEW.po_number IS NULL THEN
    SELECT organization_id INTO v_org_id FROM projects WHERE id = NEW.project_id;
    NEW.po_number := (
      SELECT COALESCE(MAX(po.po_number), 0) + 1
      FROM purchase_orders po
      JOIN projects p ON po.project_id = p.id
      WHERE p.organization_id = v_org_id AND po.deleted_at IS NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_po_number
  BEFORE INSERT ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION set_po_number();

-- Auto-set change_order_number (scoped to project, not org)
CREATE OR REPLACE FUNCTION set_change_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.change_order_number IS NULL THEN
    SELECT COALESCE(MAX(change_order_number), 0) + 1
    INTO NEW.change_order_number
    FROM change_orders
    WHERE project_id = NEW.project_id AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_change_order_number
  BEFORE INSERT ON change_orders
  FOR EACH ROW EXECUTE FUNCTION set_change_order_number();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Helper function: get the current user's organization_id from auth.uid()
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables and create org-scoped policies

-- organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = auth_user_org_id());
CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (id = auth_user_org_id());

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view members of their organization"
  ON users FOR SELECT
  USING (organization_id = auth_user_org_id());
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "Admins can insert users in their org"
  ON users FOR INSERT
  WITH CHECK (organization_id = auth_user_org_id());

-- Macro to enable RLS with org-scoped policies for tables with organization_id
-- We'll do them individually since SQL doesn't have macros

-- contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON contacts FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- lead_pipeline_stages
ALTER TABLE lead_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON lead_pipeline_stages FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- lead_stage_history (org via contact)
ALTER TABLE lead_stage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON lead_stage_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      WHERE c.id = lead_stage_history.contact_id
      AND c.organization_id = auth_user_org_id()
    )
  );

-- interactions (org via contact)
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON interactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      WHERE c.id = interactions.contact_id
      AND c.organization_id = auth_user_org_id()
    )
  );

-- follow_up_sequences
ALTER TABLE follow_up_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON follow_up_sequences FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- web_lead_forms
ALTER TABLE web_lead_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON web_lead_forms FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- cost_catalog
ALTER TABLE cost_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON cost_catalog FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- cost_groups
ALTER TABLE cost_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON cost_groups FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON projects FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- estimates
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON estimates FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- estimate_sections (org via estimate)
ALTER TABLE estimate_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON estimate_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM estimates e
      WHERE e.id = estimate_sections.estimate_id
      AND e.organization_id = auth_user_org_id()
    )
  );

-- estimate_line_items (org via section -> estimate)
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON estimate_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM estimate_sections es
      JOIN estimates e ON e.id = es.estimate_id
      WHERE es.id = estimate_line_items.section_id
      AND e.organization_id = auth_user_org_id()
    )
  );

-- project_budget_items (org via project)
ALTER TABLE project_budget_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON project_budget_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_budget_items.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- tasks (org via project)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- daily_logs (org via project)
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON daily_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_logs.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- time_entries (org via project)
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON time_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = time_entries.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- change_orders (org via project)
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON change_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = change_orders.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- permits (org via project)
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON permits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = permits.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- inspections (org via project)
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON inspections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = inspections.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON invoices FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- invoice_line_items (org via invoice)
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON invoice_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_line_items.invoice_id
      AND i.organization_id = auth_user_org_id()
    )
  );

-- payments (org via invoice)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = payments.invoice_id
      AND i.organization_id = auth_user_org_id()
    )
  );

-- purchase_orders (org via project)
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON purchase_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = purchase_orders.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- po_line_items (org via purchase_order -> project)
ALTER TABLE po_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON po_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM purchase_orders po
      JOIN projects p ON p.id = po.project_id
      WHERE po.id = po_line_items.purchase_order_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- bid_requests (org via project)
ALTER TABLE bid_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON bid_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = bid_requests.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- bid_responses (org via bid_request -> project)
ALTER TABLE bid_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON bid_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bid_requests br
      JOIN projects p ON p.id = br.project_id
      WHERE br.id = bid_responses.bid_request_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON documents FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- photo_annotations (org via document)
ALTER TABLE photo_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON photo_annotations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = photo_annotations.document_id
      AND d.organization_id = auth_user_org_id()
    )
  );

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON messages FOR ALL
  USING (organization_id = auth_user_org_id())
  WITH CHECK (organization_id = auth_user_org_id());

-- notifications (user-scoped)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid());

-- subcontractor_profiles (org via contact)
ALTER TABLE subcontractor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON subcontractor_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contacts c
      WHERE c.id = subcontractor_profiles.contact_id
      AND c.organization_id = auth_user_org_id()
    )
  );

-- subcontractor_reviews (org via subcontractor_profile -> contact)
ALTER TABLE subcontractor_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON subcontractor_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM subcontractor_profiles sp
      JOIN contacts c ON c.id = sp.contact_id
      WHERE sp.id = subcontractor_reviews.subcontractor_profile_id
      AND c.organization_id = auth_user_org_id()
    )
  );

-- warranties (org via project)
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON warranties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = warranties.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- warranty_claims (org via warranty -> project)
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON warranty_claims FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM warranties w
      JOIN projects p ON p.id = w.project_id
      WHERE w.id = warranty_claims.warranty_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- client_satisfaction_surveys (org via project)
ALTER TABLE client_satisfaction_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org isolation" ON client_satisfaction_surveys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = client_satisfaction_surveys.project_id
      AND p.organization_id = auth_user_org_id()
    )
  );

-- ============================================================================
-- DONE
-- ============================================================================
