'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Pencil,
  Save,
  Eye,
  EyeOff,
  Clock,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lastModified: string;
}

const MERGE_FIELDS = [
  '{first_name}',
  '{company_name}',
  '{project_name}',
  '{estimate_link}',
  '{invoice_link}',
] as const;

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Estimate Sent',
    subject: 'Your Estimate from {company_name}',
    body: 'Hi {first_name},\n\nThank you for your interest. Please review your estimate for {project_name} using the link below:\n\n{estimate_link}\n\nFeel free to reach out with any questions.\n\nBest regards,\n{company_name}',
    lastModified: 'Apr 1, 2026',
  },
  {
    id: '2',
    name: 'Invoice Sent',
    subject: 'Invoice for {project_name}',
    body: 'Hi {first_name},\n\nPlease find your invoice for {project_name} attached below:\n\n{invoice_link}\n\nPayment is due within 30 days. Thank you for your business.\n\nBest regards,\n{company_name}',
    lastModified: 'Mar 28, 2026',
  },
  {
    id: '3',
    name: 'Follow-Up Reminder',
    subject: 'Following Up - {project_name}',
    body: 'Hi {first_name},\n\nI wanted to follow up regarding {project_name}. Have you had a chance to review our estimate?\n\n{estimate_link}\n\nPlease let me know if you have any questions or would like to discuss further.\n\nBest regards,\n{company_name}',
    lastModified: 'Mar 25, 2026',
  },
  {
    id: '4',
    name: 'Payment Received',
    subject: 'Payment Received - {project_name}',
    body: 'Hi {first_name},\n\nThank you! We have received your payment for {project_name}.\n\nIf you need anything else, please do not hesitate to reach out.\n\nBest regards,\n{company_name}',
    lastModified: 'Mar 22, 2026',
  },
  {
    id: '5',
    name: 'Project Update',
    subject: 'Update on {project_name}',
    body: 'Hi {first_name},\n\nHere is a quick update on {project_name}:\n\n[Add your update here]\n\nPlease feel free to contact us with any questions.\n\nBest regards,\n{company_name}',
    lastModified: 'Mar 20, 2026',
  },
];

// ---------------------------------------------------------------------------
// Template Editor Dialog
// ---------------------------------------------------------------------------
function TemplateEditorDialog({
  template,
  onSave,
}: {
  template: EmailTemplate;
  onSave: (updated: EmailTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [preview, setPreview] = useState(false);

  const insertMergeField = (field: string) => {
    setBody((prev) => prev + field);
  };

  const previewText = (text: string) =>
    text
      .replace(/\{first_name\}/g, 'John')
      .replace(/\{company_name\}/g, 'Acme Construction')
      .replace(/\{project_name\}/g, 'Kitchen Renovation')
      .replace(/\{estimate_link\}/g, 'https://app.example.com/estimate/123')
      .replace(/\{invoice_link\}/g, 'https://app.example.com/invoice/456');

  const handleSave = () => {
    onSave({
      ...template,
      subject,
      body,
      lastModified: 'Apr 4, 2026',
    });
    toast.success(`Template "${template.name}" saved`);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setSubject(template.subject);
          setBody(template.body);
          setPreview(false);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Template: {template.name}</DialogTitle>
          <DialogDescription>
            Customize the subject and body. Use merge fields to personalize emails.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor={`subject-${template.id}`}>Subject Line</Label>
            <Input
              id={`subject-${template.id}`}
              value={preview ? previewText(subject) : subject}
              onChange={(e) => setSubject(e.target.value)}
              readOnly={preview}
              className={preview ? 'bg-muted' : ''}
            />
          </div>

          {/* Merge field buttons */}
          {!preview && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Insert Merge Field</Label>
              <div className="flex flex-wrap gap-1.5">
                {MERGE_FIELDS.map((field) => (
                  <Button
                    key={field}
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => insertMergeField(field)}
                    className="font-mono text-xs"
                  >
                    <Plus className="size-3" />
                    {field}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`body-${template.id}`}>Body</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setPreview(!preview)}
              >
                {preview ? (
                  <>
                    <EyeOff className="size-3" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="size-3" />
                    Preview
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id={`body-${template.id}`}
              rows={10}
              value={preview ? previewText(body) : body}
              onChange={(e) => setBody(e.target.value)}
              readOnly={preview}
              className={`font-mono text-sm ${preview ? 'bg-muted' : ''}`}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
          >
            <Save className="size-4" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TemplatesPage() {
  const [templates, setTemplates] = useState(defaultTemplates);

  const handleSaveTemplate = (updated: EmailTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        description="Customize your email communications"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
                    <FileText className="size-4 text-[#1e3a5f]" />
                  </div>
                  <h3 className="text-sm font-semibold">{template.name}</h3>
                </div>
              </div>

              <p className="line-clamp-2 text-xs text-muted-foreground">
                Subject: {template.subject}
              </p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {template.lastModified}
                </div>
                <TemplateEditorDialog
                  template={template}
                  onSave={handleSaveTemplate}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
