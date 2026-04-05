// ContractorOS TypeScript Types
// All monetary values are stored as integers (cents) in the database.
// Basis points fields (e.g., markup_percentage) use integer representation (2000 = 20.00%).

// ============================================================================
// ENUMS (as union types)
// ============================================================================

export type UserRole =
  | 'owner'
  | 'admin'
  | 'project_manager'
  | 'estimator'
  | 'field_crew'
  | 'accounting'
  | 'sales';

export type ContactType = 'lead' | 'customer' | 'vendor' | 'subcontractor';

export type LeadSource =
  | 'website'
  | 'referral'
  | 'social_media'
  | 'phone'
  | 'email'
  | 'advertising'
  | 'repeat'
  | 'other';

export type LeadTemperature = 'hot' | 'warm' | 'cold' | 'dead';

export type InteractionType =
  | 'phone_call'
  | 'email'
  | 'sms'
  | 'meeting'
  | 'site_visit'
  | 'note'
  | 'form_submission';

export type Direction = 'inbound' | 'outbound';

export type UnitOfMeasure =
  | 'each'
  | 'sqft'
  | 'lnft'
  | 'cuyd'
  | 'hour'
  | 'day'
  | 'lump_sum'
  | 'gallon'
  | 'board_ft';

export type EstimateStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'rejected'
  | 'revised'
  | 'expired';

export type ContractType =
  | 'fixed_price'
  | 'cost_plus'
  | 'time_and_material'
  | 'unit_price';

export type ProjectStatus =
  | 'pre_construction'
  | 'in_progress'
  | 'on_hold'
  | 'punch_list'
  | 'completed'
  | 'closed'
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'cancelled';

export type DelayReason =
  | 'weather'
  | 'material'
  | 'labor'
  | 'inspection'
  | 'client'
  | 'permit'
  | 'other';

export type TimeEntryStatus = 'pending' | 'approved' | 'rejected';

export type ChangeOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected';

export type PermitStatus =
  | 'not_applied'
  | 'applied'
  | 'in_review'
  | 'approved'
  | 'denied'
  | 'expired';

export type InspectionStatus =
  | 'scheduled'
  | 'passed'
  | 'failed'
  | 'rescheduled'
  | 'cancelled';

export type InvoiceType =
  | 'progress'
  | 'final'
  | 'retainage'
  | 'change_order'
  | 'deposit';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'void';

export type PaymentMethod =
  | 'check'
  | 'cash'
  | 'credit_card'
  | 'ach'
  | 'wire'
  | 'stripe'
  | 'other';

export type PaymentTerms =
  | 'due_on_receipt'
  | 'net_15'
  | 'net_30'
  | 'net_45'
  | 'net_60'
  | 'custom';

export type POStatus =
  | 'draft'
  | 'sent'
  | 'acknowledged'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export type BidRequestStatus =
  | 'draft'
  | 'sent'
  | 'responses_received'
  | 'awarded'
  | 'closed';

export type DocumentCategory =
  | 'contract'
  | 'permit'
  | 'insurance'
  | 'photo'
  | 'plan'
  | 'specification'
  | 'invoice'
  | 'receipt'
  | 'license'
  | 'bond'
  | 'warranty'
  | 'other';

export type RecipientType = 'internal' | 'client' | 'vendor' | 'subcontractor';

export type WarrantyType =
  | 'workmanship'
  | 'material'
  | 'equipment'
  | 'manufacturer';

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'claimed';

export type WarrantyClaimStatus =
  | 'reported'
  | 'under_review'
  | 'approved'
  | 'in_progress'
  | 'resolved'
  | 'denied';

// ============================================================================
// TABLE INTERFACES
// ============================================================================

// -- Organization & Users ----------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  license_number: string | null;
  license_expiry: string | null; // DATE
  tax_id: string | null;
  default_markup_percentage: number; // basis points (cents-like integer)
  default_tax_rate: number; // basis points
  fiscal_year_start_month: number;
  subscription_tier: string | null;
  subscription_status: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  hourly_rate: number; // cents
  overtime_rate: number; // cents
  is_active: boolean;
  last_login_at: string | null;
  notification_preferences: Record<string, unknown>;
  permissions: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// -- CRM & Leads -------------------------------------------------------------

export interface Contact {
  id: string;
  organization_id: string;
  type: ContactType;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  source: LeadSource | null;
  source_detail: string | null;
  lead_score: number;
  lead_temperature: LeadTemperature | null;
  assigned_to: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  notes: string | null;
  total_lifetime_value: number; // cents
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LeadPipelineStage {
  id: string;
  organization_id: string;
  name: string;
  display_order: number;
  color: string | null;
  is_won_stage: boolean;
  is_lost_stage: boolean;
  auto_actions: Record<string, unknown>;
  days_until_stale: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LeadStageHistory {
  id: string;
  contact_id: string;
  stage_id: string;
  entered_at: string;
  exited_at: string | null;
  moved_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Interaction {
  id: string;
  contact_id: string;
  type: InteractionType;
  direction: Direction | null;
  subject: string | null;
  body: string | null;
  logged_by: string | null;
  duration_minutes: number | null;
  follow_up_date: string | null; // DATE
  follow_up_completed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FollowUpSequence {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  trigger_stage_id: string | null;
  is_active: boolean;
  steps: unknown[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WebLeadForm {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  fields_config: unknown[];
  assign_to: string | null;
  initial_stage_id: string | null;
  notification_emails: string[];
  confirmation_message: string | null;
  redirect_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// -- Estimating & Cost Management --------------------------------------------

export interface CostCatalog {
  id: string;
  organization_id: string;
  category: string | null;
  subcategory: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  unit_of_measure: UnitOfMeasure | null;
  unit_cost: number; // cents
  markup_percentage: number; // basis points
  preferred_vendor_id: string | null;
  last_price_update: string | null;
  price_history: unknown[];
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CostGroup {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  items: unknown[];
  total_cost: number; // cents
  cascade_updates: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Project {
  id: string;
  organization_id: string;
  contact_id: string;
  estimate_id: string | null;
  project_number: number | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  project_type: string | null;
  priority: Priority;
  job_site_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  job_site_lat: number | null;
  job_site_lng: number | null;
  contract_type: ContractType | null;
  contract_amount: number; // cents
  start_date: string | null; // DATE
  target_end_date: string | null; // DATE
  actual_end_date: string | null; // DATE
  budget_total: number; // cents
  budget_spent: number; // cents
  budget_remaining: number; // cents
  profit_target_percentage: number; // basis points
  actual_profit_percentage: number; // basis points
  assigned_pm: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Estimate {
  id: string;
  organization_id: string;
  project_id: string | null;
  contact_id: string;
  estimate_number: number | null;
  name: string;
  description: string | null;
  status: EstimateStatus;
  version: number;
  parent_estimate_id: string | null;
  valid_until: string | null; // DATE
  contract_type: ContractType | null;
  subtotal: number; // cents
  tax_amount: number; // cents
  total: number; // cents
  markup_percentage: number; // basis points
  profit_margin: number; // basis points
  notes: string | null;
  terms_and_conditions: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  approved_at: string | null;
  approved_signature_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EstimateSection {
  id: string;
  estimate_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_optional: boolean;
  subtotal: number; // cents
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EstimateLineItem {
  id: string;
  section_id: string;
  cost_catalog_id: string | null;
  description: string | null;
  quantity: number;
  unit_of_measure: UnitOfMeasure | null;
  unit_cost: number; // cents
  markup_percentage: number; // basis points
  total_cost: number; // cents
  display_order: number;
  is_visible_to_client: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// -- Project Management ------------------------------------------------------

export interface ProjectBudgetItem {
  id: string;
  project_id: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  budget_amount: number; // cents
  actual_amount: number; // cents
  variance: number; // cents
  cost_catalog_id: string | null;
  vendor_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Task {
  id: string;
  project_id: string;
  parent_task_id: string | null;
  name: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assigned_to: string | null;
  assigned_crew: string[];
  start_date: string | null; // DATE
  end_date: string | null; // DATE
  duration_days: number | null;
  actual_start: string | null; // DATE
  actual_end: string | null; // DATE
  completion_percentage: number;
  dependencies: unknown[];
  display_order: number;
  is_milestone: boolean;
  checklist: unknown[];
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DailyLog {
  id: string;
  project_id: string;
  logged_by: string;
  log_date: string; // DATE
  weather_conditions: string | null;
  temperature_high: number | null; // fahrenheit
  temperature_low: number | null; // fahrenheit
  work_performed: string | null;
  materials_used: string | null;
  visitors: string | null;
  safety_incidents: string | null;
  delays: string | null;
  delay_reason: DelayReason | null;
  crew_on_site: unknown[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TimeEntry {
  id: string;
  project_id: string;
  task_id: string | null;
  user_id: string;
  date: string; // DATE
  start_time: string | null; // TIME
  end_time: string | null; // TIME
  hours: number;
  is_overtime: boolean;
  hourly_rate: number; // cents
  total_cost: number; // cents
  description: string | null;
  status: TimeEntryStatus;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  change_order_number: number | null;
  title: string;
  description: string | null;
  reason: string | null;
  status: ChangeOrderStatus;
  amount: number; // cents (can be negative)
  impact_on_schedule_days: number;
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  line_items: unknown[];
  signature_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Permit {
  id: string;
  project_id: string;
  permit_type: string | null;
  permit_number: string | null;
  status: PermitStatus;
  applied_date: string | null; // DATE
  approved_date: string | null; // DATE
  expiry_date: string | null; // DATE
  issuing_authority: string | null;
  cost: number; // cents
  notes: string | null;
  document_urls: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Inspection {
  id: string;
  project_id: string;
  permit_id: string | null;
  inspection_type: string | null;
  scheduled_date: string | null; // DATE
  actual_date: string | null; // DATE
  status: InspectionStatus;
  inspector_name: string | null;
  result_notes: string | null;
  corrections_required: string | null;
  follow_up_date: string | null; // DATE
  document_urls: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// -- Financial Management ----------------------------------------------------

export interface Invoice {
  id: string;
  organization_id: string;
  project_id: string;
  contact_id: string;
  invoice_number: number | null;
  type: InvoiceType;
  status: InvoiceStatus;
  issue_date: string | null; // DATE
  due_date: string | null; // DATE
  paid_date: string | null; // DATE
  subtotal: number; // cents
  tax_amount: number; // cents
  total: number; // cents
  amount_paid: number; // cents
  balance_due: number; // cents
  payment_terms: PaymentTerms;
  notes: string | null;
  payment_instructions: string | null;
  stripe_invoice_id: string | null;
  pdf_url: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  reminder_sent_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string | null;
  quantity: number;
  unit_price: number; // cents
  total: number; // cents
  budget_item_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number; // cents
  payment_date: string; // DATE
  payment_method: PaymentMethod | null;
  reference_number: string | null;
  stripe_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PurchaseOrder {
  id: string;
  project_id: string;
  vendor_id: string;
  po_number: number | null;
  status: POStatus;
  subtotal: number; // cents
  tax_amount: number; // cents
  total: number; // cents
  expected_delivery_date: string | null; // DATE
  delivery_address: string | null;
  notes: string | null;
  sent_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface POLineItem {
  id: string;
  purchase_order_id: string;
  description: string | null;
  quantity: number;
  unit_price: number; // cents
  total: number; // cents
  quantity_received: number;
  budget_item_id: string | null;
  cost_catalog_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BidRequest {
  id: string;
  project_id: string;
  sent_to: unknown[];
  scope_of_work: string | null;
  due_date: string | null; // DATE
  status: BidRequestStatus;
  attachments: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BidResponse {
  id: string;
  bid_request_id: string;
  vendor_id: string;
  amount: number; // cents
  scope_notes: string | null;
  timeline_days: number | null;
  submitted_at: string | null;
  attachments: string[];
  is_selected: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// -- Documents & Communication -----------------------------------------------

export interface Document {
  id: string;
  organization_id: string;
  project_id: string | null;
  contact_id: string | null;
  uploaded_by: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null; // bytes
  category: DocumentCategory;
  tags: string[];
  is_shared_with_client: boolean;
  expiry_date: string | null; // DATE
  expiry_alert_sent: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PhotoAnnotation {
  id: string;
  document_id: string;
  annotation_data: Record<string, unknown>;
  created_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Message {
  id: string;
  organization_id: string;
  project_id: string | null;
  sender_id: string | null;
  sender_contact_id: string | null;
  recipient_type: RecipientType;
  subject: string | null;
  body: string | null;
  is_read: boolean;
  parent_message_id: string | null;
  attachments: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string | null;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// -- Subcontractor & Vendor Management ---------------------------------------

export interface SubcontractorProfile {
  id: string;
  contact_id: string;
  trade_specialties: string[];
  service_area: string | null;
  insurance_expiry: string | null; // DATE
  license_expiry: string | null; // DATE
  bond_expiry: string | null; // DATE
  insurance_document_id: string | null;
  license_document_id: string | null;
  w9_on_file: boolean;
  average_rating: number | null;
  total_projects_completed: number;
  reliability_score: number | null;
  quality_score: number | null;
  price_competitiveness_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SubcontractorReview {
  id: string;
  subcontractor_profile_id: string;
  project_id: string;
  reviewed_by: string;
  quality_rating: number;
  timeliness_rating: number;
  communication_rating: number;
  price_rating: number;
  overall_rating: number;
  notes: string | null;
  would_hire_again: boolean | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// -- Warranties & Post-Project -----------------------------------------------

export interface Warranty {
  id: string;
  project_id: string;
  warranty_type: WarrantyType;
  description: string | null;
  start_date: string | null; // DATE
  end_date: string | null; // DATE
  coverage_details: string | null;
  manufacturer_name: string | null;
  contact_info: string | null;
  document_id: string | null;
  status: WarrantyStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WarrantyClaim {
  id: string;
  warranty_id: string;
  reported_date: string; // DATE
  description: string | null;
  status: WarrantyClaimStatus;
  resolution_notes: string | null;
  resolved_date: string | null; // DATE
  cost: number; // cents
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClientSatisfactionSurvey {
  id: string;
  project_id: string;
  contact_id: string;
  sent_at: string | null;
  completed_at: string | null;
  overall_rating: number | null;
  quality_rating: number | null;
  communication_rating: number | null;
  timeliness_rating: number | null;
  would_recommend: boolean | null;
  testimonial: string | null;
  permission_to_use_testimonial: boolean;
  follow_up_needed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/** Maps database table names to their TypeScript row types. */
export interface Tables {
  organizations: Organization;
  users: User;
  contacts: Contact;
  lead_pipeline_stages: LeadPipelineStage;
  lead_stage_history: LeadStageHistory;
  interactions: Interaction;
  follow_up_sequences: FollowUpSequence;
  web_lead_forms: WebLeadForm;
  cost_catalog: CostCatalog;
  cost_groups: CostGroup;
  projects: Project;
  estimates: Estimate;
  estimate_sections: EstimateSection;
  estimate_line_items: EstimateLineItem;
  project_budget_items: ProjectBudgetItem;
  tasks: Task;
  daily_logs: DailyLog;
  time_entries: TimeEntry;
  change_orders: ChangeOrder;
  permits: Permit;
  inspections: Inspection;
  invoices: Invoice;
  invoice_line_items: InvoiceLineItem;
  payments: Payment;
  purchase_orders: PurchaseOrder;
  po_line_items: POLineItem;
  bid_requests: BidRequest;
  bid_responses: BidResponse;
  documents: Document;
  photo_annotations: PhotoAnnotation;
  messages: Message;
  notifications: Notification;
  subcontractor_profiles: SubcontractorProfile;
  subcontractor_reviews: SubcontractorReview;
  warranties: Warranty;
  warranty_claims: WarrantyClaim;
  client_satisfaction_surveys: ClientSatisfactionSurvey;
}

/** Insert DTO: omits server-managed fields. */
export type InsertDTO<T> = Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

/** Update DTO: all insertable fields become optional. */
export type UpdateDTO<T> = Partial<InsertDTO<T>>;
