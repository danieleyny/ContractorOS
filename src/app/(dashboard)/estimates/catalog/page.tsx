'use client';

import React from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { CostCatalogManager } from '@/components/estimates/CostCatalogManager';

export default function CostCatalogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Catalog"
        description="Manage your material, labor, and service cost library"
        breadcrumbs={[
          { label: 'Estimates', href: '/estimates' },
          { label: 'Cost Catalog' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="mr-1.5 size-4" />
              Import CSV
            </Button>
            <Button
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
              onClick={() => {
                // Trigger the add dialog inside CostCatalogManager
                document.getElementById('add-catalog-item-trigger')?.click();
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Add Item
            </Button>
          </div>
        }
      />

      <CostCatalogManager />
    </div>
  );
}
