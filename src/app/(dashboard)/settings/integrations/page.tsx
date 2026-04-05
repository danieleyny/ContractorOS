'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Plug,
  CreditCard,
  Calendar,
  Zap,
  ExternalLink,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Integration data
// ---------------------------------------------------------------------------
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  connected: boolean;
  actionLabel: string;
}

const defaultIntegrations: Integration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices and expenses',
    icon: CreditCard,
    iconBg: 'bg-[#2CA01C]/10',
    iconColor: 'text-[#2CA01C]',
    connected: false,
    actionLabel: 'Connect',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process online payments',
    icon: CreditCard,
    iconBg: 'bg-[#635BFF]/10',
    iconColor: 'text-[#635BFF]',
    connected: false,
    actionLabel: 'Connect',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync schedules and appointments',
    icon: Calendar,
    iconBg: 'bg-[#4285F4]/10',
    iconColor: 'text-[#4285F4]',
    connected: false,
    actionLabel: 'Connect',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via webhooks',
    icon: Zap,
    iconBg: 'bg-[#FF4A00]/10',
    iconColor: 'text-[#FF4A00]',
    connected: false,
    actionLabel: 'Configure',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);

  const toggleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newConnected = !i.connected;
        toast.success(
          newConnected
            ? `${i.name} connected successfully`
            : `${i.name} disconnected`,
        );
        return {
          ...i,
          connected: newConnected,
          actionLabel: i.id === 'zapier'
            ? 'Configure'
            : newConnected
              ? 'Disconnect'
              : 'Connect',
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect your tools"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="relative overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-5">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${integration.iconBg}`}
                    >
                      <Icon className={`size-5 ${integration.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{integration.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      integration.connected
                        ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20'
                        : 'bg-muted text-muted-foreground border-muted'
                    }
                  >
                    {integration.connected ? (
                      <>
                        <CheckCircle2 className="mr-1 size-3" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Circle className="mr-1 size-3" />
                        Not Connected
                      </>
                    )}
                  </Badge>
                </div>

                {/* Action */}
                <Button
                  variant={integration.connected ? 'outline' : 'default'}
                  className={
                    integration.connected
                      ? ''
                      : 'bg-[#1e3a5f] hover:bg-[#1e3a5f]/90'
                  }
                  onClick={() => toggleConnect(integration.id)}
                >
                  {integration.connected ? (
                    <ExternalLink className="size-4" />
                  ) : (
                    <Plug className="size-4" />
                  )}
                  {integration.actionLabel}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
