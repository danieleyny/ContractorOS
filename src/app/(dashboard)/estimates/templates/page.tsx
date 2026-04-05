'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout,
  Edit,
  Trash2,
  Clock,
  Layers,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';

// ============================================================================
// Mock Data
// ============================================================================

interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  sectionCount: number;
  lastUsed: string | null;
  lastUsedLabel: string;
  itemCount: number;
  totalEstimates: number;
}

const MOCK_TEMPLATES: EstimateTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Kitchen Remodel Standard',
    description:
      'Full kitchen remodel including demo, framing, electrical, plumbing, cabinetry, countertops, appliances, flooring, and paint.',
    sectionCount: 12,
    lastUsed: '2026-04-01',
    lastUsedLabel: '3 days ago',
    itemCount: 48,
    totalEstimates: 15,
  },
  {
    id: 'tmpl-002',
    name: 'Bathroom Full Renovation',
    description:
      'Complete bathroom renovation with demo, plumbing rough-in, tile, vanity, fixtures, electrical, and finishes.',
    sectionCount: 8,
    lastUsed: '2026-03-28',
    lastUsedLabel: '1 week ago',
    itemCount: 32,
    totalEstimates: 9,
  },
  {
    id: 'tmpl-003',
    name: 'Deck Construction',
    description:
      'New deck construction including footings, framing, decking, railing, stairs, and staining.',
    sectionCount: 6,
    lastUsed: '2026-03-20',
    lastUsedLabel: '2 weeks ago',
    itemCount: 22,
    totalEstimates: 7,
  },
  {
    id: 'tmpl-004',
    name: 'Basement Finishing',
    description:
      'Full basement finish with framing, insulation, electrical, plumbing, HVAC, drywall, flooring, trim, and painting.',
    sectionCount: 10,
    lastUsed: null,
    lastUsedLabel: 'Never used',
    itemCount: 42,
    totalEstimates: 0,
  },
];

// ============================================================================
// Component
// ============================================================================

export default function EstimateTemplatesPage() {
  const router = useRouter();

  const handleUseTemplate = (templateId: string) => {
    // In production, this would create a new estimate from the template
    // and redirect to the builder. For now, redirect to new estimate.
    router.push('/estimates/est-new');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimate Templates"
        description="Reusable estimate templates for common project types"
        breadcrumbs={[
          { label: 'Estimates', href: '/estimates' },
          { label: 'Templates' },
        ]}
        actions={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4" />
            <span>Save any estimate as a template from the estimate builder</span>
          </div>
        }
      />

      {/* Template grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-[#1e3a5f]/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
                  <Layout className="size-5 text-[#1e3a5f]" />
                </div>
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Layers className="size-3" />
                      <span>{template.sectionCount} sections</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>{template.lastUsedLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 size-4" />
                    Edit Template
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{template.itemCount} line items</span>
                <span className="text-foreground/20">|</span>
                <span>Used in {template.totalEstimates} estimates</span>
              </div>
              <Button
                size="sm"
                className="bg-[#e8913a] hover:bg-[#e8913a]/90"
                onClick={() => handleUseTemplate(template.id)}
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state hint */}
      {MOCK_TEMPLATES.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layout className="size-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an estimate and save it as a template to get started.
          </p>
        </div>
      )}
    </div>
  );
}
