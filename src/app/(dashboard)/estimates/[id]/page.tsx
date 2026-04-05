'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { EstimateBuilder } from '@/components/estimates/EstimateBuilder';

export default function EstimateBuilderPage() {
  const params = useParams();
  const estimateId = params.id as string;

  // In production, this would fetch the estimate by ID.
  // For now, the builder uses its own mock data.
  const isNew = estimateId === 'est-new';

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'New Estimate' : `Estimate #1001`}
        breadcrumbs={[
          { label: 'Estimates', href: '/estimates' },
          {
            label: isNew ? 'New Estimate' : `Estimate #1001`,
          },
        ]}
      />

      <EstimateBuilder
        estimateId={isNew ? undefined : estimateId}
        initialData={
          isNew
            ? {
                name: 'New Estimate',
                status: 'draft',
                contractType: 'fixed_price',
                clientName: '',
                contactId: '',
                sections: [],
                notes: '',
                taxRate: 8,
              }
            : undefined
        }
      />
    </div>
  );
}
