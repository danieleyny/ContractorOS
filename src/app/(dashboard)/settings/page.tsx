'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Building2,
  Bell,
  CreditCard,
  Upload,
  Save,
  CheckCircle,
  Crown,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Organization Settings Schema
// ---------------------------------------------------------------------------
const orgSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  taxId: z.string().optional(),
  defaultMarkup: z.number().min(0).max(100).optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
});

type OrgFormData = z.infer<typeof orgSchema>;

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------
const notificationTypes = [
  { key: 'newLead', label: 'New lead assigned' },
  { key: 'estimateViewed', label: 'Estimate viewed' },
  { key: 'estimateApproved', label: 'Estimate approved' },
  { key: 'invoiceOverdue', label: 'Invoice overdue' },
  { key: 'taskDue', label: 'Task due' },
  { key: 'dailyLogReminder', label: 'Daily log reminder' },
  { key: 'documentExpiring', label: 'Document expiring' },
] as const;

type NotificationPrefs = Record<string, { email: boolean; inApp: boolean }>;

function buildDefaultPrefs(): NotificationPrefs {
  const prefs: NotificationPrefs = {};
  for (const t of notificationTypes) {
    prefs[t.key] = { email: true, inApp: true };
  }
  return prefs;
}

// ---------------------------------------------------------------------------
// Organization Tab
// ---------------------------------------------------------------------------
function OrganizationTab() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormData>({
    resolver: standardSchemaResolver(orgSchema),
    defaultValues: {
      companyName: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      licenseNumber: '',
      licenseExpiry: '',
      taxId: '',
      defaultMarkup: 20,
      defaultTaxRate: 8.875,
    },
  });

  const onSubmit = async (_data: OrgFormData) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Settings saved');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" {...register('companyName')} placeholder="Acme Construction LLC" />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} placeholder="(555) 123-4567" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="info@acme.com" />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register('website')} placeholder="https://acme.com" />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" {...register('address')} placeholder="123 Main Street" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} placeholder="New York" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register('state')} placeholder="NY" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input id="zip" {...register('zip')} placeholder="10001" />
          </div>
        </CardContent>
      </Card>

      {/* Licensing & Tax */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Licensing &amp; Tax</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input id="licenseNumber" {...register('licenseNumber')} placeholder="LIC-123456" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="licenseExpiry">License Expiry</Label>
            <Input id="licenseExpiry" type="date" {...register('licenseExpiry')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input id="taxId" {...register('taxId')} placeholder="XX-XXXXXXX" />
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 text-center">
            <div className="space-y-2">
              <Upload className="mx-auto size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drag &amp; drop your logo here</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or SVG up to 2MB</p>
              <Button type="button" variant="outline" size="sm">
                Browse Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Rates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
            <Input
              id="defaultMarkup"
              type="number"
              step="0.01"
              {...register('defaultMarkup')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
            <Input
              id="defaultTaxRate"
              type="number"
              step="0.01"
              {...register('defaultTaxRate')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
          <Save className="size-4" />
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Notifications Tab
// ---------------------------------------------------------------------------
function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(buildDefaultPrefs);

  const toggle = (key: string, channel: 'email' | 'inApp') => {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const handleSave = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_80px_80px] items-center gap-4 pb-2 text-xs font-medium text-muted-foreground">
          <span>Notification Type</span>
          <span className="text-center">Email</span>
          <span className="text-center">In-App</span>
        </div>
        <Separator />

        {notificationTypes.map((n) => (
          <div
            key={n.key}
            className="grid grid-cols-[1fr_80px_80px] items-center gap-4 py-3"
          >
            <span className="text-sm">{n.label}</span>
            <div className="flex justify-center">
              <Switch
                checked={prefs[n.key]?.email}
                onCheckedChange={() => toggle(n.key, 'email')}
              />
            </div>
            <div className="flex justify-center">
              <Switch
                checked={prefs[n.key]?.inApp}
                onCheckedChange={() => toggle(n.key, 'inApp')}
              />
            </div>
          </div>
        ))}

        <Separator />
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
            <Save className="size-4" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Billing Tab
// ---------------------------------------------------------------------------
function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Plan</CardTitle>
            <Badge className="bg-[#e8913a]/10 text-[#e8913a] border-[#e8913a]/20">
              <Crown className="mr-1 size-3" />
              Professional
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-[#1e3a5f]">$49</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-[#1e3a5f]">10</p>
              <p className="text-xs text-muted-foreground">team members</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-[#1e3a5f]">Unlimited</p>
              <p className="text-xs text-muted-foreground">projects</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Next billing date</p>
              <p className="text-sm text-muted-foreground">May 1, 2026</p>
            </div>
            <Button variant="outline" disabled>
              <CreditCard className="size-4" />
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Projects Created', value: '8 / Unlimited' },
              { label: 'Estimates Sent', value: '24' },
              { label: 'Invoices Generated', value: '18' },
              { label: 'Storage Used', value: '1.2 GB / 10 GB' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-medium">{stat.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your organization" />

      <Tabs defaultValue="organization">
        <TabsList>
          <TabsTrigger value="organization">
            <Building2 className="size-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="size-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="pt-4">
          <OrganizationTab />
        </TabsContent>

        <TabsContent value="notifications" className="pt-4">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="billing" className="pt-4">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
