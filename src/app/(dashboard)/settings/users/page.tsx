'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Mail, Send } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------
interface TeamMember extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  initials: string;
}

const ROLES = [
  'Owner',
  'Admin',
  'Project Manager',
  'Estimator',
  'Field Crew',
  'Accounting',
  'Sales',
] as const;

const mockUsers: TeamMember[] = [
  {
    id: '1',
    name: 'Michael Torres',
    email: 'michael@acmeconstruction.com',
    role: 'Owner',
    status: 'active',
    lastLogin: 'Apr 4, 2026 9:15 AM',
    initials: 'MT',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@acmeconstruction.com',
    role: 'Project Manager',
    status: 'active',
    lastLogin: 'Apr 3, 2026 4:30 PM',
    initials: 'SC',
  },
  {
    id: '3',
    name: 'James Rivera',
    email: 'james@acmeconstruction.com',
    role: 'Estimator',
    status: 'active',
    lastLogin: 'Apr 2, 2026 11:00 AM',
    initials: 'JR',
  },
  {
    id: '4',
    name: 'Emily Watson',
    email: 'emily@acmeconstruction.com',
    role: 'Accounting',
    status: 'inactive',
    lastLogin: 'Mar 18, 2026 2:45 PM',
    initials: 'EW',
  },
];

// ---------------------------------------------------------------------------
// Invite form schema
// ---------------------------------------------------------------------------
const inviteSchema = z.object({
  email: z.string().email('Valid email required'),
  fullName: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Select a role'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------
const columns: ColumnDef<TeamMember>[] = [
  {
    header: 'Name',
    accessor: 'name',
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-medium">
            {row.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{row.name}</p>
        </div>
      </div>
    ),
  },
  {
    header: 'Email',
    accessor: 'email',
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Mail className="size-3.5" />
        {row.email}
      </div>
    ),
  },
  {
    header: 'Role',
    accessor: 'role',
    sortable: true,
  },
  {
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: 'Last Login',
    accessor: 'lastLogin',
    sortable: true,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: standardSchemaResolver(inviteSchema),
    defaultValues: { email: '', fullName: '', role: '' },
  });

  const onInvite = async (_data: InviteFormData) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Invite sent successfully');
    reset();
    setSelectedRole('');
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        description="Manage your team"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                  <Plus className="size-4" />
                  Invite User
                </Button>
              }
            />

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="invite-name">Full Name</Label>
                  <Input
                    id="invite-name"
                    placeholder="John Doe"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(val) => {
                      const v = val ?? '';
                      setSelectedRole(v);
                      setValue('role', v, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-xs text-destructive">{errors.role.message}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                  >
                    <Send className="size-4" />
                    {isSubmitting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={mockUsers}
        searchable
        searchPlaceholder="Search team members..."
      />
    </div>
  );
}
